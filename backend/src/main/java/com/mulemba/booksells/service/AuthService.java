package com.mulemba.booksells.service;

import com.mulemba.booksells.dto.*;
import com.mulemba.booksells.exception.BusinessException;
import com.mulemba.booksells.exception.ResourceNotFoundException;
import com.mulemba.booksells.model.Role;
import com.mulemba.booksells.model.User;
import com.mulemba.booksells.model.enums.UserType;
import com.mulemba.booksells.repository.RoleRepository;
import com.mulemba.booksells.repository.UserRepository;
import com.mulemba.booksells.security.AuthenticatedUser;
import com.mulemba.booksells.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Tentativa de registo iniciada para o e-mail: {}", request.email());
        if (userRepository.existsByEmail(request.email().toLowerCase().trim())) {
            log.warn("Falha no registo: E-mail já registado ({})", request.email());
            throw new BusinessException("E-mail já registado");
        }

        UserType userType = request.userType() != null ? request.userType() : UserType.READER;
        if ((userType == UserType.BOOKSTORE || userType == UserType.PUBLISHER)
                && (request.companyName() == null || request.companyName().isBlank())) {
            log.warn("Falha no registo: Nome da empresa ausente para tipo de utilizador {}", userType);
            throw new BusinessException("Nome da empresa é obrigatório para livrarias e editoras");
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new BusinessException("Role padrão não encontrada"));
        Role sellerRole = roleRepository.findByName("ROLE_SELLER")
                .orElseThrow(() -> new BusinessException("Role de vendedor não encontrada"));

        String id = "usr-" + UUID.randomUUID().toString().substring(0, 8);
        User user = User.builder()
                .name(request.name().trim())
                .email(request.email().toLowerCase().trim())
                .password(passwordEncoder.encode(request.password()))
                .roles(new java.util.HashSet<>(Set.of(userType == UserType.READER ? userRole : sellerRole)))
                .userType(userType)
                .companyName(request.companyName())
                .city(request.city())
                .state(request.state())
                .whatsapp(request.whatsapp())
                .phone(request.phone() != null ? request.phone() : request.whatsapp())
                .avatar("https://api.dicebear.com/7.x/adventurer/svg?seed=" + request.name().trim())
                .memberSince(LocalDate.now())
                .bio(buildDefaultBio(userType, request.name(), request.companyName(), request.city()))
                .enabled(true)
                .build();

        userRepository.save(user);
        log.info("Utilizador registado com sucesso. ID: {}, Tipo: {}", user.getId(), user.getUserType());
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Tentativa de login para o e-mail: {}", request.email());
        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> {
                    log.warn("Falha de login: Utilizador não encontrado para o e-mail ({})", request.email());
                    return new BadCredentialsException("Credenciais inválidas");
                });

        if (!user.isEnabled()) {
            log.warn("Falha de login: Conta desactivada para o e-mail ({})", request.email());
            throw new BusinessException("Conta desactivada");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            log.warn("Falha de login: Palavra-passe incorrecta para o e-mail ({})", request.email());
            throw new BadCredentialsException("Credenciais inválidas");
        }

        log.info("Login com sucesso para o utilizador: {}", user.getId());
        return buildAuthResponse(user);
    }

    public UserResponse getProfile(String userId) {
        return UserResponse.from(findUser(userId));
    }

    @Transactional
    public UserResponse updateProfile(String userId, UpdateProfileRequest request) {
        log.info("A actualizar o perfil do utilizador: {}", userId);
        User user = findUser(userId);

        if (request.name() != null && !request.name().isBlank()) user.setName(request.name().trim());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.avatar() != null) user.setAvatar(request.avatar());
        if (request.companyName() != null) user.setCompanyName(request.companyName());
        if (request.city() != null) user.setCity(request.city());
        if (request.state() != null) user.setState(request.state());
        if (request.phone() != null) user.setPhone(request.phone());
        if (request.whatsapp() != null) user.setWhatsapp(request.whatsapp());
        if (request.website() != null) user.setWebsite(request.website());

        User savedUser = userRepository.save(user);
        log.info("Perfil do utilizador {} actualizado com sucesso", userId);
        return UserResponse.from(savedUser);
    }

    private AuthResponse buildAuthResponse(User user) {
        Collection<? extends GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());

        AuthenticatedUser authUser = new AuthenticatedUser(user.getId(), user.getEmail(), authorities);
        String token = jwtService.generateToken(authUser);
        return new AuthResponse(token, UserResponse.from(user));
    }

    private User findUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizador não encontrado"));
    }

    private String buildDefaultBio(UserType type, String name, String company, String city) {
        return switch (type) {
            case READER -> "Leitor voraz atrás de novas descobertas e livros usados especiais.";
            case BOOKSTORE -> "Livraria especializada trazendo títulos selecionados de " + (city != null ? city : "nossa sede") + ".";
            case PUBLISHER -> "Editora literária comprometida com a curadoria de títulos extraordinários.";
            case AUTHOR -> "Autor independente publicando obras originais directamente aos leitores.";
            case READER_SELLER -> "Leitor e vendedor partilhando a sua colecção de livros físicos e digitais com a comunidade.";
        };
    }
}
