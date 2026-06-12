package cl.sitad.auth.entity;

import cl.sitad.auth.enums.NombreRol;
import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private NombreRol nombre;

    public Rol() {}

    public Rol(NombreRol nombre) {
        this.nombre = nombre;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public NombreRol getNombre() { return nombre; }
    public void setNombre(NombreRol nombre) { this.nombre = nombre; }
}
