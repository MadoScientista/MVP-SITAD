package cl.sitad.fiscalizacion.feign;

import cl.sitad.fiscalizacion.dto.EstadoUpdateRequest;
import cl.sitad.fiscalizacion.dto.TramiteResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "vehicular")
public interface VehicularServiceClient {

    @GetMapping("/api/v1/vehicular/internal/tramites")
    List<TramiteResponse> buscarTramites(@RequestParam("estado") String estado);

    @PatchMapping("/api/v1/vehicular/internal/tramites/{id}/estado")
    TramiteResponse actualizarEstado(@PathVariable("id") Long id,
                                     @RequestBody EstadoUpdateRequest request);
}
