package cl.sitad.auth.config;

import cl.sitad.auth.entity.Rol;
import cl.sitad.auth.enums.NombreRol;
import cl.sitad.auth.repository.RolRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(1)
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;

    public DataInitializer(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (rolRepository.count() > 0) {
            return;
        }

        rolRepository.save(new Rol(NombreRol.PASAJERO));
        rolRepository.save(new Rol(NombreRol.FUNCIONARIO));
    }
}
