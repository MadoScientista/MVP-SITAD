package cl.sitad.externo.service;

import cl.sitad.externo.dto.ClaveUnicaResponse;
import cl.sitad.externo.dto.RegistroCivilPersonaResponse;
import cl.sitad.externo.dto.RegistroCivilPersonaResponse.VehiculoInfo;
import cl.sitad.externo.dto.RegistroCivilVehiculoResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SimulacionService {

    private final Map<String, PersonaSimulada> personas = new ConcurrentHashMap<>();
    private final Map<String, VehiculoSimulado> vehiculos = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        inicializarDatos();
    }

    public void addPersonaSimulada(String rut, String nombre, String nacionalidad, String fechaNacimiento) {
        personas.put(rut, new PersonaSimulada(rut, nombre, nacionalidad, fechaNacimiento));
    }

    public ClaveUnicaResponse validarClaveUnica(String rut) {
        if (rut == null || !rut.matches("\\d{7,8}-[\\dKk]")) {
            return new ClaveUnicaResponse(false, null, null, null);
        }

        PersonaSimulada persona = personas.get(rut);
        if (persona == null) {
            return new ClaveUnicaResponse(false, null, null, null);
        }

        return new ClaveUnicaResponse(true, rut, persona.nombre(), rut + "@claveunica.cl");
    }

    public RegistroCivilPersonaResponse consultarPersona(String rut) {
        if (rut == null || !rut.matches("\\d{7,8}-[\\dKk]")) {
            return new RegistroCivilPersonaResponse(false, null, null, null, null, List.of());
        }

        PersonaSimulada persona = personas.get(rut);
        if (persona == null) {
            return new RegistroCivilPersonaResponse(false, rut, null, null, null, List.of());
        }

        List<VehiculoInfo> vehiculosPersona = vehiculos.values().stream()
                .filter(v -> v.propietarioRut().equals(rut))
                .map(v -> new VehiculoInfo(v.patente(), v.marca(), v.modelo(), v.anio(), v.paisMatricula()))
                .toList();

        return new RegistroCivilPersonaResponse(
                true, rut, persona.nombre(),
                persona.nacionalidad(), persona.fechaNacimiento(),
                vehiculosPersona);
    }

    public RegistroCivilVehiculoResponse consultarVehiculo(String patente) {
        if (patente == null || patente.isBlank()) {
            return new RegistroCivilVehiculoResponse(false, null, null, null, null, null, null, null);
        }

        VehiculoSimulado vehiculo = vehiculos.get(patente.toUpperCase());
        if (vehiculo == null) {
            return new RegistroCivilVehiculoResponse(false, patente, null, null, null, null, null, null);
        }

        PersonaSimulada propietario = personas.get(vehiculo.propietarioRut());

        return new RegistroCivilVehiculoResponse(
                true, vehiculo.patente(), vehiculo.marca(), vehiculo.modelo(),
                vehiculo.anio(), vehiculo.paisMatricula(),
                vehiculo.propietarioRut(), propietario != null ? propietario.nombre() : "Desconocido");
    }

    private void inicializarDatos() {
        personas.put("12345678-5", new PersonaSimulada("12345678-5", "Juan Pérez González", "Chilena", "15-03-1988"));
        personas.put("98765432-1", new PersonaSimulada("98765432-1", "Marcela Soto López", "Chilena", "02-11-1995"));

        vehiculos.put("ABCD12", new VehiculoSimulado("ABCD12", "Toyota", "Corolla", 2020, "Chile", "12345678-5"));
        vehiculos.put("EFGH34", new VehiculoSimulado("EFGH34", "Hyundai", "Tucson", 2022, "Chile", "12345678-5"));
        vehiculos.put("IJKL56", new VehiculoSimulado("IJKL56", "Mitsubishi", "L200", 2021, "Chile", "98765432-1"));
    }

    private record PersonaSimulada(String rut, String nombre, String nacionalidad, String fechaNacimiento) {}
    private record VehiculoSimulado(String patente, String marca, String modelo, Integer anio, String paisMatricula, String propietarioRut) {}
}
