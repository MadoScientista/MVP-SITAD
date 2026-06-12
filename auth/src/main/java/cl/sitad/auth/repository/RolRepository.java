package cl.sitad.auth.repository;

import cl.sitad.auth.entity.Rol;
import cl.sitad.auth.enums.NombreRol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Long> {
    Optional<Rol> findByNombre(NombreRol nombre);
}
