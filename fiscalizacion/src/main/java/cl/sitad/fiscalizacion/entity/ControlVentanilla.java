package cl.sitad.fiscalizacion.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "controles_ventanilla")
public class ControlVentanilla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long solicitudId;

    @Column(nullable = false)
    private LocalDateTime fechaControl;

    @Column(nullable = false)
    private String resultado;

    @Column(columnDefinition = "TEXT")
    private String observacion;

    @Column(nullable = false)
    private String funcionarioRut;

    public ControlVentanilla() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSolicitudId() { return solicitudId; }
    public void setSolicitudId(Long solicitudId) { this.solicitudId = solicitudId; }
    public LocalDateTime getFechaControl() { return fechaControl; }
    public void setFechaControl(LocalDateTime fechaControl) { this.fechaControl = fechaControl; }
    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }
    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
    public String getFuncionarioRut() { return funcionarioRut; }
    public void setFuncionarioRut(String funcionarioRut) { this.funcionarioRut = funcionarioRut; }
}
