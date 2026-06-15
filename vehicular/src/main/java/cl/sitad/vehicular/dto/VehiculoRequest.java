package cl.sitad.vehicular.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VehiculoRequest(
    @NotBlank String patente,
    String numeroChasis,
    @NotBlank String marca,
    @NotBlank String modelo,
    @NotNull Integer anio,
    @NotBlank String paisMatricula,
    String propietarioNombre
) {}
