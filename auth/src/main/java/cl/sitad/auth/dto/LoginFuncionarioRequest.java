package cl.sitad.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginFuncionarioRequest(
    @NotBlank String rut,
    @NotBlank String password
) {}
