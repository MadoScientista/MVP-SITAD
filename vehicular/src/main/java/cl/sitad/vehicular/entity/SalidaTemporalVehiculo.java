package cl.sitad.vehicular.entity;

import cl.sitad.vehicular.enums.EstadoTramite;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "salidas_temporales")
public class SalidaTemporalVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    public SalidaTemporalVehiculo() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Vehiculo getVehiculo() { return vehiculo; }
    public void setVehiculo(Vehiculo vehiculo) { this.vehiculo = vehiculo; }
}
