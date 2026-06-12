package cl.sitad.vehicular;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = {"cl.sitad.vehicular", "cl.sitad.common"})
@EnableDiscoveryClient
public class VehicularApplication {

	public static void main(String[] args) {
		SpringApplication.run(VehicularApplication.class, args);
	}

}
