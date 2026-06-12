package cl.sitad.fiscalizacion.dto;

import jakarta.validation.constraints.NotBlank;

public record RechazarRequest(
    @NotBlank String observacion
) {}
