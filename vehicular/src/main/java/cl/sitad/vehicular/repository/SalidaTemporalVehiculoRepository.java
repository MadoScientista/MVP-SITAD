package cl.sitad.vehicular.repository;

import cl.sitad.vehicular.entity.SalidaTemporalVehiculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import cl.sitad.vehicular.enums.EstadoTramite;

public interface SalidaTemporalVehiculoRepository extends JpaRepository<SalidaTemporalVehiculo, Long> {
    List<SalidaTemporalVehiculo> findByVehiculoIdIn(List<Long> vehiculoIds);
    List<SalidaTemporalVehiculo> findByEstado(EstadoTramite estado);
}
