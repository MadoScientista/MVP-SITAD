package cl.sitad.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginCiudadanoRequest(
    @NotBlank String rut
) {}
