package cl.sitad.externo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ExternoApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExternoApplication.class, args);
	}
}
