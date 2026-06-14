package cl.sitad.vehicular.repository;

import cl.sitad.vehicular.entity.SalidaTemporalVehiculo;
import cl.sitad.vehicular.enums.EstadoTramite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalidaTemporalVehiculoRepository extends JpaRepository<SalidaTemporalVehiculo, Long> {
    List<SalidaTemporalVehiculo> findByVehiculoIdIn(List<Long> vehiculoIds);
    List<SalidaTemporalVehiculo> findByEstado(EstadoTramite estado);
    List<SalidaTemporalVehiculo> findByConductorRut(String conductorRut);
}
