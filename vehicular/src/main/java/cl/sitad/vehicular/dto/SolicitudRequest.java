package cl.sitad.vehicular.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record SolicitudRequest(
    @NotNull Long vehiculoId,
    @NotBlank String conductorRut,
    @NotBlank String conductorNombre,
    @NotNull Boolean esPropietario,
    String tipoAutorizacion,
    @NotNull LocalDate fechaSalida,
    @NotNull LocalDate fechaRetorno,
    @NotBlank String paisDestino,
    @NotBlank String pasoFronterizo
) {}
