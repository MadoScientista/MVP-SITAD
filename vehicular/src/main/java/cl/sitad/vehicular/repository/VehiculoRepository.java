package cl.sitad.vehicular.repository;

import cl.sitad.vehicular.entity.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {
    List<Vehiculo> findByPropietarioRut(String propietarioRut);
    Optional<Vehiculo> findByPatente(String patente);
    boolean existsByPatente(String patente);
}
