# SITAD — Sistema Integrado de Tramitación Aduanera Digital

Plataforma para gestionar solicitudes de salida temporal de vehículos desde Chile. Los ciudadanos pueden solicitar permisos y los funcionarios aduaneros pueden revisarlos, aprobarlos o rechazarlos.

---

## Requisitos

Antes de empezar, necesitas instalar estos programas en tu computador. Todos son gratuitos.

| Programa     | Versión        | Para qué sirve          | Descarga                                   |
| ------------ | -------------- | ----------------------- | ------------------------------------------ |
| **Java JDK** | 25 o superior  | Ejecutar el backend     | https://adoptium.net/ (Temurin 25)         |
| **Maven**    | 3.9 o superior | Compilar el código Java | https://maven.apache.org/download.cgi      |
| **Node.js**  | 22 o superior  | Ejecutar el frontend    | https://nodejs.org/ (versión LTS)          |
| **MySQL**    | 8.0            | Base de datos           | https://dev.mysql.com/downloads/installer/ |
| **VS Code**  | —              | Editor de código        | https://code.visualstudio.com/             |

### Extensiones de VS Code necesarias

Abre VS Code, ve a la barra lateral izquierda → Extensiones (`Ctrl+Shift+X`) y busca e instala:

1. **Extension Pack for Java** (Microsoft) — incluye todo lo necesario para Java
2. **Spring Boot Extension Pack** (VMware) — permite ejecutar los servicios desde VS Code

### Verificar instalación

Abre una terminal PowerShell y ejecuta estos comandos. Deberías ver algo similar:

```powershell
java -version
# openjdk version "25" ...

mvn -version
# Apache Maven 3.9.x ...

node -v
# v22.x ...

mysql --version
# mysql Ver 8.0.x ...
```

Si algún comando no se reconoce, reinicia VS Code después de instalar ese programa.

---

## 1. Clonar el proyecto

```powershell
git clone <url-del-repositorio>
cd MVP-SITAD
```

Luego abre la carpeta `MVP-SITAD` en VS Code: `Archivo → Abrir carpeta` (o `Ctrl+K Ctrl+O`).

---

## 2. Preparar VS Code

### 2.1 Copiar configuración de ejecución

El proyecto incluye un archivo de ejemplo con la configuración para ejecutar los servicios.

1. Si no existe, crea una carpeta en la raíz del proyecto con el nombre ".vscode"
2. Deja el archivo launch.json.example dentro de la carpeta y quita ".example"
3. Debería quedar ".vscode/launch.json"

### 2.2 Abrir el panel Run and Debug

Haz clic en el ícono de **reproducción ▶** en la barra lateral izquierda (o presiona `Ctrl+Shift+D`). Deberías ver 6 configuraciones numeradas del 1 al 6:

- **1. Eureka Server**
- **2. Gateway**
- **3. Auth**
- **4. Vehicular**
- **5. Fiscalizacion**
- **6. Servicio Externo**

> Si no ves ninguna configuración, verifica que copiaste el archivo `launch.json` en el paso anterior. VS Code a veces necesita recargar la ventana (`Ctrl+Shift+P` → "Developer: Reload Window").

---

## 3. Configurar la base de datos

### 3.1 Asegurarse de que MySQL esté corriendo

Busca "MySQL" en el menú Inicio y abre **MySQL Workbench**. Conéctate a la instancia local.

> Si no sabes cómo iniciar MySQL, puedes abrir "Services" (`services.msc`) y asegurarte de que el servicio "MySQL80" esté en ejecución.

### 3.2 Ejecutar el script de inicialización

En MySQL Workbench, abre una pestaña SQL (Archivo → Nueva pestaña SQL) y pega el siguiente contenido. Luego haz clic en el rayo ⚡ para ejecutarlo:

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

> También puedes abrir directamente el archivo `utilidadDB/init-db.sql` desde VS Code y copiarlo a MySQL Workbench.

**Qué deberías ver:** Mensajes verdes "Query OK" en cada línea.

### 3.3 Crear el archivo .env (si no aparece)

Puedes saltarte este paso si ya creaste el archivo. Si no lo has hecho, ejecuta el script automático del paso 4 y él lo creará por ti.

> Si tu contraseña de MySQL es distinta a `SitadDb2026!`, tendrás que editar `.env` después del paso 4 y poner la correcta en `DB_PASSWORD`. Luego carga las variables otra vez.

---

## 4. Configurar variables de entorno

El proyecto necesita variables como la clave secreta de los tokens. Para configurarlas automáticamente:

```powershell
.\scripts\cargar_env.ps1
```

Si PowerShell te pregunta sobre permisos de ejecución, escribe `S` (Sí) o ejecuta antes:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

**Qué hace este script:**

- Crea el archivo `.env` (si no existe) basado en `.env.example`
- Genera una clave secreta aleatoria para `JWT_SECRET`
- Configura contraseñas por defecto para la base de datos y los usuarios
- Carga todas las variables en la terminal actual

> **Importante:** las variables cargadas solo duran mientras esta terminal esté abierta. Si cierras la terminal y vuelves a abrir, ejecuta `.\scripts\cargar_env.ps1` otra vez.

---

## 5. Iniciar el backend (los 6 servicios)

### Inicio rápido desde la extensión de Spring Boot para VS Code

1. En la sección de APPS de la pestaña de la extensión de SpringBoot, si pasas el cursor sobre el nombre de los microservicios, aparecerá un botón de play.
2. Pincha en play en todos los microservicios, menos en sitad-common.
3. Luego de unos segundos, aparecerá un circulo verde en los microservicios levantados exitosamente.
4. Los microservicios fiscalizacion, servicio-externo, vehicular y auth solo se pondrán en verde si eureka-server está ok.

## 7. Iniciar el frontend

En una nueva terminal, ve a la ruta del directorio frontend, instala y ejecuta.

```powershell
cd frontend
npm install
npm run dev
```

**Qué deberías ver:** Un mensaje que dice "Local: http://localhost:5173".

> `npm install` solo es necesario la primera vez. Las siguientes veces puedes saltarlo y ejecutar directo `npm run dev`.

---

## 8. Verificar que todo funciona

Abre estas URLs en tu navegador:

| URL                                    | Qué deberías ver                                                         |
| -------------------------------------- | ------------------------------------------------------------------------ |
| http://localhost:5173                  | La página de inicio de SITAD con dos botones: "Pasajero" y "Funcionario" |
| http://localhost:8761                  | Panel de Eureka con 5 servicios "UP"                                     |
| http://localhost:8080/api/v1/auth/ping | Mensaje `{"mensaje":"ok"}` o similar                                     |

Si alguna no funciona, ve a la sección **Solución de problemas**.

---

## 9. Usuarios de prueba

### Funcionario (login con RUT + contraseña)

Estos usuarios se crean automáticamente al iniciar AuthService:

| Usuario              | RUT          | Contraseña (definida en .env) | Rol                    |
| -------------------- | ------------ | ----------------------------- | ---------------------- |
| Administrador SITAD  | `11111111-1` | `Admin2026!`¹                 | Pasajero + Funcionario |
| Inspector Fronterizo | `22222222-2` | `Inspector2026!`¹             | Funcionario            |

¹ Valor por defecto de `scripts/cargar_env.ps1`. Si cambiaste las variables en `.env`, usa esa contraseña.

### Ciudadano (login solo con RUT, vía ClaveÚnica simulada)

En el login de pasajero, ingresa solo el RUT (sin contraseña). El sistema simula la validación de ClaveÚnica:

| RUT          | Nombre              | Vehículos asociados                                            |
| ------------ | ------------------- | -------------------------------------------------------------- |
| `12345678-5` | Juan Pérez González | `ABCD12` (Toyota Corolla 2020), `EFGH34` (Hyundai Tucson 2022) |
| `98765432-1` | Marcela Soto López  | `IJKL56` (Mitsubishi L200 2021)                                |

> Los RUTs de ciudadano solo funcionan cuando el backend se ejecuta con el perfil `dev` (activado por defecto en las configuraciones de VS Code para Auth y Servicio-Externo).

---

## 10. Escenarios de prueba

### Escenario 1: Login como ciudadano

1. Abre http://localhost:5173
2. Haz clic en **Pasajero**
3. En el campo RUT, escribe `12345678-5`
4. Haz clic en **Iniciar sesión con ClaveÚnica**
5. ✅ Deberías ver el dashboard del ciudadano con tus datos

### Escenario 2: Login como funcionario

1. Abre http://localhost:5173
2. Haz clic en **Funcionario**
3. En RUT, escribe `11111111-1`
4. En Contraseña, escribe `Admin2026!`
5. Haz clic en **Iniciar sesión**
6. ✅ Deberías ver el dashboard del funcionario con la bandeja de trámites

### Escenario 3: Crear solicitud de salida temporal

(Primero inicia sesión como ciudadano con `12345678-5`)

1. En el dashboard, haz clic en **Solicitar salida temporal**
2. Completa los pasos del wizard:
   - **Paso 1 — Conductor:** tus datos ya vienen completos
   - **Paso 2 — Vehículo:** selecciona `ABCD12` (Toyota Corolla)
   - **Paso 3 — Legitimidad:** selecciona "Soy el propietario"
   - **Paso 4 — Documentos:** sube los documentos requeridos
   - **Paso 5 — Viaje:** ingresa fecha de salida, retorno y destino
   - **Paso 6 — Prevalidación:** revisa el resumen y envía
3. ✅ La solicitud queda en estado "Pendiente de documentación"

### Escenario 4: Revisar solicitud como funcionario

(Inicia sesión como funcionario con `11111111-1`)

1. En el dashboard del funcionario, busca el RUT `12345678-5` o la patente `ABCD12`
2. Haz clic en la solicitud para ver el detalle
3. ✅ Deberías ver los datos del conductor, vehículo y documentos

---

## Solución de problemas

### "No se reconoce 'mvn' como un comando"

Maven no está instalado o no está en el PATH. Verifica:

- Descargaste Maven de https://maven.apache.org/download.cgi
- Agregaste la carpeta `bin` de Maven a las variables de entorno del sistema
- Reiniciaste VS Code después de instalarlo

### "No se reconoce 'java' como un comando"

El JDK no está instalado o no está configurado. Verifica:

- Instalaste Java desde https://adoptium.net/ (elige Temurin 25)
- La variable `JAVA_HOME` apunta a la carpeta de instalación de JDK
- Agregaste `%JAVA_HOME%\bin` al PATH del sistema

### Error "No se puede conectar a la base de datos"

- Verifica que MySQL esté corriendo (revisa Services.msc → MySQL80)
- Verifica que ejecutaste el script SQL del paso 3
- Verifica que la contraseña en `.env` coincide con la del script SQL
- Si cambiaste la contraseña manualmente, recarga las variables con `.\scripts\cargar_env.ps1`

### VS Code no tiene las configuraciones de ejecución

- Verifica que copiaste el archivo: `Copy-Item .vscode\launch.json.example .vscode\launch.json`
- Recarga la ventana: `Ctrl+Shift+P` → "Developer: Reload Window"

### El frontend no carga en http://localhost:5173

- Espera a que el comando `npm run dev` termine de iniciar (puede tardar unos segundos)
- Verifica que no tienes otro programa usando el puerto 5173
- Si ves error de módulos, ejecuta `npm install` dentro de la carpeta `frontend/`

### Error "dirección localhost no válida" o similar

- Asegúrate de que MySQL esté configurado para aceptar conexiones desde `localhost` (no solo `127.0.0.1`)
- En MySQL Workbench, ve a "Users and Privileges" y verifica que el usuario `sitad` tenga `localhost` como host permitido
