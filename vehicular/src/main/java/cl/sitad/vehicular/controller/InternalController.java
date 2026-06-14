package cl.sitad.vehicular.controller;

import cl.sitad.common.dto.EstadoUpdateRequest;
import cl.sitad.vehicular.dto.SolicitudResponse;
import cl.sitad.vehicular.enums.EstadoTramite;
import cl.sitad.vehicular.service.VehicularService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/vehicular/internal")
public class InternalController {

    private final VehicularService vehicularService;

    public InternalController(VehicularService vehicularService) {
        this.vehicularService = vehicularService;
    }

    @GetMapping("/tramites")
    public ResponseEntity<List<SolicitudResponse>> buscarTramites(
            @RequestParam("estado") Optional<String> estado,
            @RequestParam(value = "conductorRut", required = false) Optional<String> conductorRut,
            @RequestParam(value = "patente", required = false) Optional<String> patente) {
        List<SolicitudResponse> response = vehicularService.buscarTramites(estado, conductorRut, patente);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/tramites/{id}/estado")
    public ResponseEntity<SolicitudResponse> actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody EstadoUpdateRequest request) {
        EstadoTramite nuevoEstado = EstadoTramite.valueOf(request.estado().toUpperCase());
        SolicitudResponse response = vehicularService.actualizarEstadoTramite(id, nuevoEstado, request.observacion());
        return ResponseEntity.ok(response);
    }
}
