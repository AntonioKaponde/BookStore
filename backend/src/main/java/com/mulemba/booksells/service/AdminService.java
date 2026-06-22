package com.mulemba.booksells.service;

import com.mulemba.booksells.dto.AdminStatsResponse;
import com.mulemba.booksells.model.enums.OrderStatus;
import com.mulemba.booksells.repository.BookRepository;
import com.mulemba.booksells.repository.OrderRepository;
import com.mulemba.booksells.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import com.mulemba.booksells.dto.UserResponse;
import com.mulemba.booksells.model.User;
import com.mulemba.booksells.model.Role;
import com.mulemba.booksells.repository.RoleRepository;
import com.mulemba.booksells.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public AdminStatsResponse getStats() {
        BigDecimal revenue = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(o -> o.getTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pending = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PROCESSING || o.getStatus() == OrderStatus.PENDING)
                .count();

        return new AdminStatsResponse(
                bookRepository.count(),
                orderRepository.count(),
                userRepository.count(),
                revenue,
                pending
        );
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    public UserResponse updateUserRole(String userId, String roleName) {
        log.info("Admin a solicitar actualização da role do utilizador {} para {}", userId, roleName);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("Falha ao actualizar role: Utilizador não encontrado ({})", userId);
                    return new ResourceNotFoundException("User not found");
                });
        
        String targetRoleName = roleName.equalsIgnoreCase("admin") ? "ROLE_ADMIN" : "ROLE_USER";
        Role role = roleRepository.findByName(targetRoleName)
                .orElseThrow(() -> {
                    log.error("Falha ao actualizar role: Role não encontrada ({})", targetRoleName);
                    return new ResourceNotFoundException("Role not found");
                });
                
        user.setRoles(java.util.Set.of(role));
        User savedUser = userRepository.save(user);
        log.info("Role do utilizador {} actualizada com sucesso para {}", userId, targetRoleName);
        return UserResponse.from(savedUser);
    }
}
