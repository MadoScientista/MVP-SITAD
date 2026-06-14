package cl.sitad.fiscalizacion.repository;

import cl.sitad.fiscalizacion.entity.ControlVentanilla;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ControlVentanillaRepository extends JpaRepository<ControlVentanilla, Long> {
    List<ControlVentanilla> findBySolicitudIdOrderByFechaControlDesc(Long solicitudId);
}
