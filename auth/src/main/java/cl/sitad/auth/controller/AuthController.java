package cl.sitad.auth.controller;

import cl.sitad.auth.dto.*;
import cl.sitad.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login/ciudadano")
    public ResponseEntity<LoginResponse> loginCiudadano(@Valid @RequestBody LoginCiudadanoRequest request) {
        LoginResponse response = authService.loginCiudadano(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login/funcionario")
    public ResponseEntity<LoginResponse> loginFuncionario(@Valid @RequestBody LoginFuncionarioRequest request) {
        LoginResponse response = authService.loginFuncionario(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        RefreshResponse response = authService.refresh(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(@Valid @RequestBody RefreshRequest request) {
        LogoutResponse response = authService.logout(request);
        return ResponseEntity.ok(response);
    }
}
