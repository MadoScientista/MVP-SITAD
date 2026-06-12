package cl.sitad.vehicular.dto;

public record SolicitudResponse(
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
