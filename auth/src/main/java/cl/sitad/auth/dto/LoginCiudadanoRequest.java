package cl.sitad.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginCiudadanoRequest(
    @NotBlank
    @Pattern(regexp = "^\\d{7,8}-[\\dKk]$", message = "Formato de RUT inv\u00e1lido (ej: 12345678-9)")
    String rut
) {}
