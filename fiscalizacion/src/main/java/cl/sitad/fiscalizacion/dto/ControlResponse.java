package cl.sitad.fiscalizacion.dto;

public record ControlResponse(
    Long id,
    Long solicitudId,
    String fechaControl,
    String resultado,
    String observacion,
    String funcionarioRut
) {}
