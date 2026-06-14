package cl.sitad.vehicular.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DocumentoRequest(
    @NotNull Long solicitudId,
    @NotBlank String nombre,
    @NotBlank String tipo,
    @NotBlank String archivo
) {}
