package cl.sitad.externo.dto;

public record RegistroCivilVehiculoResponse(
    boolean existe,
    String patente,
    String marca,
    String modelo,
    Integer anio,
    String paisMatricula,
    String propietarioRut,
    String propietarioNombre
) {}
