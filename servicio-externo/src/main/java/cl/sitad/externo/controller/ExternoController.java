package cl.sitad.externo.controller;

import cl.sitad.externo.dto.ClaveUnicaResponse;
import cl.sitad.externo.dto.RegistroCivilPersonaResponse;
import cl.sitad.externo.dto.RegistroCivilVehiculoResponse;
import cl.sitad.externo.service.SimulacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/externo")
public class ExternoController {

    private final SimulacionService simulacionService;

    public ExternoController(SimulacionService simulacionService) {
        this.simulacionService = simulacionService;
    }

    @GetMapping("/claveunica/validar")
    public ResponseEntity<ClaveUnicaResponse> validarClaveUnica(@RequestParam("rut") String rut) {
        ClaveUnicaResponse response = simulacionService.validarClaveUnica(rut);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/registro-civil/persona")
    public ResponseEntity<RegistroCivilPersonaResponse> consultarPersona(@RequestParam("rut") String rut) {
        RegistroCivilPersonaResponse response = simulacionService.consultarPersona(rut);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/registro-civil/vehiculo")
    public ResponseEntity<RegistroCivilVehiculoResponse> consultarVehiculo(@RequestParam("patente") String patente) {
        RegistroCivilVehiculoResponse response = simulacionService.consultarVehiculo(patente);
        return ResponseEntity.ok(response);
    }
}
