package cl.sitad.vehicular.controller;

import cl.sitad.vehicular.dto.*;
import cl.sitad.vehicular.service.VehicularService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vehicular")
public class VehicularController {

    private final VehicularService vehicularService;

    public VehicularController(VehicularService vehicularService) {
        this.vehicularService = vehicularService;
    }

    @PostMapping("/vehiculos")
    public ResponseEntity<VehiculoResponse> registrarVehiculo(
            @Valid @RequestBody VehiculoRequest request,
            Authentication authentication) {
        String rut = authentication.getName();
        VehiculoResponse response = vehicularService.registrarVehiculo(request, rut);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/vehiculos")
    public ResponseEntity<List<VehiculoResponse>> listarVehiculos(Authentication authentication) {
        String rut = authentication.getName();
        List<VehiculoResponse> response = vehicularService.listarVehiculos(rut);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vehiculos/{id}")
    public ResponseEntity<VehiculoResponse> obtenerVehiculo(
            @PathVariable Long id,
            Authentication authentication) {
        String rut = authentication.getName();
        VehiculoResponse response = vehicularService.obtenerVehiculo(id, rut);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/vehiculos/{id}")
    public ResponseEntity<VehiculoResponse> actualizarVehiculo(
            @PathVariable Long id,
            @Valid @RequestBody VehiculoRequest request,
            Authentication authentication) {
        String rut = authentication.getName();
        VehiculoResponse response = vehicularService.actualizarVehiculo(id, request, rut);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/vehiculos/{id}")
    public ResponseEntity<Void> eliminarVehiculo(
            @PathVariable Long id,
            Authentication authentication) {
        String rut = authentication.getName();
        vehicularService.eliminarVehiculo(id, rut);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/solicitudes")
    public ResponseEntity<SolicitudResponse> solicitarSalidaTemporal(
            @Valid @RequestBody SolicitudRequest request,
            Authentication authentication) {
        String rut = authentication.getName();
        SolicitudResponse response = vehicularService.solicitarSalidaTemporal(request, rut);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/solicitudes/{id}")
    public ResponseEntity<SolicitudResponse> actualizarSolicitud(
            @PathVariable Long id,
            @Valid @RequestBody SolicitudRequest request,
            Authentication authentication) {
        String rut = authentication.getName();
        SolicitudResponse response = vehicularService.actualizarSolicitud(id, request, rut);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/solicitudes")
    public ResponseEntity<List<SolicitudResponse>> consultarSolicitudes(Authentication authentication) {
        String rut = authentication.getName();
        List<SolicitudResponse> response = vehicularService.consultarSolicitudes(rut);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/solicitudes/{id}")
    public ResponseEntity<SolicitudResponse> obtenerSolicitud(@PathVariable Long id) {
        SolicitudResponse response = vehicularService.obtenerSolicitud(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/documentos")
    public ResponseEntity<DocumentoResponse> agregarDocumento(
            @Valid @RequestBody DocumentoRequest request,
            Authentication authentication) {
        String rut = authentication.getName();
        DocumentoResponse response = vehicularService.agregarDocumento(request, rut);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/solicitudes/{id}/documentos")
    public ResponseEntity<List<DocumentoResponse>> listarDocumentos(@PathVariable Long id) {
        List<DocumentoResponse> response = vehicularService.listarDocumentos(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/solicitudes/{id}/prevalidar")
    public ResponseEntity<SolicitudResponse> prevalidarSolicitud(@PathVariable Long id) {
        SolicitudResponse response = vehicularService.prevalidarSolicitud(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/solicitudes/{id}/qr")
    public ResponseEntity<QrDataResponse> obtenerQrData(@PathVariable Long id) {
        QrDataResponse response = vehicularService.obtenerQrData(id);
        return ResponseEntity.ok(response);
    }
}
