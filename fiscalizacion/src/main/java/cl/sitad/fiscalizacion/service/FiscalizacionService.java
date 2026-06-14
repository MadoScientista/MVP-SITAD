package cl.sitad.fiscalizacion.service;

import cl.sitad.common.dto.EstadoUpdateRequest;
import cl.sitad.fiscalizacion.dto.ControlResponse;
import cl.sitad.fiscalizacion.dto.TramiteResponse;
import cl.sitad.fiscalizacion.entity.ControlVentanilla;
import cl.sitad.fiscalizacion.feign.VehicularServiceClient;
import cl.sitad.fiscalizacion.repository.ControlVentanillaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FiscalizacionService {

    private final VehicularServiceClient vehicularClient;
    private final ControlVentanillaRepository controlRepository;

    public FiscalizacionService(VehicularServiceClient vehicularClient,
                                ControlVentanillaRepository controlRepository) {
        this.vehicularClient = vehicularClient;
        this.controlRepository = controlRepository;
    }

    public List<TramiteResponse> buscarTramites(String estado) {
        return vehicularClient.buscarTramites(estado != null ? estado : "", null, null);
    }

    @Transactional
    public ControlResponse aprobarTramite(Long solicitudId, String observacion, String funcionarioRut) {
        vehicularClient.actualizarEstado(
                solicitudId, new EstadoUpdateRequest("APROBADO_EN_VENTANILLA"));

        ControlVentanilla control = new ControlVentanilla();
        control.setSolicitudId(solicitudId);
        control.setFechaControl(LocalDateTime.now());
        control.setResultado("APROBADO");
        control.setObservacion(observacion);
        control.setFuncionarioRut(funcionarioRut);

        control = controlRepository.save(control);
        return toControlResponse(control);
    }

    @Transactional
    public ControlResponse rechazarTramite(Long solicitudId, String observacion, String funcionarioRut) {
        vehicularClient.actualizarEstado(
                solicitudId, new EstadoUpdateRequest("RECHAZADO"));

        ControlVentanilla control = new ControlVentanilla();
        control.setSolicitudId(solicitudId);
        control.setFechaControl(LocalDateTime.now());
        control.setResultado("RECHAZADO");
        control.setObservacion(observacion);
        control.setFuncionarioRut(funcionarioRut);

        control = controlRepository.save(control);
        return toControlResponse(control);
    }

    @Transactional
    public ControlResponse observarTramite(Long solicitudId, String observacion, String funcionarioRut) {
        vehicularClient.actualizarEstado(
                solicitudId, new EstadoUpdateRequest("OBSERVADO", observacion));

        ControlVentanilla control = new ControlVentanilla();
        control.setSolicitudId(solicitudId);
        control.setFechaControl(LocalDateTime.now());
        control.setResultado("OBSERVADO");
        control.setObservacion(observacion);
        control.setFuncionarioRut(funcionarioRut);

        control = controlRepository.save(control);
        return toControlResponse(control);
    }

    private ControlResponse toControlResponse(ControlVentanilla c) {
        return new ControlResponse(
                c.getId(), c.getSolicitudId(), c.getFechaControl().toString(),
                c.getResultado(), c.getObservacion(), c.getFuncionarioRut());
    }
}
