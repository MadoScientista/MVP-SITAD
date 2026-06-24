package cl.sitad.externo.service;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DevSimulacionSupplement {

    private final SimulacionService simulacionService;

    public DevSimulacionSupplement(SimulacionService simulacionService) {
        this.simulacionService = simulacionService;
    }

    @PostConstruct
    public void addAdminUsers() {
        simulacionService.addPersonaSimulada("11111111-1", "Administrador SITAD", "Chilena", "10-05-1985");
        simulacionService.addPersonaSimulada("22222222-2", "Inspector Fronterizo", "Chilena", "22-08-1992");
    }
}
