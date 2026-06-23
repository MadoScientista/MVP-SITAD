package cl.sitad.auth.controller;

import cl.sitad.auth.dto.*;
import cl.sitad.auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final int REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login/ciudadano")
    public ResponseEntity<LoginResponse> loginCiudadano(@Valid @RequestBody LoginCiudadanoRequest request,
                                                         HttpServletResponse response) {
        var tokens = authService.loginCiudadano(request);
        setRefreshTokenCookie(response, tokens.refreshToken());
        return ResponseEntity.ok(new LoginResponse(tokens.accessToken(), tokens.expiresIn()));
    }

    @PostMapping("/login/funcionario")
    public ResponseEntity<LoginResponse> loginFuncionario(@Valid @RequestBody LoginFuncionarioRequest request,
                                                           HttpServletResponse response) {
        var tokens = authService.loginFuncionario(request);
        setRefreshTokenCookie(response, tokens.refreshToken());
        return ResponseEntity.ok(new LoginResponse(tokens.accessToken(), tokens.expiresIn()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        RefreshResponse tokens = authService.refresh(refreshToken);
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(@CookieValue(value = "refreshToken", required = false) String refreshToken,
                                                  HttpServletResponse response) {
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        removeRefreshTokenCookie(response);
        return ResponseEntity.ok(new LogoutResponse("Sesi\u00f3n cerrada correctamente"));
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("refreshToken", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(REFRESH_MAX_AGE);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private void removeRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
