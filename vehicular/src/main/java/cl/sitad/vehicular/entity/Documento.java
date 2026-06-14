package cl.sitad.vehicular.entity;

import cl.sitad.vehicular.enums.TipoDocumento;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documentos")
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoDocumento tipo;

    @Column(nullable = false)
    private String archivo;

    @Column(nullable = false)
    private Long solicitudId;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    public Documento() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public TipoDocumento getTipo() { return tipo; }
    public void setTipo(TipoDocumento tipo) { this.tipo = tipo; }
    public String getArchivo() { return archivo; }
    public void setArchivo(String archivo) { this.archivo = archivo; }
    public Long getSolicitudId() { return solicitudId; }
    public void setSolicitudId(Long solicitudId) { this.solicitudId = solicitudId; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
