package cl.sitad.fiscalizacion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = {"cl.sitad.fiscalizacion", "cl.sitad.common"})
@EnableDiscoveryClient
@EnableFeignClients
public class FiscalizacionApplication {

	public static void main(String[] args) {
		SpringApplication.run(FiscalizacionApplication.class, args);
	}

}
