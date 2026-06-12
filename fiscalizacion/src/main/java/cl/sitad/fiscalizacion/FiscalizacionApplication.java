package cl.sitad.fiscalizacion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class FiscalizacionApplication {

	public static void main(String[] args) {
		SpringApplication.run(FiscalizacionApplication.class, args);
	}

}
