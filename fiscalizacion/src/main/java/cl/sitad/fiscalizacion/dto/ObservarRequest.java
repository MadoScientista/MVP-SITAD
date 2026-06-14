package cl.sitad.fiscalizacion.dto;

import jakarta.validation.constraints.NotBlank;

public record ObservarRequest(
    @NotBlank String observacion
) {}