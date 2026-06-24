# Decisiones de Arquitectura — SITAD MVP

Documento histórico que registra las decisiones arquitectónicas del proyecto, organizadas por hitos de desarrollo según la línea de tiempo real de commits.
---

## Hito 1: Inicio — 12 de junio de 2026

### Contexto
Primer commit (`da2a703`) y configuración inicial del proyecto. Se establece la infraestructura base sobre la que se construirá todo el sistema.

### D1 — Arquitectura de Microservicios

**Decisión:** Dividir el sistema en microservicios independientes (auth, vehicular, fiscalizacion, servicio-externo) en lugar de un monolito.

**Alternativas descartadas:**
- Monolito Spring Boot — más simple inicialmente pero no escala ni aísla responsabilidades.
- Arquitectura orientada a servicios (SOA) con ESB — sobreingeniería para el MVP.

**Justificación:**
- Cada servicio modela un Bounded Context del proceso de solicitud de ingreso o salida temporal de vehículos.
- Escalabilidad y despliegue independientes.
- Aislamiento de fallas: si Servicio-Externo falla, el resto sigue operando.
- Tecnologías: Uso de las bases de microservicios visto en asignatura de fullstack

**Archivos:** `auth/`, `vehicular/`, `fiscalizacion/`, `servicio-externo/`, `docker-compose.yml`

**Commit:** `da2a703` (first commit), `1ae7a2c` (Impl. Infraestructura base)
---

### D2 — Eureka Server para Service Discovery

**Decisión:** Implementar Netflix Eureka como registro central de servicios.

**Alternativas descartadas:**
- Kubernetes nativo — sobreingeniería para MVP académico.
- Configuración manual de URLs — frágil, no escala.
- Spring Cloud Consul — mayor complejidad operativa.

**Justificación:**
- Permite que los microservicios se descubran dinámicamente sin URLs hardcodeadas.
- Los clientes Feign resuelven instancias mediante nombre lógico.
- Simplicidad de configuración con `@EnableEurekaServer`.

**Archivos:** `eureka-server/`

**Commit:** `1ae7a2c`
---

### D3 — Spring Cloud Gateway como API Gateway

**Decisión:** Usar Spring Cloud Gateway como punto de entrada único para todas las peticiones del frontend.

**Alternativas descartadas:**
- Nginx como gateway — requiere configuración adicional de integración Spring.
- Zuul (Netflix) — versión anterior, menos activo que Spring Cloud Gateway.
- Sin gateway — el frontend llamaría a cada microservicio directamente.

**Justificación:**
- Punto único de entrada: el frontend solo conoce `localhost:8080`.
- Cross-cutting concerns centralizados: autenticación, CORS, logging, rate limiting.
- Enrutamiento declarativo: `/api/auth/**`, `/api/vehicular/**`, etc.
- Los microservicios no exponen puertos al exterior.
- Integración nativa con Eureka para balanceo de carga.

**Archivos:** `gateway/src/main/java/cl/sitad/gateway/`, `gateway/src/main/resources/application.yaml`

**Commit:** `1ae7a2c`
---

### D4 — Docker Compose desde la primera iteración

**Decisión:** Contenerizar todos los servicios y orquestar con Docker Compose.

**Alternativas descartadas:**
- Ejecución nativa sin contenedores — problemas de reproducibilidad.
- Kubernetes — sobreingeniería para MVP de 7 servicios.

**Justificación:**
- Reproducibilidad: cualquier persona levanta el sistema completo con un solo comando.
- Consistencia: elimina "funciona en mi máquina".
- Aislamiento: cada servicio corre en su contenedor con sus dependencias específicas.
- Evaluación académica: el proyecto se entrega funcional con `docker compose up`.

**Archivos:** `docker-compose.yml`, `Dockerfile` en cada módulo

**Commit:** `1ae7a2c`, `52a3ced` (Agregar Dockerfile para frontend con nginx)
---

### D5 — Stack: Java 25 + Spring Boot 4 + Spring Cloud 2025

**Decisión:** Usar Java 25 con Spring Boot 4.0.7 y Spring Cloud 2025.1.2.

**Alternativas descartadas:**
- Java 21 + Spring Boot 3.x — versión anterior pero más estable.
- Kotlin + Spring Boot — menor familiaridad del equipo.
- Quarkus / Micronaut — menor ecosistema y comunidad.

**Justificación:**
- Requisito académico: stack utilizado en la asignatura de Spring Boot.
- Madurez empresarial: Spring Boot es el framework estándar para Java empresarial en Chile.
- Ecosistema completo: Spring Security, Spring Data JPA, OpenFeign, Eureka, Gateway.
- Spring Cloud 2025.x requiere `spring.cloud.gateway.routes[0].predicates` (sin `-`).

**Archivos:** `pom.xml` de cada módulo

**Commit:** `1ae7a2c`, `db389d3` (Actualizar property prefix para Spring Cloud 2025.x)
---

### D6 — React 19 + Vite 6 + React Router DOM 7

**Decisión:** Frontend SPA con React 19, Vite 6 como bundler y React Router DOM 7 para enrutamiento.

**Alternativas descartadas:**
- Next.js — framework completo que añade complejidad backend al frontend.
- Create React App — tiempos de inicio lentos, mantenimiento reducido.
- Angular — mayor curva de aprendizaje, sobreingeniería.
- Vue.js — preferencia del equipo por React.

**Justificación:**
- Vite: tiempos de inicio y recarga instantáneos.
- React Router DOM v7: enrutamiento SPA liviano y probado.
- El frontend es una SPA pura; no necesita SSR (Server-Side Rendering).

**Archivos:** `frontend/package.json`, `frontend/vite.config.js`

**Commit:** `03feed8` (Imp. Frontend), `018e5e4` (npm install)
---

### D7 — MySQL 8.0 con instancia independiente por microservicio

**Decisión:** Cada microservicio gestiona su propia base de datos MySQL.

**Alternativas descartadas:**
- Base de datos única compartida — acopla los servicios, viola el principio de microservicios.
- PostgreSQL — preferencia del equipo por MySQL.
- H2 en memoria — no persiste datos entre reinicios.

**Justificación:**
- Independencia: un servicio no queda bloqueado por mantenimiento de DB de otro.
- Aislamiento: un error en el esquema de vehicular no afecta auth.
- Evolución independiente: cada servicio modifica su esquema sin coordinación.
- Seguridad: datos de autenticación separados de datos de negocio.
- Contrapartida: comunicación entre servicios vía API (OpenFeign), no vía consultas directas.

**Archivos:** `docker-compose.yml` (servicios auth-db, vehicular-db, fiscalizacion-db)

**Commit:** `1ae7a2c`, `3410850` (Eliminar externo-db innecesaria)
---

### D8 — Servicio-Externo como microservicio independiente sin persistencia

**Decisión:** Crear un cuarto microservicio para simular integraciones gubernamentales (ClaveÚnica, Registro Civil), sin base de datos propia.

**Alternativas descartadas:**
- Integrar la simulación dentro de auth — mezcla responsabilidades.
- Mock externo con WireMock — herramienta de testing, no servicio permanente.

**Justificación:**
- Separación de responsabilidades: auth no debe contener lógica de simulación.
- Realismo arquitectónico: en producción cada organismo sería un servicio externo real.
- Facilidad de reemplazo: cuando existan integraciones reales, solo se reemplaza este módulo.
- Sin persistencia: su función es simular respuestas predecibles; los datos viven en ConcurrentHashMap.

**Archivos:** `servicio-externo/src/main/java/cl/sitad/servicioexterno/`

**Commit:** `1ae7a2c`
---

## Hito 2: Seguridad y Calidad de Servicio — 12 de junio de 2026

### Contexto
Una vez establecida la infraestructura base, se refuerzan la seguridad, la gestión de secretos y la calidad del servicio. Este hito concentra la mayor cantidad de commits del proyecto (18 de 66).

### D9 — JWT Stateless con Access Token + Refresh Token

**Decisión:** Utilizar JWT (JSON Web Token) stateless con access tokens de corta duración (30 min) y refresh tokens (7 días).

**Alternativas descartadas:**
- Sesiones tradicionales server-side — requieren estado compartido (Redis) en microservicios.
- JWT sin refresh token — experiencia de usuario deficiente (logueo cada 30 min).
- OAuth2 completo con Authorization Server — sobreingeniería para MVP.

**Justificación:**
- Cada microservicio valida el token localmente sin consultar a auth en cada request.
- Access token en memoria (no localStorage, evitando XSS).
- Refresh token en cookie httpOnly (no accesible desde JavaScript).
- Refresh token revocado en base de datos al cerrar sesión.
- Una persona puede tener dos sesiones independientes: PASAJERO (ClaveÚnica) + FUNCIONARIO (credenciales institucionales).

**Archivos:** `auth/src/main/java/cl/sitad/auth/`, `sitad-common/src/main/java/cl/sitad/common/jwt/JwtUtil.java`

**Commit:** `1a71429`, `8020562`, `04c3937`
---

### D10 — sitad-common como librería compartida (JWT, DTOs, enums, excepciones)

**Decisión:** Extraer funcionalidad transversal a un módulo Maven independiente (`sitad-common`).

**Alternativas descartadas:**
- Duplicar código en cada microservicio — viola DRY, riesgos de divergencia.
- Módulo interno dentro de cada servicio — difícil de mantener.

**Justificación:**
- Consistencia: JWT validado con misma clave secreta y algoritmo HMAC-SHA en todos los servicios.
- Enums compartidos: `EstadoTramite`, `NombreRol`, `TipoAutenticacion` una sola definición.
- DTOs compartidos: `EstadoUpdateRequest`, `ErrorResponse` como contratos entre servicios.
- Mantenibilidad: un cambio en el formato JWT se hace en un solo lugar.
- Contrapartida: debe compilarse e instalarse en el repositorio Maven local antes que cualquier servicio dependiente.

**Archivos:** `sitad-common/`

**Commit:** `b9a9f13` (Poblar sitad-common con DTOs y enums), `b148166` (Migrar a usar DTOs de sitad-common), `8020562` (Extraer JwtUtil), `949dfc5` (Centralizar GlobalExceptionHandler)
---

### D11 — Variables de entorno para secretos

**Decisión:** Mover JWT_SECRET y DB_PASSWORD a variables de entorno.

**Alternativas descartadas:**
- Valores hardcodeados en `application.yaml` — riesgo de exposición en el repositorio.
- Archivo `.env` en el repositorio — riesgo similar.
- Spring Cloud Config — sobreingeniería para MVP.

**Justificación:**
- `JWT_SECRET` e `DB_PASSWORD` son secretos que no deben estar en el código fuente.
- Ya incluidas en `.vscode/launch.json` para desarrollo local.
- Contrapartida: el desarrollador debe definirlas manualmente al ejecutar fuera de VS Code o Docker.

**Archivos:** `auth/src/main/resources/application.yaml`, `.env.example`, `.vscode/launch.json`

**Commit:** `04c3937` (mover JWT secret), `61d0b93` (mover contraseñas DB)
---

### D12 — CORS centralizado en API Gateway

**Decisión:** Configurar CORS global en Spring Cloud Gateway en lugar de en cada microservicio.

**Alternativas descartadas:**
- Configurar CORS en cada microservicio individual — duplicación, riesgo de inconsistencias.
- Proxy inverso Nginx para CORS — capa adicional innecesaria.
- Deshabilitar CORS completamente — riesgo de seguridad.

**Justificación:**
- El gateway es el punto de entrada único de todas las APIs.
- Soporta ambos orígenes: `localhost:5173` y `127.0.0.1:5173` (fallback IPv4 cuando localhost resuelve a IPv6).
- Headers `Authorization` (JWT) y `Content-Type` permitidos explícitamente.
- Métodos GET, POST, PATCH, DELETE cubren todas las operaciones CRUD del MVP.
- Sigue el principio de responsabilidad única.

**Archivos:** `gateway/src/main/resources/application.yaml` (bloque `spring.cloud.gateway.server.webflux.globalcors`)

**Commit:** `240c93b` (Restringir orígenes CORS a localhost explícito)
---

### D13 — Health checks públicos con Spring Boot Actuator

**Decisión:** Exponer `/actuator/health` sin autenticación para health checks de Docker.

**Alternativas descartadas:**
- Puerto de management separado — complejidad innecesaria para MVP.
- Restricción por IP de subred — la red Docker es interna y aislada.
- Health check via HTTP a endpoints de negocio — mezcla concerns.

**Justificación:**
- Docker Compose ejecuta health checks periódicos via `curl -f http://localhost:XXXX/actuator/health`.
- Spring Security bloqueaba este endpoint por defecto (403), causando `unhealthy` y errores 502 Bad Gateway.
- El endpoint solo es accesible dentro de la red Docker (`sitad-network`).
- El permiso se configura vía `SecurityConfig.java` (`.requestMatchers("/actuator/health").permitAll()`), no en application.yaml.
- Por defecto Actuator expone solo `{"status":"UP"}` sin información sensible.
- Contrapartida para producción: usar puerto de management separado o restringir por IP.

**Archivos:** `auth/src/main/java/cl/sitad/auth/config/SecurityConfig.java`, `vehicular/src/main/java/cl/sitad/vehicular/config/SecurityConfig.java`, `fiscalizacion/src/main/java/cl/sitad/fiscalizacion/config/SecurityConfig.java`

**Commit:** `f268778` (Agregar actuator, health checks y curl)
---

### D14 — Perfiles Spring (local vs default/docker)

**Decisión:** Cada microservicio tiene un perfil `local` que sobrescribe las URLs de Docker por `localhost`.

**Alternativas descartadas:**
- Un solo perfil con URLs de Docker — imposible desarrollar sin Docker.
- URLs configuradas en el IDE — no portables entre miembros del equipo.

**Justificación:**
- Desarrollo local sin Docker: MySQL nativo en localhost, todos los servicios en JVM nativa.
- Perfil `local` se activa con `-Dspring.profiles.active=local`.
- Perfil `default` usa nombres de contenedor Docker (ej: `auth-db:3306`).
- Las configuraciones de VS Code (`launch.json`) ya incluyen el flag del perfil.

**Archivos:** `application.yaml` en cada microservicio (bloque `---` con perfil `local`)

**Commit:** `e2f941a` (Configuración para correr en local)
---

### D15 — Validación de formato RUT en DTOs de login

**Decisión:** Agregar validación de formato RUT chileno en los DTOs de autenticación.

**Justificación:**
- El RUT chileno tiene un formato específico (XX.XXX.XXX-X o XXXXXXXX-X) con dígito verificador.
- La validación temprana evita errores en capas inferiores.
- Mejora la experiencia de usuario con feedback inmediato.

**Archivos:** `auth/src/main/java/cl/sitad/auth/dto/LoginCiudadanoRequest.java`, `auth/src/main/java/cl/sitad/auth/dto/LoginFuncionarioRequest.java` (DTOs separados por rol)

**Commit:** `9d249fb`
---

### D16 — OpenFeign con fallbacks para comunicación entre servicios

**Decisión:** Usar OpenFeign con clases fallback para la comunicación entre microservicios.

**Alternativas descartadas:**
- RestTemplate — programación imperativa, más verboso.
- WebClient — reactivo, mayor complejidad.
- Llamadas directas a base de datos — viola el principio de microservicios.

**Justificación:**
- OpenFeign es la solución declarativa estándar en Spring Cloud.
- Los fallbacks permiten manejo graceful de fallos en servicios dependientes.
- Integración nativa con Eureka para resolución de nombres lógicos.
- `FeignClient(name = "vehicular-service", fallback = ...)` como patrón en fiscalización.

**Archivos:** `fiscalizacion/src/main/java/cl/sitad/fiscalizacion/client/VehicularServiceClient.java`, `auth/src/main/java/cl/sitad/auth/client/` y similares

**Commit:** `c5b7a70` (Impl. Módulo fiscalizacion)
---

## Hito 3: Correcciones Iniciales — 13 de junio de 2026

### Contexto
Ajustes posteriores a la implementación inicial: corrección de encoding, tildes en el frontend y errores en formularios.

### D17 — Corrección de encoding UTF-8 para español

**Decisión:** Asegurar que todos los caracteres con tilde y ñ se muestren correctamente en el frontend.

**Justificación:**
- El dominio del problema es Chile: todos los textos están en español.
- Caracteres como "ó", "í", "ñ", "é" son parte integral de la interfaz.
- React con Vite maneja UTF-8 correctamente, pero algunos strings se habían escrito sin tildes.

**Archivos:** `frontend/src/pages/*.jsx` (múltiples archivos)

**Commit:** `0139491` (Modificar tildes en el frontend), `888085f` (Corrección de caracteres unicode)
---

## Hito 4: Modelo de Dominio y Lógica de Negocio — 14 de junio de 2026

### Contexto
Se implementa la lógica central del negocio: modelo de expediente, máquina de estados, gestión de documentos y las reglas de negocio definidas en `consideraciones/negocio.md`.

### D18 — ExpedienteSalidaTemporal como entidad central del sistema

**Decisión:** Modelar el sistema en torno a `ExpedienteSalidaTemporal` (la solicitud), no al vehículo.

**Alternativas descartadas:**
- Vehículo como entidad central — un vehículo puede tener múltiples expedientes; distorsiona el seguimiento.
- Trámite genérico — demasiado abstracto, no captura las particularidades aduaneras.

**Justificación:**
- El expediente es el objeto principal del proceso de negocio (ver `negocio.md`).
- Un vehículo puede participar en múltiples expedientes (RN-002).
- Todo expediente debe asociarse a un vehículo (RN-003), pero un vehículo existe independientemente.
- El expediente contiene: conductor, legitimidad, viaje, documentos, observaciones y estado.

**Archivos:** `vehicular/src/main/java/cl/sitad/vehicular/entity/SalidaTemporalVehiculo.java`

**Commit:** `cf826ab` (Agregar campos conductor/legitimidad), `28b7f08` (Unificar nuevos campos)
---

### D19 — Máquina de estados con 6 estados alcanzables

**Decisión:** Implementar 6 estados con transiciones controladas: BORRADOR → PENDIENTE_DOCUMENTACION → PRE_VALIDADO_DIGITAL → APROBADO_EN_VENTANILLA / RECHAZADO / OBSERVADO.

**Estado actual (commit 2d1a5d2):**
| Transición | Desde | Hacia | Endpoint |
|-----------|-------|-------|----------|
| Crear borrador | — | BORRADOR | `POST /solicitudes` |
| Subir documentos | BORRADOR | PENDIENTE_DOCUMENTACION | `POST /documentos` (auto) |
| Prevalidar | PENDIENTE_DOCUMENTACION | PRE_VALIDADO_DIGITAL | `POST /solicitudes/{id}/prevalidar` |
| Observar | PRE_VALIDADO_DIGITAL | OBSERVADO | `POST /tramites/{id}/observar` |
| Aprobar | PRE_VALIDADO_DIGITAL | APROBADO_EN_VENTANILLA | `POST /tramites/{id}/aprobar` |
| Rechazar | PRE_VALIDADO_DIGITAL | RECHAZADO | `POST /tramites/{id}/rechazar` |

**Pendiente:** Transición OBSERVADO → PENDIENTE_DOCUMENTACION (re-corregir).

**Alternativas descartadas:**
- Estados planos sin máquina — cualquier transición posible, riesgo de estados inválidos.
- Estado único "aprobado/rechazado" — no captura el proceso de 7 etapas del negocio.

**Justificación:**
- Cada etapa del negocio (identificación, vehículo, legitimidad, viaje, documentos, prevalidación, fiscalización) se refleja en los estados.
- La prevalidación es automática: verifica vehículo registrado, documentación presente, fechas válidas.

**Archivos:** `sitad-common/src/main/java/cl/sitad/common/enums/EstadoTramite.java`, `vehicular/src/main/java/cl/sitad/vehicular/service/VehicularService.java`

**Commit:** `8c8915f` (Agregar estados BORRADOR, PENDIENTE_DOCUMENTACION, OBSERVADO), `2d1a5d2` (Corregir modelo expediente y máquina de estados)
---

### D20 — Documento como entidad JPA con relación @ManyToOne

**Decisión:** Modelar `Documento` como entidad JPA con relación `@ManyToOne` a `SalidaTemporalVehiculo`, en lugar de un campo `solicitudId` Long.

**Alternativas descartadas:**
- `solicitudId` como Long — no aprovecha las relaciones JPA, consultas menos expresivas.
- Documento embebido en la entidad de expediente — no escala cuando hay múltiples documentos.
- Almacenamiento externo (S3, FileSystem) — sobreingeniería para MVP (los documentos simulados son metadatos).

**Justificación:**
- La relación JPA permite navegar `expediente.documentos` directamente.
- `@OneToMany` en `SalidaTemporalVehiculo` con `cascade = ALL` simplifica la persistencia.
- Tipos de documento como enum: PADRON, SEGURO_INTERNACIONAL, AUTORIZACION_NOTARIAL, PODER_ESPECIAL.

**Archivos:** `vehicular/src/main/java/cl/sitad/vehicular/entity/Documento.java`, `vehicular/src/main/java/cl/sitad/vehicular/entity/SalidaTemporalVehiculo.java`

**Commit:** `b19aed9` (Agregar modelo Documento), `cf826ab` (Corregir relación Documento)
---

### D21 — Observación obligatoria al rechazar (RN-011)

**Decisión:** Requerir observación no vacía al rechazar un trámite, tanto en backend (`@NotBlank`) como en frontend (textarea obligatorio en modal).

**Alternativas descartadas:**
- Observación opcional — no cumple la regla de negocio RN-011.
- Valor por defecto "Sin observación" — pierde información valiosa para el ciudadano.

**Justificación:**
- RN-011: "Todo rechazo debe registrar observación."
- La observación es el feedback que el ciudadano necesita para corregir su solicitud.
- Consistencia: el mismo patrón se aplica al endpoint "Observar".

**Archivos:** `fiscalizacion/src/main/java/cl/sitad/fiscalizacion/dto/RechazarRequest.java`, `frontend/src/components/ConfirmDialog.jsx`

**Commit:** `16ed1a3` (Requerir observación al rechazar trámite)
---

### D22 — Prevalidación automática como etapa del negocio

**Decisión:** Implementar prevalidación como endpoint separado que verifica: vehículo registrado, documentación presente y fechas válidas.

**Alternativas descartadas:**
- Prevalidación en cada cambio del formulario — demasiadas llamadas al backend.
- Prevalidación solo al enviar — el usuario no recibe feedback temprano.

**Justificación:**
- Corresponde a la Etapa 6 del negocio (ver `negocio.md`).
- Resultado: `PRE_VALIDADO_DIGITAL` (todo ok) o `PENDIENTE_DOCUMENTACION` (faltan documentos).
- El ciudadano gatilla la prevalidación explícitamente desde el wizard.

**Archivos:** `vehicular/src/main/java/cl/sitad/vehicular/service/VehicularService.java` (método `prevalidarSolicitud`)

**Commit:** `2d1a5d2` (Corregir modelo expediente y máquina de estados)
---

## Hito 5: APIs de Consulta y Frontend Funcional — 14 de junio de 2026

### Contexto
Se agregan endpoints de consulta faltantes y se conecta el frontend con datos reales del backend. Se implementan las vistas de detalle de expediente, historial y dashboards.

### D23 — Endpoints de detalle de expediente e historial

**Decisión:** Crear `GET /vehicular/solicitudes/{id}` para detalle completo y `GET /fiscalizacion/tramites/{id}/historial` para la línea de tiempo de cambios.

**Justificación:**
- El ciudadano necesita ver el detalle completo de su expediente.
- El historial permite auditoría: quién hizo qué y cuándo (registrado en `ControlVentanilla`).
- Ambos endpoints alimentan la vista `ExpedienteDetalle.jsx` con 5 pestañas.

**Archivos:** `vehicular/src/main/java/cl/sitad/vehicular/controller/VehicularController.java`, `fiscalizacion/src/main/java/cl/sitad/fiscalizacion/controller/FiscalizacionController.java`

**Commit:** `4335dd1` (Agregar endpoints de consulta)
---

### D24 — Búsqueda avanzada en fiscalización

**Decisión:** Extender `GET /tramites` para filtrar por patente, RUT, número de expediente y estado.

**Alternativas descartadas:**
- Búsqueda solo por estado — insuficiente para la operativa del funcionario.
- Elásticsearch — sobreingeniería para MVP.

**Justificación:**
- El funcionario necesita encontrar expedientes rápidamente (máximo 3 clics desde búsqueda hasta resolución).
- Los filtros combinados permiten localizar un expediente específico entre cientos.

**Archivos:** `vehicular/src/main/java/cl/sitad/vehicular/controller/InternalController.java`, `fiscalizacion/src/main/java/cl/sitad/fiscalizacion/service/FiscalizacionService.java`
**Commit:** `4335dd1`
---

### D25 — Wizard de 6 etapas en el frontend con datos reales

**Decisión:** Reemplazar el formulario simple por un wizard de 6 pasos que envía todos los campos al backend.

**Alternativas descartadas:**
- Formulario único scrolleable — sobrecarga cognitiva para el usuario.
- Wizard sin persistencia intermedia — el usuario pierde datos si recarga la página.

**Justificación:**
- Las 6 etapas reflejan directamente las etapas del negocio (identificación, vehículo, legitimidad, carga documental, viaje, prevalidación).
- Cada paso es manejable cognitivamente.

- **Importante:** el wizard aún no persistía datos intermedios como borrador en versiones anteriores; se corrigió para que Steps 1 (conductor) y 3 (legitimidad) envíen datos al backend.

**Archivos:** `frontend/src/pages/SolicitarSalida.jsx`

**Commit:** `9ed56d3` (Reemplazar formulario simple por wizard), `40bb348` (Wizard envía datos reales)
---

## Hito 6: Rediseño de Frontend — 15 de junio de 2026

### Contexto
Iteración de diseño y usabilidad: nuevo layout de doble columna, vistas rediseñadas, nuevos dashboards y componentes.

### D26 — Layout de doble columna con relación 70/30

**Decisión:** Implementar layout de dos columnas (70% contenido principal, 30% navegación contextual) en todas las vistas de pasajero y funcionario.

**Alternativas descartadas:**
- Una sola columna — el contenido se extiende demasiado, la navegación queda solo en header.
- Layout de tres columnas — demasiado complejo para el MVP.
- Sidebar fijo izquierdo + contenido — patrón menos familiar para ciudadanos.

**Justificación:**
- Especificado en `screen-especificaciones.md` para todas las vistas.
- La columna derecha agrupa accesos directos y navegación contextual, reduciendo la necesidad de volver al dashboard.
- En móvil, ambas columnas se apilan verticalmente.

**Archivos:** `frontend/src/styles/global.css`, `frontend/src/pages/*.jsx`

**Commit:** `e7045e6` (Modificación layout de vistas a doble columna)
---

### D27 — Dashboard Ciudadano con próximos viajes y observaciones pendientes

**Decisión:** Agregar secciones "Próximos Viajes" y "Observaciones Pendientes" al dashboard del pasajero.

**Justificación:**
- El dashboard era una página genérica sin información accionable.
- "Próximos Viajes": filtros por fecha futura y estado no terminal.
- "Observaciones Pendientes": botón "Corregir" que linkea al detalle del expediente.

**Archivos:** `frontend/src/pages/DashboardCiudadano.jsx`

**Commit:** `5734530` (Rediseño dashboard pasajero), `57dffad` (Nuevos textos en dashboard pasajero)
---

### D28 — Dashboard Funcionario con bandeja operacional

**Decisión:** Implementar bandeja operacional con tabs (Pendientes, Observadas, Aprobadas, Rechazadas, Todas) y buscador por patente, RUN y número de expediente.

**Alternativas descartadas:**
- Lista plana sin filtros — poco útil cuando hay muchos expedientes.
- Búsqueda solo por estado — insuficiente.

**Justificación:**
- El funcionario debe encontrar y resolver expedientes rápidamente.
- Máximo 3 clics desde la búsqueda hasta la resolución (aprobar/rechazar/observar).
- Las tabs permiten cambiar rápidamente entre estados sin escribir en el buscador.

**Archivos:** `frontend/src/pages/DashboardFuncionario.jsx`

**Commit:** `276bf88` (Corrección filtros en dashboard de funcionario), `5734530`
---

### D29 — Vista ExpedienteDetalle con 5 pestañas

**Decisión:** Crear vista de detalle de expediente con tabs: Personales, Vehículo, Documentos, Observaciones, Historial.

**Justificación:**
- Especificado en `screen-especificaciones.md`.
- Organiza la información del expediente en secciones manejables.
- 5 pestañas equivalen directamente a las 5 categorías de información del expediente.
- Accesible desde `/ciudadano/expedientes/:id` y `/funcionario/expedientes/:id`.

**Archivos:** `frontend/src/pages/ExpedienteDetalle.jsx`, `frontend/src/App.jsx`

**Commit:** `40bb348` (Mejorar frontend)
---

### D30 — Botón "Observar" en fiscalización con modal obligatorio

**Decisión:** Agregar botón "Observar" en la vista de fiscalización que abre un modal con textarea obligatorio.

**Justificación:**
- Consistencia con los botones "Aprobar" y "Rechazar".
- La observación es requisito obligatorio para este estado.
- El modal fuerza al funcionario a escribir la razón de la observación.

**Archivos:** `frontend/src/pages/Fiscalizacion.jsx`, `frontend/src/pages/ExpedienteDetalle.jsx`

**Commit:** `f397c0e` (Corrección error en botones de acción), `40bb348`
---

### D31 — Vista MisVehículos con registro y edición

**Decisión:** Crear vista independiente para la gestión de vehículos del ciudadano, con listado, registro y edición.

**Justificación:**
- Separación del flujo de solicitud: el ciudadano puede gestionar sus vehículos independientemente.
- Antes de crear una solicitud, el ciudadano necesita tener vehículos registrados.
- La vista incluye validación de patente única (RN-001).

**Archivos:** `frontend/src/pages/MisVehiculos.jsx`, `frontend/src/pages/RegistrarVehiculo.jsx`

**Commit:** `51c8c90` (Nueva vista MisVehiculos), `049cff8` (Rediseño vista registro de vehículo), `f1f7943` (Nuevo botón para registro)
---

## Hito 7: Identidad Visual Gubernamental — 18 de junio de 2026

### Contexto
Unificación del estilo visual con la identidad del Estado de Chile. Se integran los diseños de ChileAtiende y ClaveÚnica, se estandariza la paleta de colores y la tipografía, y se corrigen problemas de UX como el parpadeo en transiciones.

### D32 — Estilo institucional basado en ChileAtiende y ClaveÚnica

**Decisión:** Adoptar el sistema de diseño del Gobierno de Chile (Framework Kit Gobierno) como referencia visual, combinado con la especificación oficial del botón ClaveÚnica.

**Alternativas descartadas:**
- Diseño propio sin referencia estatal — no genera reconocimiento institucional.
- Bootstrap genérico — pierde la identidad del Estado.
- Librería UI como Material UI o Ant Design — rompe la apariencia gubernamental.

**Justificación:**
- El ciudadano identifica el sitio como parte del ecosistema del Estado chileno.
- Transferencia de navegación: quien usó ChileAtiende sabe instintivamente cómo moverse por SITAD.
- El botón ClaveÚnica tiene diseño normado por el Estado; no se puede reestilizar libremente.
- CSS vanilla con variables CSS: sin dependencias externas pesadas.

**Archivos:** `frontend/src/styles/global.css`, `frontend/src/pages/LoginCiudadano.jsx`, `frontend/src/pages/LoginFuncionario.jsx`

**Commit:** `72ee899` (Unificación estilos con diseño estatal), `1b43c02` (Justificación de decisiones de estilos)
---

### D33 — Paleta de colores unificada con dos sistemas cromáticos

**Decisión:** Definir una paleta que combina el azul de ChileAtiende (#006FB3) como color primario de SITAD con los colores oficiales de ClaveÚnica (#0F69C4).

**Justificación:**

- **Dos azules distintos conviven en el mismo sistema:**
  - `#006FB3` (ChileAtiende / SITAD primario) — color principal para header, botones y elementos primarios.
  - `#0F69C4` (ClaveÚnica) — exclusivo del botón ClaveÚnica, normado por Gobierno Digital.
- El footer usa `#0A132D` (azul oscuro terciario) para alto contraste.
- El login de funcionario usa `#C8D6E5` (azul acero) para diferenciarse del login ciudadano.

**Archivos:** `frontend/src/styles/global.css` (variables CSS en `:root`)

**Commit:** `72ee899`, `e5db3e2` (Cambios menores en el estilo), `d79236f` (Unificación estilos login)
---

### D34 — Tipografía: Roboto + Roboto Slab

**Decisión:** Usar Roboto para cuerpo, formularios y navegación; Roboto Slab (serif) exclusivamente para títulos de sección.

**Alternativas descartadas:**
- Inter (propuesta inicial en `gui.md`) — compatible pero no es la familia oficial del Gobierno.
- System fonts — no genera reconocimiento institucional.
- Librería de iconos — innecesaria para MVP.

**Justificación:**
- Combinación obligatoria en productos del ecosistema del Estado chileno.
- Roboto Slab da el "peso visual institucional" en títulos.
- Roboto es neutral y legible en todos los contextos y dispositivos.
- Google Fonts: ambas familias disponibles gratuitamente.

**Archivos:** `frontend/src/styles/global.css`, `frontend/index.html` (Google Fonts import)

**Commit:** `72ee899`
---

### D35 — CSS vanilla con variables CSS (sin librerías externas)

**Decisión:** No usar Bootstrap, Material UI ni ninguna librería CSS externa; todo el estilo es CSS vanilla con variables CSS.

**Alternativas descartadas:**
- Framework Kit Gobierno CDN — depende de disponibilidad externa, riesgo en evaluación.
- Bootstrap 4 — rompe la personalización fina necesaria para la identidad SITAD.
- Tailwind CSS — genera HTML verboso, se aparta del estilo institucional.

**Justificación:**
- Las variables CSS (`--color-primary`, `--font-body`, `--space-md`) permiten un sistema de diseño mantenible sin dependencias.
- El diseño institucional requiere control preciso sobre cada componente.
- Menos dependencias = menos riesgos de rotura por cambios externos.
- El archivo `global.css` (~1600 líneas) centraliza todo el sistema de diseño.

**Archivos:** `frontend/src/styles/global.css`

**Commit:** `72ee899`, `e5db3e2`
---

### D36 — Header y footer dentro del Layout (incluyendo login)

**Decisión:** Mantener el header y el footer dentro del componente `Layout` para todas las páginas, incluyendo las de login.

**Alternativas descartadas:**
- Login sin header/footer — el usuario pierde el contexto de la plataforma.
- Login con layout separado — inconsistencia visual, duplicación de código.

**Justificación:**
- El header en login muestra el nombre de la plataforma y el rol ("Plataforma para pasajeros" / "Plataforma institucional").
- El ciudadano reconoce que está dentro del sistema SITAD, no en una página externa.
- Consistencia: todas las páginas comparten la misma estructura visual.
- El header cambia su subtítulo según la ruta (`/ciudadano/*` vs `/funcionario/*`).

**Archivos:** `frontend/src/components/AppHeader.jsx`, `frontend/src/App.jsx`

**Commit:** `d79236f` (Unificación login), `72ee899`
---

### D37 — Login diferenciado por rol (ciudadano vs funcionario)

**Decisión:** Dos pantallas de login visualmente diferenciadas: ciudadano con temática ClaveÚnica (fondo gris #EEEEEE, barra azul-rojo, botón CU oficial) y funcionario con temática institucional (fondo azul acero #C8D6E5, sin texto instructivo, sin botón CU).

**Alternativas descartadas:**
- Login único con selector de rol — confunde al usuario, mezcla dos contextos distintos.
- Redirección automática según IP — no funciona en desarrollo local.

**Justificación:**
- El login ciudadano debe verse como "ClaveÚnica" para generar confianza y reconocimiento.
- El login funcionario es interno: debe verse institucional, no ciudadano.
- Diferenciación clara evita que un funcionario intente autenticarse con ClaveÚnica o viceversa.
- Ambas tarjetas comparten la misma estructura base (`login-card`) pero con variables de color distintas.

**Archivos:** `frontend/src/pages/LoginCiudadano.jsx`, `frontend/src/pages/LoginFuncionario.jsx`, `frontend/src/styles/global.css`

**Commit:** `d79236f` (Unificación de estilos en login)
---

### D38 — Prevención de parpadeo del footer en transiciones de ruta

**Decisión:** Usar `flex: 1 0 auto` con `min-height: calc(100vh - var(--header-height))` para evitar que el footer aparezca en el centro de la pantalla durante las transiciones entre rutas.

**Alternativas descartadas:**
- `flex: 1` (flex-basis: 0%) — el navegador ignora el `min-height`, causando parpadeo.
- Footer con `position: fixed` — complejidad adicional, riesgo de superposición con contenido.
- `min-height: 100vh` en el contenedor — insuficiente cuando el contenido desaparece momentáneamente.

**Justificación:** (ver commit `c3e0b8d`)
- `flex: 1` equivale a `flex: 1 1 0%` — con `flex-basis: 0%` el navegador ignora el `min-height` durante el cálculo flexbox.
- `flex: 1 0 auto` con `flex-shrink: 0` evita que `.app-main` se encoja.
- Con `flex-basis: auto`, el `min-height` es efectivo: el elemento no puede reducirse por debajo del viewport menos el header.
- Durante la transición (componente desmontado y nuevo montándose), `.app-main` mantiene su altura mínima, manteniendo el footer en su lugar.

**Efecto secundario:** en páginas con poco contenido, `.app-main` ocupa todo el alto disponible y el footer queda debajo del viewport (con scroll), comportamiento aceptable para el equipo.

**Archivos:** `frontend/src/styles/global.css` (`.app-main`)

**Commit:** `c3e0b8d` (Corrección parpadeo por renderizado de contenido)
---

## Resumen cronológico
```
Hito 1 — Inicio                (12-jun)    8 decisiones    Fundación del sistema
Hito 2 — Seguridad             (12-jun)    7 decisiones    JWT, secretos, CORS, health, perfiles
Hito 3 — Correcciones          (13-jun)    1 decisión      Encoding UTF-8
Hito 4 — Dominio y negocio     (14-jun)    5 decisiones    Expediente, estados, documentos, RN-011
Hito 5 — APIs y frontend       (14-jun)    3 decisiones    Detalle, historial, búsqueda, wizard
Hito 6 — Rediseño UX           (15-jun)    6 decisiones    Layout 70/30, dashboards, pestañas
Hito 7 — Identidad visual      (18-jun)    7 decisiones    ChileAtiende, ClaveÚnica, CSS, login
Total: 38 decisiones arquitectónicas en 7 hitos, 7 días de desarrollo.
```
---

## Decisiones transversales no cubiertas en hitos
| Decisión | Fundamento |
|----------|-----------|
| **DTOs como Java records** | Inmutables, concisos, validación nativa con `@NotBlank`/`@NotNull` |
| **Lombok en entidades** | Reduce boilerplate (`@Data`, `@NoArgsConstructor`) |
| **Seguridad con SecurityFilterChain + JwtFilter** | Patrón moderno Spring Security sin herencia de WebSecurityConfigurerAdapter |
| **Vanilla CSS sin preprocesadores** | Suficiente para el alcance del MVP; evita dependencias build (SASS, LESS, PostCSS) |
| **No usar localStorage para tokens** | Access token en memoria (JavaScript), refresh token en cookie httpOnly |
| **Perfiles `local` vs `docker`** | Desarrollo ágil sin Docker + despliegue contenerizado reproducible |
| **Tablas creadas con `ddl-auto: update`** | Hibernate genera el esquema automáticamente; no requiere scripts SQL manuales |
| **Nginx como servidor web del frontend en Docker** | Sirve archivos estáticos, proxy reverso `/api` al gateway |