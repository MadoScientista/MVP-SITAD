package cl.sitad.vehicular.dto;

import jakarta.validation.constraints.NotBlank;

public record EstadoUpdateRequest(
    @NotBlank String estado
) {}
