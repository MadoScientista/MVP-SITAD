package cl.sitad.common.dto;

import jakarta.validation.constraints.NotBlank;

public record EstadoUpdateRequest(
    @NotBlank String estado,
    String observacion
) {
    public EstadoUpdateRequest {
        if (estado == null || estado.isBlank()) {
            throw new IllegalArgumentException("estado no puede estar vac\u00EDo");
        }
    }

    public EstadoUpdateRequest(String estado) {
        this(estado, null);
    }
}
