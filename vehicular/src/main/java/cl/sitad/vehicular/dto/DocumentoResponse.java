package cl.sitad.vehicular.dto;

public record DocumentoResponse(
    Long id,
    String nombre,
    String tipo,
    String archivo,
    Long solicitudId,
    String fechaCreacion
) {}
