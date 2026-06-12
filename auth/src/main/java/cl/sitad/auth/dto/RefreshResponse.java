package cl.sitad.auth.dto;

public record RefreshResponse(
    String accessToken,
    long expiresIn
) {}
