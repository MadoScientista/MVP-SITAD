package cl.sitad.vehicular.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vehiculos")
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String patente;

    @Column(nullable = false)
    private String marca;

    @Column(nullable = false)
    private String modelo;

    @Column(nullable = false)
    private Integer anio;

    @Column(nullable = false)
    private String paisMatricula;

    @Column(nullable = false)
    private String propietarioRut;

    public Vehiculo() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPatente() { return patente; }
    public void setPatente(String patente) { this.patente = patente; }
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }
    public String getPaisMatricula() { return paisMatricula; }
    public void setPaisMatricula(String paisMatricula) { this.paisMatricula = paisMatricula; }
    public String getPropietarioRut() { return propietarioRut; }
    public void setPropietarioRut(String propietarioRut) { this.propietarioRut = propietarioRut; }
}
