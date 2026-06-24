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
    public void seedSimulatedData() {
        simulacionService.addPersonaSimulada("11111111-1", "Administrador SITAD", "Chilena", "10-05-1985");
        simulacionService.addPersonaSimulada("22222222-2", "Inspector Fronterizo", "Chilena", "22-08-1992");
        simulacionService.addPersonaSimulada("12345678-5", "Juan P\u00e9rez Gonz\u00e1lez", "Chilena", "15-03-1988");
        simulacionService.addPersonaSimulada("98765432-1", "Marcela Soto L\u00f3pez", "Chilena", "02-11-1995");

        simulacionService.addVehiculoSimulado("ABCD12", "Toyota", "Corolla", 2020, "Chile", "12345678-5");
        simulacionService.addVehiculoSimulado("EFGH34", "Hyundai", "Tucson", 2022, "Chile", "12345678-5");
        simulacionService.addVehiculoSimulado("IJKL56", "Mitsubishi", "L200", 2021, "Chile", "98765432-1");
    }
}
