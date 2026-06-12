package cl.sitad.externo.dto;

import java.util.List;

public record RegistroCivilPersonaResponse(
    boolean existe,
    String rut,
    String nombre,
    String nacionalidad,
    String fechaNacimiento,
    List<VehiculoInfo> vehiculos
) {

    public record VehiculoInfo(
        String patente,
        String marca,
        String modelo,
        Integer anio,
        String paisMatricula
    ) {}
}
