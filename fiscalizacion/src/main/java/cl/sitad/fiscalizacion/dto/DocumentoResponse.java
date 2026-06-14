package cl.sitad.fiscalizacion.dto;

public record DocumentoResponse(
    Long id,
    String nombre,
    String tipo,
    String archivo,
    String fechaCreacion
) {}