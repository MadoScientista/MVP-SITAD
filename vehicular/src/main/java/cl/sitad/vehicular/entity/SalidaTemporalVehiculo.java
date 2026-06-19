package cl.sitad.vehicular.entity;

import cl.sitad.vehicular.enums.EstadoTramite;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "salidas_temporales")
public class SalidaTemporalVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String conductorRut;

    @Column(nullable = false)
    private String conductorNombre;

    @Column
    private String conductorNumeroDocumento;

    @Column
    private String conductorApellidoPaterno;

    @Column
    private String conductorApellidoMaterno;

    @Column(nullable = false)
    private Boolean esPropietario;

    @Column
    private String tipoAutorizacion;

    @Column(nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(nullable = false)
    private LocalDate fechaSalida;

    @Column(nullable = false)
    private LocalDate fechaRetorno;

    @Column(nullable = false)
    private String paisDestino;

    @Column(nullable = false)
    private String pasoFronterizo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoTramite estado;

    @Column
    private String observacion;

    @Column
    private String codigoAprobacion;

    @Column(nullable = false)
    private LocalDateTime fechaEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Documento> documentos = new ArrayList<>();

    public SalidaTemporalVehiculo() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getConductorRut() { return conductorRut; }
    public void setConductorRut(String conductorRut) { this.conductorRut = conductorRut; }
    public String getConductorNombre() { return conductorNombre; }
    public void setConductorNombre(String conductorNombre) { this.conductorNombre = conductorNombre; }
    public String getConductorNumeroDocumento() { return conductorNumeroDocumento; }
    public void setConductorNumeroDocumento(String conductorNumeroDocumento) { this.conductorNumeroDocumento = conductorNumeroDocumento; }
    public String getConductorApellidoPaterno() { return conductorApellidoPaterno; }
    public void setConductorApellidoPaterno(String conductorApellidoPaterno) { this.conductorApellidoPaterno = conductorApellidoPaterno; }
    public String getConductorApellidoMaterno() { return conductorApellidoMaterno; }
    public void setConductorApellidoMaterno(String conductorApellidoMaterno) { this.conductorApellidoMaterno = conductorApellidoMaterno; }
    public Boolean getEsPropietario() { return esPropietario; }
    public void setEsPropietario(Boolean esPropietario) { this.esPropietario = esPropietario; }
    public String getTipoAutorizacion() { return tipoAutorizacion; }
    public void setTipoAutorizacion(String tipoAutorizacion) { this.tipoAutorizacion = tipoAutorizacion; }
    public LocalDateTime getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(LocalDateTime fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }
    public LocalDate getFechaSalida() { return fechaSalida; }
    public void setFechaSalida(LocalDate fechaSalida) { this.fechaSalida = fechaSalida; }
    public LocalDate getFechaRetorno() { return fechaRetorno; }
    public void setFechaRetorno(LocalDate fechaRetorno) { this.fechaRetorno = fechaRetorno; }
    public String getPaisDestino() { return paisDestino; }
    public void setPaisDestino(String paisDestino) { this.paisDestino = paisDestino; }
    public String getPasoFronterizo() { return pasoFronterizo; }
    public void setPasoFronterizo(String pasoFronterizo) { this.pasoFronterizo = pasoFronterizo; }
    public EstadoTramite getEstado() { return estado; }
    public void setEstado(EstadoTramite estado) { this.estado = estado; }
    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
    public String getCodigoAprobacion() { return codigoAprobacion; }
    public void setCodigoAprobacion(String codigoAprobacion) { this.codigoAprobacion = codigoAprobacion; }
    public LocalDateTime getFechaEstado() { return fechaEstado; }
    public void setFechaEstado(LocalDateTime fechaEstado) { this.fechaEstado = fechaEstado; }
    public Vehiculo getVehiculo() { return vehiculo; }
    public void setVehiculo(Vehiculo vehiculo) { this.vehiculo = vehiculo; }
    public List<Documento> getDocumentos() { return documentos; }
    public void setDocumentos(List<Documento> documentos) { this.documentos = documentos; }
}
