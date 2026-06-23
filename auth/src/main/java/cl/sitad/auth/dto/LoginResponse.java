package cl.sitad.auth.dto;

public record LoginResponse(
    String accessToken,
    long expiresIn
) {}
