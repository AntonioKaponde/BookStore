package com.mulemba.booksells.controller;

import com.mulemba.booksells.dto.*;
import com.mulemba.booksells.security.SecurityUtils;
import com.mulemba.booksells.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        log.info("REST: Requisição para registar novo utilizador: {}", request.email());
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        log.info("REST: Requisição de login para: {}", request.email());
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me() {
        String userId = SecurityUtils.getCurrentUserId();
        log.info("REST: Requisição para buscar detalhes do perfil do utilizador logado: {}", userId);
        return authService.getProfile(userId);
    }

    @PutMapping("/profile")
    public UserResponse updateProfile(@RequestBody UpdateProfileRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        log.info("REST: Requisição para actualizar o perfil do utilizador logado: {}", userId);
        return authService.updateProfile(userId, request);
    }
}
