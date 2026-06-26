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
import java.util.UUID;
import java.util.stream.Stream;

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
            throw new IllegalArgumentException("La patente ya est\u00E1 registrada");
        }

        Vehiculo vehiculo = new Vehiculo();
        vehiculo.setPatente(request.patente().toUpperCase());
        vehiculo.setMarca(request.marca());
        vehiculo.setModelo(request.modelo());
        vehiculo.setAnio(request.anio());
        vehiculo.setPaisMatricula(request.paisMatricula());
        vehiculo.setNumeroChasis(request.numeroChasis());
        vehiculo.setPropietarioNombre(request.propietarioNombre());
        vehiculo.setPropietarioRut(propietarioRut);

        vehiculo = vehiculoRepository.save(vehiculo);
        return toVehiculoResponse(vehiculo);
    }

    @Transactional(readOnly = true)
    public VehiculoResponse obtenerVehiculo(Long id, String rut) {
        Vehiculo vehiculo = vehiculoRepository.findByIdAndPropietarioRut(id, rut)
            .orElseThrow(() -> new NoSuchElementException("Vehículo no encontrado o no pertenece al usuario"));
        return toVehiculoResponse(vehiculo);
    }

    @Transactional
    public VehiculoResponse actualizarVehiculo(Long id, VehiculoRequest request, String rut) {
        Vehiculo vehiculo = vehiculoRepository.findByIdAndPropietarioRut(id, rut)
            .orElseThrow(() -> new NoSuchElementException("Vehículo no encontrado o no pertenece al usuario"));

        if (!vehiculo.getPatente().equals(request.patente().toUpperCase())
            && vehiculoRepository.existsByPatente(request.patente().toUpperCase())) {
            throw new IllegalArgumentException("La patente ya está registrada por otro vehículo");
        }

        vehiculo.setPatente(request.patente().toUpperCase());
        vehiculo.setNumeroChasis(request.numeroChasis());
        vehiculo.setMarca(request.marca());
        vehiculo.setModelo(request.modelo());
        vehiculo.setAnio(request.anio());
        vehiculo.setPaisMatricula(request.paisMatricula());
        vehiculo.setPropietarioNombre(request.propietarioNombre());

        vehiculo = vehiculoRepository.save(vehiculo);
        return toVehiculoResponse(vehiculo);
    }

    @Transactional
    public void eliminarVehiculo(Long id, String rut) {
        Vehiculo vehiculo = vehiculoRepository.findByIdAndPropietarioRut(id, rut)
            .orElseThrow(() -> new NoSuchElementException("Vehículo no encontrado o no pertenece al usuario"));
        vehiculoRepository.delete(vehiculo);
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
                .orElseThrow(() -> new NoSuchElementException("Veh\u00EDculo no encontrado"));

        if (request.fechaRetorno().isBefore(request.fechaSalida())) {
            throw new IllegalArgumentException("La fecha de retorno no puede ser anterior a la fecha de salida");
        }

        if (request.fechaSalida().isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("La fecha de salida no puede ser anterior a hoy");
        }

        if (!request.esPropietario() && (request.tipoAutorizacion() == null || request.tipoAutorizacion().isBlank())) {
            throw new IllegalArgumentException("Debe indicar el tipo de autorizaci\u00F3n si el conductor no es el propietario");
        }

        SalidaTemporalVehiculo solicitud = new SalidaTemporalVehiculo();
        solicitud.setVehiculo(vehiculo);
        solicitud.setConductorRut(request.conductorRut());
        solicitud.setConductorNombre(request.conductorNombre());
        solicitud.setConductorNumeroDocumento(request.conductorNumeroDocumento());
        solicitud.setConductorApellidoPaterno(request.conductorApellidoPaterno());
        solicitud.setConductorApellidoMaterno(request.conductorApellidoMaterno());
        solicitud.setEsPropietario(request.esPropietario());
        solicitud.setTipoAutorizacion(request.esPropietario() ? null : request.tipoAutorizacion());
        solicitud.setFechaSolicitud(LocalDateTime.now());
        solicitud.setFechaSalida(request.fechaSalida());
        solicitud.setFechaRetorno(request.fechaRetorno());
        solicitud.setPaisDestino(request.paisDestino());
        solicitud.setPasoFronterizo(request.pasoFronterizo());
        solicitud.setEstado(EstadoTramite.BORRADOR);
        solicitud.setFechaEstado(LocalDateTime.now());

        solicitud = salidaRepository.save(solicitud);
        return toSolicitudResponse(solicitud);
    }

    @Transactional
    public SolicitudResponse actualizarSolicitud(Long id, SolicitudRequest request, String rutSolicitante) {
        SalidaTemporalVehiculo solicitud = salidaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Solicitud no encontrada"));

        if (solicitud.getEstado() != EstadoTramite.BORRADOR
                && solicitud.getEstado() != EstadoTramite.OBSERVADO) {
            throw new IllegalStateException("Solo se puede editar una solicitud en estado BORRADOR u OBSERVADO");
        }

        Vehiculo vehiculo = solicitud.getVehiculo();
        if (!vehiculo.getPropietarioRut().equals(rutSolicitante)
                && !solicitud.getConductorRut().equals(rutSolicitante)) {
            throw new IllegalArgumentException("La solicitud no pertenece al ciudadano autenticado");
        }

        if (request.fechaRetorno().isBefore(request.fechaSalida())) {
            throw new IllegalArgumentException("La fecha de retorno no puede ser anterior a la fecha de salida");
        }

        if (request.fechaSalida().isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("La fecha de salida no puede ser anterior a hoy");
        }

        solicitud.setConductorRut(request.conductorRut());
        solicitud.setConductorNumeroDocumento(request.conductorNumeroDocumento());
        solicitud.setConductorNombre(request.conductorNombre());
        solicitud.setConductorApellidoPaterno(request.conductorApellidoPaterno());
        solicitud.setConductorApellidoMaterno(request.conductorApellidoMaterno());
        solicitud.setEsPropietario(request.esPropietario());
        solicitud.setTipoAutorizacion(request.esPropietario() ? null : request.tipoAutorizacion());
        solicitud.setFechaSalida(request.fechaSalida());
        solicitud.setFechaRetorno(request.fechaRetorno());
        solicitud.setPaisDestino(request.paisDestino());
        solicitud.setPasoFronterizo(request.pasoFronterizo());
        solicitud.setFechaEstado(LocalDateTime.now());

        solicitud = salidaRepository.save(solicitud);
        return toSolicitudResponse(solicitud);
    }

    @Transactional(readOnly = true)
    public List<SolicitudResponse> consultarSolicitudes(String rutCiudadano) {
        List<Vehiculo> vehiculos = vehiculoRepository.findByPropietarioRut(rutCiudadano);
        List<Long> vehiculoIds = vehiculos.stream()
                .map(Vehiculo::getId)
                .toList();

        List<SalidaTemporalVehiculo> comoPropietario = vehiculoIds.isEmpty()
                ? List.of()
                : salidaRepository.findByVehiculoIdIn(vehiculoIds);

        List<SalidaTemporalVehiculo> comoConductor = salidaRepository.findByConductorRut(rutCiudadano);

        return Stream.concat(comoPropietario.stream(), comoConductor.stream())
                .distinct()
                .map(this::toSolicitudResponse)
                .toList();
    }

    @Transactional
    public List<SolicitudResponse> buscarTramites(Optional<String> estado, Optional<String> conductorRut, Optional<String> patente, Optional<Long> id) {
        List<SalidaTemporalVehiculo> solicitudes;

        if (id.isPresent()) {
            solicitudes = salidaRepository.findById(id.get()).stream().toList();
        } else if (estado.isPresent() && !estado.get().isBlank()) {
            EstadoTramite estadoEnum = EstadoTramite.valueOf(estado.get().toUpperCase());
            solicitudes = salidaRepository.findByEstado(estadoEnum);
        } else {
            solicitudes = salidaRepository.findAll();
        }

        if (conductorRut.isPresent() && !conductorRut.get().isBlank()) {
            String rut = conductorRut.get();
            solicitudes = solicitudes.stream()
                    .filter(s -> rut.equals(s.getConductorRut()))
                    .toList();
        }

        if (patente.isPresent() && !patente.get().isBlank()) {
            String p = patente.get().toUpperCase();
            solicitudes = solicitudes.stream()
                    .filter(s -> p.equals(s.getVehiculo().getPatente()))
                    .toList();
        }

        solicitudes.forEach(this::asegurarCodigoAprobacion);
        return solicitudes.stream().map(this::toSolicitudResponse).toList();
    }

    @Transactional
    public SolicitudResponse actualizarEstadoTramite(Long id, EstadoTramite nuevoEstado, String observacion) {
        SalidaTemporalVehiculo solicitud = salidaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Tr\u00E1mite no encontrado"));
        solicitud.setEstado(nuevoEstado);
        if (observacion != null) {
            solicitud.setObservacion(observacion);
        }
        if (nuevoEstado == EstadoTramite.PRE_VALIDADO_DIGITAL && solicitud.getCodigoAprobacion() == null) {
            solicitud.setCodigoAprobacion(UUID.randomUUID().toString());
        }
        solicitud.setFechaEstado(LocalDateTime.now());
        solicitud = salidaRepository.save(solicitud);
        return toSolicitudResponse(solicitud);
    }

    @Transactional
    public DocumentoResponse agregarDocumento(DocumentoRequest request, String rutSolicitante) {
        SalidaTemporalVehiculo solicitud = salidaRepository.findById(request.solicitudId())
                .orElseThrow(() -> new NoSuchElementException("Tr\u00E1mite no encontrado"));

        Vehiculo vehiculo = solicitud.getVehiculo();
        if (!vehiculo.getPropietarioRut().equals(rutSolicitante)
                && !solicitud.getConductorRut().equals(rutSolicitante)) {
            throw new IllegalArgumentException("El tr\u00E1mite no pertenece al ciudadano autenticado");
        }

        TipoDocumento tipo;
        try {
            tipo = TipoDocumento.valueOf(request.tipo().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo de documento inv\u00E1lido: " + request.tipo());
        }

        Documento documento = new Documento();
        documento.setNombre(request.nombre());
        documento.setTipo(tipo);
        documento.setArchivo(request.archivo());
        documento.setSolicitud(solicitud);
        documento.setFechaCreacion(LocalDateTime.now());

        documento = documentoRepository.save(documento);

        if (solicitud.getEstado() == EstadoTramite.BORRADOR) {
            solicitud.setEstado(EstadoTramite.PENDIENTE_DOCUMENTACION);
            solicitud.setFechaEstado(LocalDateTime.now());
            salidaRepository.save(solicitud);
        }

        return toDocumentoResponse(documento);
    }

    @Transactional
    public SolicitudResponse prevalidarSolicitud(Long id) {
        SalidaTemporalVehiculo solicitud = salidaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Tr\u00E1mite no encontrado"));

        if (solicitud.getEstado() != EstadoTramite.BORRADOR
                && solicitud.getEstado() != EstadoTramite.PENDIENTE_DOCUMENTACION
                && solicitud.getEstado() != EstadoTramite.OBSERVADO) {
            throw new IllegalStateException("Solo se puede prevalidar una solicitud en estado BORRADOR, PENDIENTE_DOCUMENTACION u OBSERVADO");
        }

        boolean tieneDocumentos = !solicitud.getDocumentos().isEmpty();

        if (solicitud.getFechaRetorno().isBefore(solicitud.getFechaSalida())) {
            throw new IllegalArgumentException("La fecha de retorno no puede ser anterior a la fecha de salida");
        }

        if (tieneDocumentos) {
            solicitud.setEstado(EstadoTramite.PRE_VALIDADO_DIGITAL);
        } else {
            solicitud.setEstado(EstadoTramite.PENDIENTE_DOCUMENTACION);
        }
        solicitud.setFechaEstado(LocalDateTime.now());
        solicitud = salidaRepository.save(solicitud);
        return toSolicitudResponse(solicitud);
    }

    @Transactional
    public SolicitudResponse obtenerSolicitud(Long id) {
        SalidaTemporalVehiculo solicitud = salidaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Solicitud no encontrada"));
        asegurarCodigoAprobacion(solicitud);
        return toSolicitudResponse(solicitud);
    }

    private void asegurarCodigoAprobacion(SalidaTemporalVehiculo solicitud) {
        if ((solicitud.getEstado() == EstadoTramite.PRE_VALIDADO_DIGITAL || solicitud.getEstado() == EstadoTramite.APROBADO_EN_VENTANILLA) && solicitud.getCodigoAprobacion() == null) {
            solicitud.setCodigoAprobacion(UUID.randomUUID().toString());
            salidaRepository.save(solicitud);
        }
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listarDocumentos(Long solicitudId) {
        SalidaTemporalVehiculo solicitud = salidaRepository.findById(solicitudId)
                .orElseThrow(() -> new NoSuchElementException("Tr\u00E1mite no encontrado"));
        return solicitud.getDocumentos().stream()
                .map(this::toDocumentoResponse)
                .toList();
    }

    public QrDataResponse obtenerQrData(Long id) {
        SalidaTemporalVehiculo solicitud = salidaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Tr\u00E1mite no encontrado"));
        if (solicitud.getEstado() != EstadoTramite.PRE_VALIDADO_DIGITAL && solicitud.getEstado() != EstadoTramite.APROBADO_EN_VENTANILLA) {
            throw new IllegalStateException("El tr\u00E1mite no est\u00E1 aprobado");
        }
        if (solicitud.getCodigoAprobacion() == null) {
            throw new IllegalStateException("El tr\u00E1mite no tiene c\u00F3digo de aprobaci\u00F3n");
        }
        return new QrDataResponse(
                solicitud.getId(),
                solicitud.getCodigoAprobacion(),
                solicitud.getVehiculo().getPatente(),
                solicitud.getVehiculo().getMarca(),
                solicitud.getVehiculo().getModelo(),
                solicitud.getConductorRut(),
                solicitud.getConductorNombre(),
                solicitud.getConductorApellidoPaterno(),
                solicitud.getConductorApellidoMaterno(),
                solicitud.getFechaSalida().toString(),
                solicitud.getFechaRetorno().toString(),
                solicitud.getPaisDestino(),
                solicitud.getPasoFronterizo());
    }

    private VehiculoResponse toVehiculoResponse(Vehiculo v) {
        return new VehiculoResponse(
                v.getId(), v.getPatente(), v.getNumeroChasis(), v.getMarca(), v.getModelo(),
                v.getAnio(), v.getPaisMatricula(), v.getPropietarioRut(), v.getPropietarioNombre());
    }

    private SolicitudResponse toSolicitudResponse(SalidaTemporalVehiculo s) {
        List<DocumentoResponse> docs = s.getDocumentos().stream()
                .map(this::toDocumentoResponse)
                .toList();
        return new SolicitudResponse(
                s.getId(),
                s.getVehiculo().getId(),
                s.getVehiculo().getPatente(),
                s.getVehiculo().getMarca(),
                s.getVehiculo().getModelo(),
                s.getConductorRut(),
                s.getConductorNumeroDocumento(),
                s.getConductorNombre(),
                s.getConductorApellidoPaterno(),
                s.getConductorApellidoMaterno(),
                s.getEsPropietario(),
                s.getTipoAutorizacion(),
                s.getFechaSalida().toString(),
                s.getFechaRetorno().toString(),
                s.getPaisDestino(),
                s.getPasoFronterizo(),
                s.getEstado().name(),
                s.getObservacion(),
                s.getCodigoAprobacion(),
                s.getFechaSolicitud().toString(),
                s.getFechaEstado().toString(),
                docs);
    }

    private DocumentoResponse toDocumentoResponse(Documento d) {
        return new DocumentoResponse(
                d.getId(),
                d.getNombre(),
                d.getTipo().name(),
                d.getArchivo(),
                d.getFechaCreacion().toString());
    }
}
