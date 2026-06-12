package cl.sitad.fiscalizacion.dto;

import jakarta.validation.constraints.NotBlank;

public record AprobarRequest(
    String observacion
) {}
