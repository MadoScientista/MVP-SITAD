package cl.sitad.auth.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "servicio-externo", fallbackFactory = ServicioExternoClientFallbackFactory.class)
public interface ServicioExternoClient {

    @GetMapping("/api/v1/externo/claveunica/validar")
    ClaveUnicaResponse validarClaveUnica(@RequestParam("rut") String rut);
}
