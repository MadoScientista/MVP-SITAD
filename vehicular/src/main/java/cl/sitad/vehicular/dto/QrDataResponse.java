package cl.sitad.vehicular.dto;

public record QrDataResponse(
    Long id,
    String codigoAprobacion,
    String patente,
    String marca,
    String modelo,
    String conductorRut,
    String conductorNombre,
    String conductorApellidoPaterno,
    String conductorApellidoMaterno,
    String fechaSalida,
    String fechaRetorno,
    String paisDestino,
    String pasoFronterizo
) {}