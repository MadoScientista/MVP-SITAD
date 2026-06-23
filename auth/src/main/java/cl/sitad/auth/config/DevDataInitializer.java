package cl.sitad.auth.config;

import cl.sitad.auth.entity.Rol;
import cl.sitad.auth.entity.Usuario;
import cl.sitad.auth.enums.NombreRol;
import cl.sitad.auth.repository.RolRepository;
import cl.sitad.auth.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
@Profile("dev")
public class DevDataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    private final String adminPassword;
    private final String inspectorPassword;

    public DevDataInitializer(RolRepository rolRepository,
                              UsuarioRepository usuarioRepository,
                              PasswordEncoder passwordEncoder,
                              @Value("${ADMIN_PASSWORD}") String adminPassword,
                              @Value("${INSPECTOR_PASSWORD}") String inspectorPassword) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminPassword = adminPassword;
        this.inspectorPassword = inspectorPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (usuarioRepository.findByRut("11111111-1").isPresent()) {
            return;
        }

        Rol pasajero = rolRepository.findByNombre(NombreRol.PASAJERO)
                .orElseThrow(() -> new IllegalStateException("Rol PASAJERO no encontrado"));
        Rol funcionario = rolRepository.findByNombre(NombreRol.FUNCIONARIO)
                .orElseThrow(() -> new IllegalStateException("Rol FUNCIONARIO no encontrado"));

        Usuario admin = new Usuario();
        admin.setRut("11111111-1");
        admin.setNombre("Administrador SITAD (dev)");
        admin.setEmail("admin@sitad.cl");
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRoles(Set.of(pasajero, funcionario));
        usuarioRepository.save(admin);

        Usuario inspector = new Usuario();
        inspector.setRut("22222222-2");
        inspector.setNombre("Inspector Fronterizo (dev)");
        inspector.setEmail("inspector@sitad.cl");
        inspector.setPassword(passwordEncoder.encode(inspectorPassword));
        inspector.setRoles(Set.of(funcionario));
        usuarioRepository.save(inspector);
    }
}