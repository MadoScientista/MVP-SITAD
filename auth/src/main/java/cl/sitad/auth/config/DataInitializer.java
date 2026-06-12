package cl.sitad.auth.config;

import cl.sitad.auth.entity.Rol;
import cl.sitad.auth.entity.Usuario;
import cl.sitad.auth.enums.NombreRol;
import cl.sitad.auth.repository.RolRepository;
import cl.sitad.auth.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RolRepository rolRepository,
                           UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (rolRepository.count() > 0) {
            return;
        }

        Rol pasajero = rolRepository.save(new Rol(NombreRol.PASAJERO));
        Rol funcionario = rolRepository.save(new Rol(NombreRol.FUNCIONARIO));

        Usuario admin = new Usuario();
        admin.setRut("11111111-1");
        admin.setNombre("Administrador SITAD");
        admin.setEmail("admin@sitad.cl");
        admin.setPassword(passwordEncoder.encode("ADMIN_PASSWORD_REEMPLAZADO"));
        admin.setRoles(Set.of(pasajero, funcionario));
        usuarioRepository.save(admin);

        Usuario inspector = new Usuario();
        inspector.setRut("22222222-2");
        inspector.setNombre("Inspector Fronterizo");
        inspector.setEmail("inspector@sitad.cl");
        inspector.setPassword(passwordEncoder.encode("INSPECTOR_PASSWORD_REEMPLAZADO"));
        inspector.setRoles(Set.of(funcionario));
        usuarioRepository.save(inspector);
    }
}
