package cl.sitad.vehicular.service;

import cl.sitad.vehicular.dto.*;
import cl.sitad.vehicular.entity.Documento;
import cl.sitad.vehicular.entity.SalidaTemporalVehiculo;
import cl.sitad.vehicular.entity.Vehiculo;
import cl.sitad.vehicular.enums.EstadoTramite;
import cl.sitad.vehicular.enums.TipoDocumento;
import cl.sitad.vehicular.repository.DocumentoRepository;
import cl.sitad.vehicular.repository.SalidaTemporalVehiculoRepository;
import cl.sitad.vehicular.repository.VehiculoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class VehicularService {

    private final VehiculoRepository vehiculoRepository;
    private final SalidaTemporalVehiculoRepository salidaRepository;
    private final DocumentoRepository documentoRepository;

    public VehicularService(VehiculoRepository vehiculoRepository,
                            SalidaTemporalVehiculoRepository salidaRepository,
                            DocumentoRepository documentoRepository) {
        this.vehiculoRepository = vehiculoRepository;
        this.salidaRepository = salidaRepository;
        this.documentoRepository = documentoRepository;
    }

    @Transactional
    public VehiculoResponse registrarVehiculo(VehiculoRequest request, String propietarioRut) {
        if (vehiculoRepository.existsByPatente(request.patente().toUpperCase())) {
            throw new IllegalArgumentException("La patente ya est� registrada");
        }

        Vehiculo vehiculo = new Vehiculo();
        vehiculo.setPatente(request.patente().toUpperCase());
        vehiculo.setMarca(request.marca());
        vehiculo.setModelo(request.modelo());
        vehiculo.setAnio(request.anio());
        vehiculo.setPaisMatricula(request.paisMatricula());
        vehiculo.setPropietarioRut(propietarioRut);

        vehiculo = vehiculoRepository.save(vehiculo);
        return toVehiculoResponse(vehiculo);
    }

    @Transactional(readOnly = true)
    public List<VehiculoResponse> listarVehiculos(String propietarioRut) {
        return vehiculoRepository.findByPropietarioRut(propietarioRut)
                .stream()
                .map(this::toVehiculoResponse)
                .toList();
    }

    @Transactional
    public SolicitudResponse solicitarSalidaTemporal(SolicitudRequest request, String rutSolicitante) {
        Vehiculo vehiculo = vehiculoRepository.findById(request.vehiculoId())
                .orElseThrow(() -> new NoSuchElementException("Veh�culo no encontrado"));

        if (!vehiculo.getPropietarioRut().equals(rutSolicitante)) {
            throw new IllegalArgumentException("El veh�culo no pertenece al ciudadano autenticado");
        }

        if (request.fechaRetorno().isBefore(request.fechaSalida())) {
            throw new IllegalArgumentException("La fecha de retorno debe ser posterior a la fecha de salida");
        }

        if (request.fechaSalida().isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("La fecha de salida no puede ser anterior a hoy");
        }

        SalidaTemporalVehiculo solicitud = new SalidaTemporalVehiculo();
        solicitud.setVehiculo(vehiculo);
        solicitud.setFechaSolicitud(LocalDateTime.now());
        solicitud.setFechaSalida(request.fechaSalida());
        solicitud.setFechaRetorno(request.fechaRetorno());
        solicitud.setPaisDestino(request.paisDestino());
        solicitud.setPasoFronterizo(request.pasoFronterizo());
        solicitud.setEstado(EstadoTramite.PRE_VALIDADO_DIGITAL);

        solicitud = salidaRepository.save(solicitud);
        return toSolicitudResponse(solicitud);
    }

    @Transactional(readOnly = true)
    public List<SolicitudResponse> consultarSolicitudes(String rutCiudadano) {
        List<Vehiculo> vehiculos = vehiculoRepository.findByPropietarioRut(rutCiudadano);

        if (vehiculos.isEmpty()) {
            return List.of();
        }

        List<Long> vehiculoIds = vehiculos.stream()
                .map(Vehiculo::getId)
                .toList();

        return salidaRepository.findByVehiculoIdIn(vehiculoIds)
                .stream()
                .map(this::toSolicitudResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SolicitudResponse> buscarTramites(Optional<String> estado) {
        List<SalidaTemporalVehiculo> solicitudes;

        if (estado.isPresent() && !estado.get().isBlank()) {
            EstadoTramite estadoEnum = EstadoTramite.valueOf(estado.get().toUpperCase());
            solicitudes = salidaRepository.findByEstado(estadoEnum);
        } else {
            solicitudes = salidaRepository.findAll();
        }

        return solicitudes.stream().map(this::toSolicitudResponse).toList();
    }

    @Transactional
    public SolicitudResponse actualizarEstadoTramite(Long id, EstadoTramite nuevoEstado) {
        SalidaTemporalVehiculo solicitud = salidaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Tr�mite no encontrado"));
        solicitud.setEstado(nuevoEstado);
        solicitud = salidaRepository.save(solicitud);
        return toSolicitudResponse(solicitud);
    }

    @Transactional
    public DocumentoResponse agregarDocumento(DocumentoRequest request, String rutSolicitante) {
        SalidaTemporalVehiculo solicitud = salidaRepository.findById(request.solicitudId())
                .orElseThrow(() -> new NoSuchElementException("Trámite no encontrado"));

        Vehiculo vehiculo = solicitud.getVehiculo();
        if (!vehiculo.getPropietarioRut().equals(rutSolicitante)) {
            throw new IllegalArgumentException("El trámite no pertenece al ciudadano autenticado");
        }

        TipoDocumento tipo;
        try {
            tipo = TipoDocumento.valueOf(request.tipo().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo de documento inválido: " + request.tipo());
        }

        Documento documento = new Documento();
        documento.setNombre(request.nombre());
        documento.setTipo(tipo);
        documento.setArchivo(request.archivo());
        documento.setSolicitudId(request.solicitudId());
        documento.setFechaCreacion(LocalDateTime.now());

        documento = documentoRepository.save(documento);
        return toDocumentoResponse(documento);
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listarDocumentos(Long solicitudId) {
        return documentoRepository.findBySolicitudId(solicitudId)
                .stream()
                .map(this::toDocumentoResponse)
                .toList();
    }

    private VehiculoResponse toVehiculoResponse(Vehiculo v) {
        return new VehiculoResponse(
                v.getId(), v.getPatente(), v.getMarca(), v.getModelo(),
                v.getAnio(), v.getPaisMatricula(), v.getPropietarioRut());
    }

    private SolicitudResponse toSolicitudResponse(SalidaTemporalVehiculo s) {
        return new SolicitudResponse(
                s.getId(),
                s.getVehiculo().getId(),
                s.getVehiculo().getPatente(),
                s.getVehiculo().getMarca(),
                s.getVehiculo().getModelo(),
                s.getFechaSalida().toString(),
                s.getFechaRetorno().toString(),
                s.getPaisDestino(),
                s.getPasoFronterizo(),
                s.getEstado().name(),
                s.getFechaSolicitud().toString());
    }

    private DocumentoResponse toDocumentoResponse(Documento d) {
        return new DocumentoResponse(
                d.getId(),
                d.getNombre(),
                d.getTipo().name(),
                d.getArchivo(),
                d.getSolicitudId(),
                d.getFechaCreacion().toString());
    }
}
