package cl.sitad.auth.dto;

public record LoginResponse(
    String accessToken,
    String refreshToken,
    long expiresIn
) {}
