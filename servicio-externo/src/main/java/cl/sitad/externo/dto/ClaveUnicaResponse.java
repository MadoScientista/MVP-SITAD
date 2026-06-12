package cl.sitad.externo.dto;

public record ClaveUnicaResponse(
    boolean valido,
    String rut,
    String nombre,
    String email
) {}
