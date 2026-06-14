package cl.sitad.vehicular.repository;

import cl.sitad.vehicular.entity.Documento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {
    List<Documento> findBySolicitudId(Long solicitudId);
}
