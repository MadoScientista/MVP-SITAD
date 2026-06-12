package cl.sitad.common.dto;

import jakarta.validation.constraints.NotBlank;

public record EstadoUpdateRequest(
    @NotBlank String estado
) {}
