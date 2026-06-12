package cl.sitad.auth.feign;

import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Component
public class ServicioExternoClientFallbackFactory implements FallbackFactory<ServicioExternoClient> {

    @Override
    public ServicioExternoClient create(Throwable cause) {
        return rut -> new ClaveUnicaResponse(false, null, null, null);
    }
}
