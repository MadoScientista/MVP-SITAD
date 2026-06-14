package cl.sitad.fiscalizacion.controller;

import cl.sitad.fiscalizacion.dto.*;
import cl.sitad.fiscalizacion.service.FiscalizacionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fiscalizacion")
public class FiscalizacionController {

    private final FiscalizacionService fiscalizacionService;

    public FiscalizacionController(FiscalizacionService fiscalizacionService) {
        this.fiscalizacionService = fiscalizacionService;
    }

    @GetMapping("/tramites")
    public ResponseEntity<List<TramiteResponse>> buscarTramites(
            @RequestParam(value = "estado", required = false) String estado) {
        List<TramiteResponse> response = fiscalizacionService.buscarTramites(estado);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tramites/{id}/aprobar")
    public ResponseEntity<ControlResponse> aprobarTramite(
            @PathVariable Long id,
            @Valid @RequestBody AprobarRequest request,
            Authentication authentication) {
        String funcionarioRut = authentication.getName();
        ControlResponse response = fiscalizacionService.aprobarTramite(id, request.observacion(), funcionarioRut);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tramites/{id}/rechazar")
    public ResponseEntity<ControlResponse> rechazarTramite(
            @PathVariable Long id,
            @Valid @RequestBody RechazarRequest request,
            Authentication authentication) {
        String funcionarioRut = authentication.getName();
        ControlResponse response = fiscalizacionService.rechazarTramite(id, request.observacion(), funcionarioRut);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tramites/{id}/observar")
    public ResponseEntity<ControlResponse> observarTramite(
            @PathVariable Long id,
            @Valid @RequestBody ObservarRequest request,
            Authentication authentication) {
        String funcionarioRut = authentication.getName();
        ControlResponse response = fiscalizacionService.observarTramite(id, request.observacion(), funcionarioRut);
        return ResponseEntity.ok(response);
    }
}
