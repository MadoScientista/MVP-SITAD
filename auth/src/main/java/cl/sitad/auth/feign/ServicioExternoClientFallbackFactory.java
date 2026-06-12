package cl.sitad.auth.feign;

import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Component
public class ServicioExternoClientFallbackFactory implements FallbackFactory<ServicioExternoClient> {

    @Override
    public ServicioExternoClient create(Throwable cause) {
        return rut -> {
            // Simulaci�n: si el servicio externo no est� disponible,
            // se retorna una respuesta predeterminada para cualquier RUT v�lido.
            if (rut == null || rut.isBlank()) {
                return new ClaveUnicaResponse(false, null, null, null);
            }
            return new ClaveUnicaResponse(true, rut, "Ciudadano " + rut, rut + "@claveunica.cl");
        };
    }
}
