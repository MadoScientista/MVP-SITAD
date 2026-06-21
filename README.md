# SITAD - MVP

Sistema Integrado de Tramitación Aduanera Digital.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite 6 |
| Backend | Java 25+ / Spring Boot 4.0.7 / Spring Cloud 2025.1.2 |
| Service Discovery | Netflix Eureka |
| API Gateway | Spring Cloud Gateway |
| Base de datos | MySQL 8.0 (auth_db, vehicular_db, fiscalizacion_db) |

---

## Requisitos

- Java JDK 25+
- Maven 3.9+
- Node.js 22+
- MySQL 8.0 (local)
- VS Code + Extension Pack for Java + Spring Boot Extension Pack

---

## 1. Base de datos

Abrir MySQL Workbench, conectarse a la instancia local y ejecutar el script `utilidadDB/init-db.sql`, o manualmente con la contraseña que uses:

```sql
CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS vehicular_db;
CREATE DATABASE IF NOT EXISTS fiscalizacion_db;

CREATE USER IF NOT EXISTS 'sitad'@'localhost' IDENTIFIED BY 'SitadDb2026!';

GRANT ALL PRIVILEGES ON auth_db.* TO 'sitad'@'localhost';
GRANT ALL PRIVILEGES ON vehicular_db.* TO 'sitad'@'localhost';
GRANT ALL PRIVILEGES ON fiscalizacion_db.* TO 'sitad'@'localhost';
FLUSH PRIVILEGES;
```

> Asume MySQL corriendo en `localhost:3306`. Si usas otro puerto, ajusta las URLs en los perfiles `local` de cada `application.yaml`.

---

## 2. Compilar librería compartida

```bash
cd sitad-common
mvn clean install
```

Esto instala `sitad-common` en el repositorio local de Maven. Los demás módulos la necesitan como dependencia.

---

## 3. Variables de entorno

El proyecto requiere las siguientes variables. Copiar `.env.example` a `.env` y ajustar los valores, luego cargarlos en la terminal:

```powershell
Get-Content .env | ForEach-Object {
    if ($_ -match '^(.+?)=(.+)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}
```

Variables requeridas:

| Variable | Descripción |
|---|---|
| `JWT_SECRET` | Clave HMAC-SHA ≥ 256 bits. Generar con: `python -c "import secrets, base64; print(base64.b64encode(secrets.token_bytes(64)).decode())"` |
| `DB_PASSWORD` | Contraseña del usuario `sitad` en MySQL |
| `ADMIN_PASSWORD` | Password del usuario semilla "Administrador SITAD" (opcional, default: `Admin123!`) |
| `INSPECTOR_PASSWORD` | Password del usuario semilla "Inspector Fronterizo" (opcional, default: `Inspector123!`) |

---

## 4. Perfil "local"

Cada microservicio tiene un bloque `---` en su `application.yaml` con el perfil `local` que sobrescribe las URLs de Docker por `localhost`. Para activarlo:

### Desde VS Code (Run & Debug)

Abrir la vista **Run and Debug** (`Ctrl+Shift+D`) y ejecutar en orden:

1. **"1. Eureka Server"** → esperar a que http://localhost:8761 esté disponible
2. **"3. Auth"**, **"4. Vehicular"**, **"5. Fiscalizacion"**, **"6. Servicio Externo"** → en paralelo
3. **"2. Gateway"**

Cada configuración ya tiene `vmArgs: "-Dspring.profiles.active=local"` y las variables de entorno configuradas localmente en `launch.json`.

> **Nota:** `.vscode/` está en `.gitignore`. Cada desarrollador debe tener su propio `launch.json` con las credenciales locales. Si no existe, copiar el `.env` y cargar las variables en la terminal antes de iniciar VS Code.

### Desde terminal

```bash
cd eureka-server
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Repetir para cada módulo, en el mismo orden. Antes de ejecutar, cargar las variables del `.env` en la terminal (ver paso 3).

---

## 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend corre en `http://localhost:5173`. Las peticiones `/api/*` se proxy al gateway en `http://localhost:8080` (configurado en `vite.config.js`).

---

## 6. Orden de arranque (resumen)

```
1. MySQL (auth_db, vehicular_db, fiscalizacion_db)
2. Eureka Server (puerto 8761)
3. Auth (8081), Vehicular (8082), Fiscalizacion (8083), Servicio Externo (8084)
4. Gateway (8080)
5. Frontend (5173)
```

---

## 7. URLs

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |

---

## 8. Usuarios por defecto (seeders)

Al iniciar AuthService con la base de datos vacía, se crean automáticamente:

| Usuario | RUT | Rol | Password (configurable vía env var) |
|---|---|---|---|
| Administrador SITAD | `11111111-1` | PASAJERO + FUNCIONARIO | `ADMIN_PASSWORD` (default: `Admin123!`) |
| Inspector Fronterizo | `22222222-2` | FUNCIONARIO | `INSPECTOR_PASSWORD` (default: `Inspector123!`) |

---

## 9. Notas

- Las tablas se crean automáticamente via `ddl-auto: update` de Hibernate/JPA.
- El contenedor Docker no es necesario para desarrollo local. El perfil `local` permite ejecutar todo nativamente.
- Si encuentras errores de conexión a la base de datos, verifica que MySQL esté corriendo y que el usuario/password coincidan con los definidos en `.env`.
