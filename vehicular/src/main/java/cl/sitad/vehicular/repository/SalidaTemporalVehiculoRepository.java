package cl.sitad.vehicular.repository;

import cl.sitad.vehicular.entity.SalidaTemporalVehiculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalidaTemporalVehiculoRepository extends JpaRepository<SalidaTemporalVehiculo, Long> {
    List<SalidaTemporalVehiculo> findByVehiculoIdIn(List<Long> vehiculoIds);
}
