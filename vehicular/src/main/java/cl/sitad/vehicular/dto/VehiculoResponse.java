package cl.sitad.vehicular.dto;

public record VehiculoResponse(
    Long id,
    String patente,
    String marca,
    String modelo,
    Integer anio,
    String paisMatricula,
    String propietarioRut
) {}
