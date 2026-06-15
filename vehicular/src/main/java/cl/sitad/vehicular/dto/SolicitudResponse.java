package cl.sitad.vehicular.dto;

import java.util.List;

public record SolicitudResponse(
    Long id,
    Long vehiculoId,
    String patente,
    String marca,
    String modelo,
    String conductorRut,
    String conductorNumeroDocumento,
    String conductorNombre,
    String conductorApellidoPaterno,
    String conductorApellidoMaterno,
    Boolean esPropietario,
    String tipoAutorizacion,
    String fechaSalida,
    String fechaRetorno,
    String paisDestino,
    String pasoFronterizo,
    String estado,
    String observacion,
    String fechaSolicitud,
    String fechaEstado,
    List<DocumentoResponse> documentos
) {}
