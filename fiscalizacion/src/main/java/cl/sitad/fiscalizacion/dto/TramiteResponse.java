package cl.sitad.fiscalizacion.dto;

public record TramiteResponse(
    Long id,
    Long vehiculoId,
    String patente,
    String marca,
    String modelo,
    String fechaSalida,
    String fechaRetorno,
    String paisDestino,
    String pasoFronterizo,
    String estado,
    String fechaSolicitud
) {}
