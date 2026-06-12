package cl.sitad.auth.feign;

public record ClaveUnicaResponse(
    boolean valido,
    String rut,
    String nombre,
    String email
) {}
