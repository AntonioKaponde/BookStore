package com.mulemba.booksells.controller;

import com.mulemba.booksells.dto.AdminStatsResponse;
import com.mulemba.booksells.dto.OrderResponse;
import com.mulemba.booksells.dto.UserResponse;
import com.mulemba.booksells.service.AdminService;
import com.mulemba.booksells.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        return adminService.getStats();
    }

    @GetMapping("/orders")
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        log.info("REST: Requisição Admin para listar todos os utilizadores");
        return adminService.getAllUsers();
    }

    @PatchMapping("/users/{id}/role")
    public UserResponse updateUserRole(@PathVariable String id, @RequestParam String role) {
        log.info("REST: Requisição Admin para actualizar a role do utilizador {} para {}", id, role);
        return adminService.updateUserRole(id, role);
    }

    @GetMapping("/logs")
    public List<String> getSystemLogs() {
        try {
            Path logPath = Paths.get("logs/application.log");
            if (!Files.exists(logPath)) {
                return Collections.singletonList("O ficheiro de logs ainda não foi gerado ou está vazio.");
            }
            List<String> allLines = Files.readAllLines(logPath);
            int maxLines = 200;
            int startIdx = Math.max(0, allLines.size() - maxLines);
            return allLines.subList(startIdx, allLines.size());
        } catch (IOException e) {
            log.error("Erro ao ler o ficheiro de logs do sistema", e);
            return Collections.singletonList("Erro ao ler os logs do sistema: " + e.getMessage());
        }
    }
}
