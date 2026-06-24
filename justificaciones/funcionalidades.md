# Funcionalidades del Sistema — SITAD MVP

## Índice

1. [Roles del sistema](#1-roles-del-sistema)
2. [Flujo general de una solicitud](#2-flujo-general-de-una-solicitud)
3. [Funcionalidades del Pasajero](#3-funcionalidades-del-pasajero)
   - 3.1 Login ciudadano (ClaveÚnica)
   - 3.2 Dashboard del ciudadano
   - 3.3 Mis vehículos
   - 3.4 Registrar / editar vehículo
   - 3.5 Solicitar salida temporal
   - 3.6 Consultar estado de solicitudes
   - 3.7 Detalle de expediente
4. [Funcionalidades del Funcionario](#4-funcionalidades-del-funcionario)
   - 4.1 Login funcionario
   - 4.2 Dashboard / bandeja operacional
   - 4.3 Detalle de expediente (vista funcionario)
   - 4.4 Fiscalización en ventanilla
5. [Flujos completos](#5-flujos-completos)
   - 5.1 Flujo feliz (aprobación)
   - 5.2 Flujo con observación y corrección
   - 5.3 Flujo con rechazo
   - 5.4 Flujo sin documentos
6. [Mapa de estados y transiciones](#6-mapa-de-estados-y-transiciones)
   - 6.1 Estados
   - 6.2 Transiciones válidas
   - 6.3 Quién puede hacer cada transición
7. [Reglas de negocio](#7-reglas-de-negocio)

---

## 1. Roles del sistema

| Rol | Descripción | Cómo se autentica |
|---|---|---|
| **PASAJERO** | Ciudadano que solicita permiso de salida temporal de un vehículo | ClaveÚnica simulada (solo ingresa RUT) |
| **FUNCIONARIO** | Inspector aduanero que revisa y resuelve solicitudes | RUT + contraseña institucional |

Un usuario puede tener ambos roles (ej: Administrador SITAD con RUT `11111111-1` tiene PASAJERO + FUNCIONARIO).

---

## 2. Flujo general de una solicitud

```
[Pasajero]                          [Sistema]                       [Funcionario]
    │                                   │                               │
    ├─ Login ClaveÚnica ──────────────► │                               │
    │                                   ├─ Crea usuario si es primera vez
    │                                   │                               │
    ├─ (Opcional) Registra vehículo ►  │                               │
    │                                   │                               │
    ├─ Crea solicitud (formulario) ──► │                               │
    │                                   ├─ Estado: BORRADOR             │
    │                                   │                               │
    ├─ Agrega documentos ────────────►  │                               │
    │                                   ├─ Estado: PENDIENTE_           │
    │                                   │   DOCUMENTACION               │
    │                                   │                               │
    ├─ Solicita prevalidación ───────► │                               │
    │                                   ├─ ¿Tiene documentos?           │
    │                                   ├─ ¿Fechas válidas?             │
    │                                   ├─ Estado: PRE_VALIDADO_        │
    │                                   │   DIGITAL                     │
    │                                   │                               │
    │                                   │    (disponible en bandeja) ──►│
    │                                   │                               ├─ Revisa expediente
    │                                   │                               ├─ Puede:
    │                                   │                               │   ├─ Aprobar ──► APROBADO_
    │                                   │                               │   │               EN_VENTANILLA
    │                                   │                               │   ├─ Rechazar ──► RECHAZADO
    │                                   │                               │   └─ Observar ──► OBSERVADO
    │                                   │                               │
    │  ◄── (si OBSERVADO) ────────────│────────────────────────────────│
    │                                   │                               │
    ├─ Corrige según observación ────► │                               │
    │                                   ├─ Estado: PENDIENTE_           │
    │                                   │   DOCUMENTACION               │
    ├─ Prevalida otra vez ────────────►│                               │
    │                                   ├─ PRE_VALIDADO_DIGITAL         │
    │                                   │                               │
    │                                   │    (disponible otra vez) ────►│
    │                                   │                               └─ (repite revisión)
    │                                   │
    │  ◄── (si APROBADO) ─────────────│────────────────────────────────│
    │                                   │
    ├─ Ve QR de aprobación ──────────►│                               │
    │                                   │                               │
    │  (se presenta en frontera con     │                               │
    │   el código QR o de aprobación)   │                               │
```

---

## 3. Funcionalidades del Pasajero

### 3.1 Login ciudadano (ClaveÚnica)

**URL:** `/login/ciudadano`

**Descripción:** Pantalla de inicio de sesión para ciudadanos. Simula la autenticación vía ClaveÚnica del Gobierno de Chile.

**Campos del formulario:**

| Campo | Tipo | Placeholder | Requerido | Validación |
|---|---|---|---|---|
| RUT | Texto | `12.345.678-5` | Sí | `required` (HTML) |
| Contraseña | Password | `Ingresa tu ClaveUnica` | Sí | `required` (HTML), aunque el backend no la usa |

> **Nota:** El campo "Contraseña" se muestra visualmente pero el backend solo valida el RUT contra el servicio-externo. La contraseña se ignora en la API.

**Botones:**

| Texto | Acción | Comportamiento |
|---|---|---|
| "Iniciar sesión" (normal) | Envía POST `/api/v1/auth/login/ciudadano` con `{ rut }` | Redirige a `/ciudadano/dashboard` |
| "Ingresando..." (cargando) | Deshabilitado. Aparece mientras se procesa el login | — |
| "Solicítala aquí" | Link externo a `https://claveunica.gob.cl/` | Abre nueva pestaña |
| "Acceso funcionarios" | Link interno a `/login/funcionario` | Navega a login de funcionario |

**Estados visuales:**

| Estado | Qué se ve |
|---|---|
| **Normal** | Formulario con campos vacíos, botón "Iniciar sesión" |
| **Cargando** | Botón cambia a "Ingresando...", se deshabilita, tarjeta tiene clase `login-card--loading` |
| **Error** | Mensaje de error rojo sobre el formulario (ej: "Credenciales inválidas") |
| **Éxito** | Redirección al dashboard del ciudadano |

**Mecanismo interno:**
1. Frontend envía RUT a `POST /api/v1/auth/login/ciudadano`
2. Auth service consulta `GET /api/v1/externo/claveunica/validar?rut=...` al servicio-externo
3. Servicio-externo busca el RUT en su `ConcurrentHashMap` de personas simuladas
4. Si existe → ClaveÚnica válida → Auth crea usuario en DB (si no existe) con rol PASAJERO → genera JWT + refresh token
5. Si no existe → respuesta `valido: false` → error "Credenciales inválidas"

**Usuarios válidos para prueba (solo perfil dev):**
| RUT | Nombre |
|---|---|
| `12345678-5` | Juan Pérez González |
| `98765432-1` | Marcela Soto López |
| `11111111-1` | Administrador SITAD (también funciona) |
| `22222222-2` | Inspector Fronterizo (también funciona) |

---

### 3.2 Dashboard del ciudadano

**URL:** `/ciudadano/dashboard`

**Descripción:** Pantalla principal del ciudadano después de iniciar sesión. Muestra información del trámite, observaciones pendientes, próximos viajes y solicitudes recientes.

**APIs consultadas al cargar:**
- `GET /api/v1/vehicular/vehiculos` — lista de vehículos del ciudadano
- `GET /api/v1/vehicular/solicitudes` — lista de solicitudes del ciudadano

**Secciones de contenido:**

#### 3.2.1 Encabezado principal
- Título: "Solicitud de Ingreso o Salida Temporal de Vehículos"
- Botón "Iniciar solicitud" → navega a `/ciudadano/solicitudes/nueva`

#### 3.2.2 Descripción del trámite
Texto informativo sobre el proceso de solicitud de ingreso/salida temporal de vehículos.

#### 3.2.3 ¿Quién puede realizarlo?
Elegibilidad: ciudadanos chilenos o extranjeros con residencia definitiva, mayores de 18 años.

#### 3.2.4 ¿Qué se necesita?
Lista de 5 requisitos (identificación, vehículo, documentación, etc.)

#### 3.2.5 Documentación requerida
Lista ordenada de 4 tipos de documentos.

#### 3.2.6 Costo
Indicador: "No tiene costo"

#### 3.2.7 Observaciones pendientes (solo si existen)
Si hay solicitudes con estado `OBSERVADO`, se muestra una tabla con:

| Columna | Descripción |
|---|---|
| N° Solicitud | ID del expediente |
| Patente | Patente del vehículo |
| Observación | Texto de la observación del funcionario |
| Acción | Botón "Corregir" → `/ciudadano/expedientes/{id}` |

*Esta sección NO se renderiza si no hay observaciones pendientes.*

#### 3.2.8 Próximos Viajes
Tabla con solicitudes cuya `fechaSalida >= hoy` y estado no terminal (excluye RECHAZADO, APROBADO_EN_VENTANILLA es terminal pero se incluye).

Estados considerados "viaje activo": `BORRADOR`, `PENDIENTE_DOCUMENTACION`, `PRE_VALIDADO_DIGITAL`, `OBSERVADO`, `APROBADO_EN_VENTANILLA`.

| Columna | Descripción |
|---|---|
| Fecha Solicitud | Fecha de creación |
| Patente | Patente del vehículo |
| Paso Fronterizo | Paso seleccionado |
| Salida | Fecha de salida |
| Retorno | Fecha de retorno |
| Estado | Badge de color según estado |
| Acción | Botón "Ver" → `/ciudadano/expedientes/{id}` |
| QR | Botón "QR" (solo si estado = APROBADO_EN_VENTANILLA y tiene código de aprobación) → `/ciudadano/expedientes/{id}` |

#### 3.2.9 Solicitudes Recientes
Últimas 5 solicitudes del ciudadano.

- Si hay más de 5, se muestra botón "Ver todas las solicitudes" → `/ciudadano/solicitudes`

#### 3.2.10 Sidebar (navegación contextual)
Links: "Solicitar ingreso o salida temporal de vehículo", "Mis vehículos", "Mis solicitudes", "Volver atrás"

**Estados visuales:**

| Estado | Qué se ve |
|---|---|
| **Cargando** | `<LoadingSpinner />` |
| **Error de API** | Mensaje: "Error al cargar datos" |
| **Datos cargados** | Todas las secciones renderizadas |
| **Sin observaciones** | Sección de observaciones NO se muestra |
| **Sin solicitudes** | Tablas vacías con mensaje "Sin datos" |

---

### 3.3 Mis vehículos

**URL:** `/ciudadano/vehiculos`

**Descripción:** Lista todos los vehículos registrados por el ciudadano. Permite editar y eliminar.

**API:** `GET /api/v1/vehicular/vehiculos`

**Tabla de vehículos:**

| Columna | Descripción |
|---|---|
| Patente | Código de patente |
| Marca | Marca del vehículo |
| Modelo | Modelo del vehículo |
| Año | Año de fabricación |
| País Matrícula | País donde está matriculado |
| Acciones | Botón "Editar" + Botón "Eliminar" |

**Botones:**

| Texto | Acción | Navegación |
|---|---|---|
| "Registrar nuevo vehículo" | Navega a formulario de registro | `/ciudadano/vehiculos/registrar` |
| "Editar" (por fila) | Navega a formulario de edición | `/ciudadano/vehiculos/editar/{id}` |
| "Eliminar" (por fila) | Confirma con `window.confirm`, luego DELETE `/api/v1/vehicular/vehiculos/{id}` | Recarga la lista |

**Estados visuales:**

| Estado | Qué se ve |
|---|---|
| **Cargando** | `<LoadingSpinner />` |
| **Sin vehículos** | Mensaje: "No tienes vehículos registrados. Utilice el botón 'Registrar vehículo' para agregar uno." |
| **Con datos** | Tabla con filas de vehículos |

---

### 3.4 Registrar / editar vehículo

**URLs:**
- Crear: `/ciudadano/vehiculos/registrar`
- Editar: `/ciudadano/vehiculos/editar/{id}`

**Descripción:** Formulario para registrar un nuevo vehículo o editar uno existente.

**Campos del formulario:**

| Campo | Tipo | Placeholder / Opciones | Requerido | Solo lectura |
|---|---|---|---|---|
| Patente | Texto | `ABCD12` | Sí | No |
| Nro. Chasis/Vin/Motor | Texto | `8APBSC404KB123456` | No | No |
| Marca | Texto | `Toyota` | Sí | No |
| Modelo | Texto | `Corolla` | Sí | No |
| Año | Número | `2024` | Sí | No (min=1990, max=2027) |
| País de matrícula | Select | Chile (default), Argentina, Perú, Bolivia, Brasil | Sí | No |
| Propietario | Texto | (prellenado del usuario) | No | Sí (readOnly) |

**Validaciones del backend:**
- `patente`: `@NotBlank`
- `marca`: `@NotBlank`
- `modelo`: `@NotBlank`
- `anio`: `@NotNull`
- `paisMatricula`: `@NotBlank`

**APIs:**
- Crear: `POST /api/v1/vehicular/vehiculos` con body `{ patente, numeroChasis?, marca, modelo, anio, paisMatricula, propietarioNombre? }`
- Editar (carga): `GET /api/v1/vehicular/vehiculos/{id}`
- Editar (guardar): `PUT /api/v1/vehicular/vehiculos/{id}` con mismo body

**Botones:**

| Texto | Acción |
|---|---|
| "Guardar vehículo" (crear) / "Actualizar vehículo" (editar) | Envía formulario |
| "Guardando..." (cargando) | Deshabilitado mientras se envía |
| "Cancelar" | Navega a `/ciudadano/vehiculos` |

**Regla de negocio:** La patente debe ser única (RN-001). Si ya existe, el backend responde con error.

**Estados visuales:**

| Estado | Qué se ve |
|---|---|
| **Cargando (edición)** | `<LoadingSpinner />` mientras se carga el vehículo existente |
| **Formulario vacío** | Campos sin datos, ready para completar |
| **Formulario con datos (edición)** | Campos prellenados con datos del vehículo |
| **Enviando** | Botón deshabilitado con texto "Guardando..." |
| **Error** | Mensaje de error rojo arriba del formulario |
| **Éxito** | Redirección a `/ciudadano/vehiculos` |

---

### 3.5 Solicitar salida temporal

**URL:** `/ciudadano/solicitudes/nueva`

**Descripción:** Formulario único de varias secciones (wizard visual) para crear una solicitud de salida temporal de vehículo.

**Flujo general:**
1. Carga vehículos del ciudadano desde `GET /api/v1/vehicular/vehiculos`
2. Si no tiene vehículos → muestra mensaje de advertencia + botón "Ir a registrar vehículo"
3. Si tiene vehículos → muestra formulario completo

**Secciones del formulario:**

#### Sección 1: Identificación del conductor

| Campo | Tipo | Placeholder | Requerido | Solo lectura |
|---|---|---|---|---|
| RUN | Texto | (prellenado del JWT) | Sí | Sí |
| N° de documento | Texto | `Documento de identidad` | Sí | No |
| Nombres | Texto | `Juan` (hardcoded) | Sí | Sí |
| Apellido paterno | Texto | `Pérez` (hardcoded) | Sí | Sí |
| Apellido materno | Texto | `González` (hardcoded) | Sí | Sí |

> Los campos de nombres están hardcodeados en el frontend con valores de ejemplo. En una versión real vendrían del JWT.

#### Sección 2: Identificación del vehículo

| Campo | Tipo | Opciones | Requerido |
|---|---|---|---|
| Vehículo | Select (dropdown) | Lista de vehículos del ciudadano (patente - marca modelo) | Sí |

Al seleccionar un vehículo, se muestra detalle:
- Patente, Marca/Modelo, Año, País de Matrícula

#### Sección 3: Legitimidad de uso

| Campo | Tipo | Opciones | Requerido |
|---|---|---|---|
| ¿Es propietario? | Radio | Sí / No | Sí |

Si selecciona "No" (conductor ≠ propietario):

| Campo | Tipo | Opciones | Requerido |
|---|---|---|---|
| Tipo autorización | Select | AUTORIZACION_NOTARIAL, PODER_ESPECIAL | Sí (condicional) |

Si selecciona "No", también se habilita la subsección de "Documentos de autorización":

| Campo | Tipo | Requerido |
|---|---|---|
| Tipo | Select (AUTORIZACION_NOTARIAL, PODER_ESPECIAL) | Sí |
| Nombre | Texto | Sí |
| Archivo | Texto (input file simulado) | Sí |
| Botón "+ Agregar" | Agrega el documento a la lista | — |

Los documentos agregados aparecen en una lista con botón "Eliminar".

#### Sección 4: Documentación del vehículo

| Campo | Tipo | Requerido |
|---|---|---|
| Tipo | Select (PADRON, SEGURO_INTERNACIONAL) | Sí |
| Nombre | Texto | Sí |
| Archivo | Texto (input file simulado) | Sí |
| Botón "+ Agregar documento" | Agrega el documento a la lista | — |

#### Sección 5: Viaje

| Campo | Tipo | Opciones | Requerido |
|---|---|---|---|
| País destino | Select | Argentina, Perú, Bolivia, Brasil | Sí |
| Paso fronterizo | Select | Los Libertadores, Paso Pehuenche | Sí |
| Fecha salida | Date | Calendario | Sí |
| Fecha retorno | Date | Calendario | Sí |

#### Sección 6: Resumen
Muestra resumen de: datos del conductor, vehículo seleccionado, documentos, y datos del viaje.

**Botón "Enviar Solicitud"** → ejecuta el submit.

**APIs llamadas al enviar:**
1. `POST /api/v1/vehicular/solicitudes` con body:
```json
{
  "vehiculoId": 1,
  "conductorRut": "12345678-5",
  "conductorNumeroDocumento": "ID-123",
  "conductorNombre": "Juan",
  "conductorApellidoPaterno": "Pérez",
  "conductorApellidoMaterno": "González",
  "esPropietario": true,
  "tipoAutorizacion": null,
  "fechaSalida": "2026-07-01",
  "fechaRetorno": "2026-07-15",
  "paisDestino": "Argentina",
  "pasoFronterizo": "Los Libertadores"
}
```

2. Por cada documento: `POST /api/v1/vehicular/documentos` con body:
```json
{
  "solicitudId": 1,
  "nombre": "Padrón del vehículo",
  "tipo": "PADRON",
  "archivo": "base64..."
}
```

> **Nota:** El campo `archivo` acepta cualquier string (base64, URL, o texto plano). El sistema no valida el contenido del archivo; es un campo de texto libre.

**Resultado del submit:**
- La solicitud se crea con estado `BORRADOR`
- Cada documento agregado cambia automáticamente el estado a `PENDIENTE_DOCUMENTACION`
- Redirecciona a `/ciudadano/solicitudes`

**Estados visuales:**

| Estado | Qué se ve |
|---|---|
| **Cargando vehículos** | `<LoadingSpinner />` |
| **Sin vehículos** | Mensaje de advertencia + botón "Ir a registrar vehículo". El formulario NO se muestra. |
| **Formulario** | 6 secciones con campos |
| **No propietario** | Campos adicionales de tipo autorización + documentos de autorización |
| **Enviando** | Botón deshabilitado "Enviando..." |
| **Error** | Mensaje de error rojo |

---

### 3.6 Consultar estado de solicitudes

**URL:** `/ciudadano/solicitudes`

**Descripción:** Lista todas las solicitudes del ciudadano con filtros y detalle.

**API:** `GET /api/v1/vehicular/solicitudes`

**Filtros disponibles:**

| Filtro | Tipo | Opciones |
|---|---|---|
| Estado | Select | "Todos los estados", BORRADOR, PENDIENTE_DOCUMENTACION, PRE_VALIDADO_DIGITAL, OBSERVADO, APROBADO_EN_VENTANILLA, RECHAZADO |
| Fecha desde | Date | Calendario |
| Fecha hasta | Date | Calendario |
| Buscar vehículo | Texto | Busca por patente o marca |

**Tabla de solicitudes:**

| Columna | Descripción |
|---|---|
| Fecha | Fecha de solicitud |
| Patente | Patente del vehículo |
| Paso Fronterizo | Paso seleccionado |
| Estado | Badge de color (StatusBadge) |
| Acción | Botón "Detalle" → `/ciudadano/expedientes/{id}` |

**Orden:** Por fecha de solicitud descendente (más reciente primero).

**Estados visuales:**

| Estado | Qué se ve |
|---|---|
| **Cargando** | `<LoadingSpinner />` |
| **Sin solicitudes** | Mensaje: "No has realizado solicitudes de salida temporal" |
| **Con datos** | Tabla con filas |
| **Filtros activos** | Tabla filtrada según criterios |

---

### 3.7 Detalle de expediente (vista ciudadano)

**URL:** `/ciudadano/expedientes/{id}`

**Descripción:** Vista detallada de una solicitud con pestañas de información.

**APIs consultadas al cargar:**
- `GET /api/v1/vehicular/solicitudes/{id}` — datos completos de la solicitud
- `GET /api/v1/fiscalizacion/tramites/{id}/historial` — historial de cambios (si falla, se ignora)

**Datos mostrados:**

| Campo | Descripción |
|---|---|
| RUT Conductor | RUT del conductor |
| Nombre Conductor | Nombre completo del conductor |
| N Documento | Número de documento (si existe) |
| Es propietario | Sí / No |
| Tipo autorización | Tipo de autorización (si no es propietario) |
| Patente | Patente del vehículo |
| Marca/Modelo | Marca y modelo del vehículo |
| País destino | Destino del viaje |
| Paso fronterizo | Paso seleccionado |
| Fecha salida | Fecha de inicio del viaje |
| Fecha retorno | Fecha de regreso |
| Fecha solicitud | Fecha de creación |
| Último cambio estado | Fecha del último cambio de estado |
| Estado actual | Badge de color |

**Si hay documentos:** Se muestra tabla de documentos (nombre, tipo, fecha).

**Historial (línea de tiempo):**
- Solo se muestran registros del historial que tienen `observacion` (comentarios del funcionario)
- Cada entrada muestra: fecha, resultado, y observación

**QR de aprobación:**
Solo se muestra si `estado === 'APROBADO_EN_VENTANILLA'` y existe `codigoAprobacion`.
- Muestra código QR generado con la librería `qrcode`
- Botón "Descargar QR" → descarga imagen PNG

**Sidebar:** Links a: Solicitar ingreso/salida, Mis vehículos, Mis solicitudes, Volver atrás

**Estados visuales:**

| Estado | Qué se ve |
|---|---|
| **Cargando** | `<LoadingSpinner />` |
| **Error** | Mensaje de error + botón "Volver" |
| **No encontrado** | "Expediente no encontrado" + botón "Volver" |
| **Datos cargados** | Toda la información del expediente |
| **Sin documentos** | Sección de documentos no se muestra o muestra vacío |
| **Sin historial** | Sección de historial no se muestra |
| **Aprobado** | QR visible + botón descargar |

---

## 4. Funcionalidades del Funcionario

### 4.1 Login funcionario

**URL:** `/login/funcionario`

**Descripción:** Pantalla de inicio de sesión para funcionarios aduaneros. Interfaz visual diferente al login ciudadano (fondo azul acero `#C8D6E5`, sin elementos de ClaveÚnica).

**Campos del formulario:**

| Campo | Tipo | Placeholder | Requerido | Validación backend |
|---|---|---|---|---|
| RUT | Texto | `11.111.111-1` | Sí | `@Pattern("^\\d{7,8}-[\\dKk]$")` |
| Contraseña | Password | `Ingrese su contraseña` | Sí | `@NotBlank` |

**Botones:**

| Texto | Acción |
|---|---|
| "Iniciar Sesión" (normal) / "Ingresando..." (cargando) | POST `/api/v1/auth/login/funcionario` con `{ rut, password }` |
| "Acceso ciudadano" | Link a `/login/ciudadano` |

**Mecanismo interno:**
1. Auth service busca usuario por RUT en DB
2. Si no existe → error
3. Si existe pero no tiene rol FUNCIONARIO → error
4. Valida password con BCrypt
5. Genera JWT + refresh token (sesión tipo CREDENCIAL_INSTITUCIONAL)
6. Redirige a `/funcionario/dashboard`

**Usuarios válidos para prueba:**

| RUT | Contraseña (default) | Roles |
|---|---|---|
| `11111111-1` | `Admin2026!` | PASAJERO + FUNCIONARIO |
| `22222222-2` | `Inspector2026!` | FUNCIONARIO |

---

### 4.2 Dashboard / bandeja operacional

**URL:** `/funcionario/dashboard`

**Descripción:** Bandeja principal del funcionario para buscar y revisar solicitudes. Incluye tabs por estado y buscador.

**API:** `GET /api/v1/fiscalizacion/tramites` (sin filtros — obtiene todas, filtra en cliente)

**Filtros / búsqueda:**

| Filtro | Tipo | Placeholder |
|---|---|---|
| Patente | Texto | Buscar por patente |
| RUN | Texto | Buscar por RUN |
| N° Expediente | Texto | Buscar por N° de expediente |
| Botón "Buscar" | Button | Refresca datos |

**Tabs de estado:**

| Tab | Filtro aplicado (lado cliente) |
|---|---|
| Pre Validado | `estado === 'PRE_VALIDADO_DIGITAL'` |
| Pendientes | `estado ∈ ['BORRADOR', 'PENDIENTE_DOCUMENTACION']` |
| Observadas | `estado === 'OBSERVADO'` |
| Aprobadas | `estado === 'APROBADO_EN_VENTANILLA'` |
| Rechazadas | `estado === 'RECHAZADO'` |
| Todas | Sin filtro de estado |

**Tabla de trámites:**

| Columna | Descripción |
|---|---|
| ID | N° de expediente |
| Patente | Patente del vehículo |
| Marca | Marca del vehículo |
| Conductor | Nombre del conductor |
| Destino | País destino |
| Salida | Fecha de salida |
| Estado | Badge de color |
| Acción | Botón "Ir a solicitud" → `/funcionario/expedientes/{id}` |

**Botón adicional:**
- "Nueva Fiscalización" → `/funcionario/fiscalizacion`

**Estados visuales:**

| Estado | Qué se ve |
|---|---|
| **Cargando** | `<LoadingSpinner />` |
| **Sin resultados** | Mensaje: "No se encontraron trámites" |
| **Con datos** | Tabla con filas |
| **Tab activo** | El tab seleccionado tiene estilo activo (clase CSS `tabs__btn--active`) |

---

### 4.3 Detalle de expediente (vista funcionario)

**URL:** `/funcionario/expedientes/{id}`

**Descripción:** Misma vista de detalle que el ciudadano, pero con botones de acción para el funcionario.

**APIs consultadas al cargar:**
- `GET /api/v1/vehicular/solicitudes/{id}`
- `GET /api/v1/fiscalizacion/tramites/{id}/historial`

**Datos mostrados:** Idéntico a la vista ciudadano (sección 3.7).

**Historial para funcionario:** Muestra TODOS los registros del historial, no solo los que tienen observación.

**Botones de acción:**

| Botón | Acción | Requisito |
|---|---|---|
| "Pre-Aprobar" | POST `/api/v1/fiscalizacion/tramites/{id}/preAprobar` con body `{ observacion? }` | Sin observación obligatoria |
| "Aprobar" | POST `/api/v1/fiscalizacion/tramites/{id}/aprobar` con body `{ observacion? }` | Sin observación obligatoria |
| "Observar" | POST `/api/v1/fiscalizacion/tramites/{id}/observar` con body `{ observacion }` | Observación obligatoria (`@NotBlank`) |
| "Rechazar" | POST `/api/v1/fiscalizacion/tramites/{id}/rechazar` con body `{ observacion }` | Observación obligatoria (`@NotBlank`) |

**Nota sobre los botones:**
- "Pre-Aprobar" y "Aprobar" tienen comportamiento casi idéntico, pero registran distinto resultado en el historial (`PRE_APROBADO` vs `APROBADO`)
- Ambos llaman a `PATCH /api/v1/vehicular/internal/tramites/{id}/estado` para cambiar el estado

**ConfirmDialog (modal de confirmación):**

Se abre al hacer clic en cualquier botón de acción.

| Acción | Título del modal | Texto confirmación | ¿Requiere observación? | Botón confirmación | ¿Peligroso? |
|---|---|---|---|---|---|
| Pre-Aprobar | "Pre-Aprobar trámite" | "¿Está seguro de pre-aprobar el trámite ID {id}?" | No | "Pre-Aprobar" | No (estilo primary) |
| Aprobar | "Aprobar trámite" | "¿Está seguro de aprobar el trámite ID {id}?" | No | "Aprobar" | No (estilo primary) |
| Observar | "Observar trámite" | "¿Está seguro de observar el trámite ID {id}?" | **Sí** — textarea obligatorio | "Observar" | Sí (estilo danger) |
| Rechazar | "Rechazar trámite" | "¿Está seguro de rechazar el trámite ID {id}?" | **Sí** — textarea obligatorio | "Rechazar" | Sí (estilo danger) |

El textarea de observación tiene placeholder distinto según la acción:
- Observar: "Ingrese la observación"
- Rechazar: "Ingrese el motivo del rechazo"

**Efecto interno de cada acción:**

| Acción | FiscalizacionService (feign) | VehicularService.actualizarEstado | Historial guardado | Resultado visual |
|---|---|---|---|---|
| Pre-Aprobar | `actualizarEstado(PRE_VALIDADO_DIGITAL)` | Estado → PRE_VALIDADO_DIGITAL | ControlVentanilla: resultado=PRE_APROBADO | Recarga página |
| Aprobar | `actualizarEstado(APROBADO_EN_VENTANILLA)` | Estado → APROBADO_EN_VENTANILLA, genera UUID codigoAprobacion | ControlVentanilla: resultado=APROBADO | Recarga página |
| Observar | `actualizarEstado(OBSERVADO)` con observacion | Estado → OBSERVADO, guarda observacion | ControlVentanilla: resultado=OBSERVADO | Recarga página |
| Rechazar | `actualizarEstado(RECHAZADO)` con observacion | Estado → RECHAZADO, guarda observacion | ControlVentanilla: resultado=RECHAZADO | Recarga página |

---

### 4.4 Fiscalización en ventanilla

**URL:** `/funcionario/fiscalizacion`

**Descripción:** Pantalla de fiscalización presencial en el paso fronterizo. Permite buscar un trámite por ID, escanear QR (simulado), escanear cédula (simulado), y aprobar/rechazar/observar en el momento.

#### Estado 1: Búsqueda (ningún trámite seleccionado)

Tres métodos para seleccionar un trámite:

##### Método A: Escáner QR (simulado)
- Área visual con ícono de cámara
- Botón "Activar escáner" → activa la cámara web (`getUserMedia`), pero la funcionalidad de escaneo real NO está implementada
- Botón "Escanear" → **simulación**: busca la primera solicitud con estado `APROBADO_EN_VENTANILLA` vía `GET /api/v1/fiscalizacion/tramites?estado=APROBADO_EN_VENTANILLA` y selecciona el primer resultado
- Durante la simulación: muestra ícono de carga "Escaneando..."

##### Método B: Escáner de cédula (simulado)
- Botón "Escanear" → **simulación**: setea `searchRut` a `'12345678-9'` y llama a `GET /api/v1/fiscalizacion/tramites?rut=12345678-9`

##### Método C: Búsqueda manual por ID de trámite
- Input "N° de Trámite" + botón "Buscar"
- Al presionar Enter en el input → llama a `buscarPorId()`
- `GET /api/v1/fiscalizacion/tramites?id={searchId}`

#### Estado 2: Trámite seleccionado, pendiente de acción

Se muestra:

**Alertas policiales** (simuladas, siempre muestran "sin novedad"):
- Robo: Sin novedad
- Arraigo: Sin novedad
- Detención: Sin novedad

**Información de la solicitud:** Detalle completo del expediente.

**Documentos adjuntos:** Tabla si existen.

**Botones de acción:**

| Botón | Estilo | Acción |
|---|---|---|
| "Aprobar Paso" | Primary | Abre confirm dialog (sin observación requerida) |
| "Observar" | Warning | Abre confirm dialog (observación requerida) |
| "Rechazar" | Danger | Abre confirm dialog (observación requerida) |

#### Estado 3: Trámite aprobado

Después de aprobar:

```
✓ Paso aprobado
El paso del trámite ID {id} ha sido aprobado exitosamente.
```

Botón "Nueva fiscalización" → resetea todo el estado y vuelve al Estado 1.

---

## 5. Flujos completos

### 5.1 Flujo feliz (aprobación)

```
1. Ciudadano se loguea con RUT 12345678-5
2. Ciudadano registra vehículo (patente: ABCD12)
3. Ciudadano crea solicitud con:
   - Vehículo: ABCD12
   - Es propietario: Sí
   - Documentos: PADRON, SEGURO_INTERNACIONAL
   - Viaje: Argentina, Los Libertadores, 01-07-2026 → 15-07-2026
   ▶ Solicitud creada → BORRADOR
   ▶ Documentos agregados → PENDIENTE_DOCUMENTACION

4. Ciudadano solicita prevalidación
   ▶ Sistema verifica:
      ✓ Vehículo registrado
      ✓ Documentos presentes (PADRON, SEGURO_INTERNACIONAL)
      ✓ Fechas válidas (salida ≥ hoy, retorno > salida)
   ▶ Estado → PRE_VALIDADO_DIGITAL

5. Funcionario inicia sesión (11111111-1)
6. Funcionario ve trámite en tab "Pre Validado"
7. Funcionario hace clic en "Ir a solicitud"
8. Funcionario revisa datos del expediente
9. Funcionario hace clic en "Aprobar"
   ▶ Modal: "¿Está seguro de aprobar el trámite ID {id}?"
10. Funcionario confirma
    ▶ Estado → APROBADO_EN_VENTANILLA
    ▶ Se genera código de aprobación UUID
    ▶ Se registra en ControlVentanilla

11. Ciudadano ve QR de aprobación en el detalle del expediente
12. Ciudadano descarga QR y lo presenta en frontera
```

### 5.2 Flujo con observación y corrección

```
Pasos 1-4: igual que flujo feliz

5. Funcionario revisa y hace clic en "Observar"
6. Modal pide observación obligatoria
7. Funcionario escribe: "Falta seguro internacional vigente"
8. Funcionario confirma
   ▶ Estado → OBSERVADO
   ▶ Observación guardada

9. Ciudadano ve "Observaciones Pendientes" en su dashboard
10. Ciudadano hace clic en "Corregir"
11. Ciudadano ve la observación del funcionario
12. Ciudadano agrega el documento SEGURO_INTERNACIONAL faltante
    ▶ Al agregar documento → estado pasa a PENDIENTE_DOCUMENTACION
13. Ciudadano solicita prevalidación otra vez
    ▶ Estado → PRE_VALIDADO_DIGITAL

14. Funcionario ve trámite otra vez en "Pre Validado"
15. Funcionario revisa y aprueba
    ▶ Estado → APROBADO_EN_VENTANILLA
```

### 5.3 Flujo con rechazo

```
Pasos 1-4: igual que flujo feliz

5. Funcionario revisa y hace clic en "Rechazar"
6. Modal pide motivo de rechazo (obligatorio)
7. Funcionario escribe: "El vehículo no cumple con los requisitos de emisiones"
8. Funcionario confirma
   ▶ Estado → RECHAZADO
   ▶ El trámite termina (no se puede reactivar)

9. Ciudadano ve el rechazo en el detalle del expediente
10. Ciudadano puede crear una nueva solicitud desde cero
```

### 5.4 Flujo sin documentos (prevalidación fallida)

```
1. Ciudadano crea solicitud
   ▶ BORRADOR
2. Ciudadano NO agrega documentos
3. Ciudadano solicita prevalidación
   ▶ Sistema verifica:
      ✓ Vehículo registrado
      ✗ Documentos: NO presentes (lista vacía)
   ▶ Estado → PENDIENTE_DOCUMENTACION
   ▶ Mensaje: faltan documentos (el sistema mantiene el estado,
      no avanza a PRE_VALIDADO_DIGITAL)

4. Ciudadano agrega documentos
5. Ciudadano prevalida otra vez
   ▶ Estado → PRE_VALIDADO_DIGITAL
```

---

## 6. Mapa de estados y transiciones

### 6.1 Estados

| Estado | Significado | ¿Terminal? |
|---|---|---|
| `BORRADOR` | Solicitud creada, sin documentos | No |
| `PENDIENTE_DOCUMENTACION` | Documentos cargados, esperando prevalidación | No |
| `PRE_VALIDADO_DIGITAL` | Prevalidación automática exitosa, listo para revisión del funcionario | No |
| `OBSERVADO` | Funcionario marcó observación, ciudadano debe corregir | No |
| `APROBADO_EN_VENTANILLA` | Aprobado por funcionario | Sí |
| `RECHAZADO` | Rechazado por funcionario | Sí |

### 6.2 Transiciones válidas

| Desde | Hacia | Gatillante | Quién | Endpoint |
|---|---|---|---|---|
| *(ninguno)* | BORRADOR | Crear solicitud | Pasajero | `POST /api/v1/vehicular/solicitudes` |
| BORRADOR | PENDIENTE_DOCUMENTACION | Agregar primer documento | Pasajero | `POST /api/v1/vehicular/documentos` |
| PENDIENTE_DOCUMENTACION | PRE_VALIDADO_DIGITAL | Prevalidación exitosa (tiene docs) | Pasajero | `POST /api/v1/vehicular/solicitudes/{id}/prevalidar` |
| PENDIENTE_DOCUMENTACION | *(se mantiene)* | Prevalidación fallida (sin docs) | Pasajero | `POST /api/v1/vehicular/solicitudes/{id}/prevalidar` |
| PRE_VALIDADO_DIGITAL | APROBADO_EN_VENTANILLA | Aprobar | Funcionario | `POST /api/v1/fiscalizacion/tramites/{id}/aprobar` |
| PRE_VALIDADO_DIGITAL | RECHAZADO | Rechazar | Funcionario | `POST /api/v1/fiscalizacion/tramites/{id}/rechazar` |
| PRE_VALIDADO_DIGITAL | OBSERVADO | Observar | Funcionario | `POST /api/v1/fiscalizacion/tramites/{id}/observar` |
| OBSERVADO | PENDIENTE_DOCUMENTACION | Agregar documento (corrección) | Pasajero | `POST /api/v1/vehicular/documentos` |
| *(cualquier no terminal)* | PENDIENTE_DOCUMENTACION | Agregar documento | Pasajero | `POST /api/v1/vehicular/documentos` |

### 6.3 Quién puede hacer cada transición

```
            ┌──────────────────────────────────────────────┐
            │            PASAJERO (frontend)               │
            │                                              │
            │  Puede:                                      │
            │  • Crear solicitud                           │
            │  • Agregar documentos                        │
            │  • Solicitar prevalidación                   │
            │                                              │
            │  NO puede:                                   │
            │  • Aprobar, rechazar ni observar              │
            └──────────────────────────────────────────────┘

            ┌──────────────────────────────────────────────┐
            │          FUNCIONARIO (frontend)              │
            │                                              │
            │  Puede:                                      │
            │  • Aprobar (APROBADO_EN_VENTANILLA)          │
            │  • Rechazar (RECHAZADO)                      │
            │  • Observar (OBSERVADO)                      │
            │                                              │
            │  NO puede:                                   │
            │  • Crear solicitudes                         │
            │  • Modificar documentos                      │
            └──────────────────────────────────────────────┘
```

---

## 7. Reglas de negocio

### Vehículo

| Regla | Descripción | Implementación |
|---|---|---|
| RN-001 | La patente debe ser única | `VehiculoRepository.existsByPatente()` + validación en `VehicularService.registrarVehiculo()` |
| RN-002 | Un vehículo puede participar en múltiples expedientes | Relación `@OneToMany` desde `Vehiculo` a `SalidaTemporalVehiculo` (un vehículo, muchos expedientes) |
| RN-003 | Todo expediente debe asociarse a un vehículo | `SolicitudRequest.vehiculoId` es `@NotNull` |

### Legitimidad

| Regla | Descripción | Implementación |
|---|---|---|
| RN-004 | El conductor puede coincidir con el propietario | `esPropietario = true` en el formulario |
| RN-005 | Si conductor ≠ propietario, debe existir antecedente que justifique el uso | `tipoAutorizacion` requerido si `esPropietario = false` |

### Viaje

| Regla | Descripción | Implementación |
|---|---|---|
| RN-006 | Todo expediente debe indicar paso fronterizo | `pasoFronterizo` es `@NotBlank` |
| RN-007 | Todo expediente debe indicar destino | `paisDestino` es `@NotBlank` |
| RN-008 | La fecha de retorno debe ser posterior a la fecha de salida | Validación en `VehicularService.solicitarSalidaTemporal()`: `fechaRetorno.isAfter(fechaSalida)` |
| — | La fecha de salida debe ser hoy o futura | Validación: `!fechaSalida.isBefore(LocalDate.now())` |

### Fiscalización

| Regla | Descripción | Implementación |
|---|---|---|
| RN-009 | Solo funcionarios pueden aprobar | `FiscalizacionController` requiere `ROLE_FUNCIONARIO` |
| RN-010 | Solo funcionarios pueden rechazar | Mismo control de acceso |
| RN-011 | Todo rechazo debe registrar observación | `RechazarRequest.observacion` es `@NotBlank` |
| — | Toda observación debe tener texto | `ObservarRequest.observacion` es `@NotBlank` |

---

## Apéndice: Referencia rápida de APIs

### Autenticación (auth — puerto 8081)

| Método | Endpoint | Body | Respuesta |
|---|---|---|---|
| POST | `/api/v1/auth/login/ciudadano` | `{ "rut": "12345678-5" }` | `{ "accessToken": "...", "expiresIn": 1800000 }` + Set-Cookie |
| POST | `/api/v1/auth/login/funcionario` | `{ "rut": "11111111-1", "password": "..." }` | `{ "accessToken": "...", "expiresIn": 1800000 }` + Set-Cookie |
| POST | `/api/v1/auth/refresh` | (cookie) | `{ "accessToken": "...", "expiresIn": 1800000 }` |
| POST | `/api/v1/auth/logout` | (cookie) | `{ "mensaje": "Sesión cerrada correctamente" }` |

### Vehículos y solicitudes (vehicular — puerto 8082)

| Método | Endpoint | Uso |
|---|---|---|
| POST | `/api/v1/vehicular/vehiculos` | Registrar vehículo |
| GET | `/api/v1/vehicular/vehiculos` | Listar mis vehículos |
| GET | `/api/v1/vehicular/vehiculos/{id}` | Obtener vehículo |
| PUT | `/api/v1/vehicular/vehiculos/{id}` | Editar vehículo |
| DELETE | `/api/v1/vehicular/vehiculos/{id}` | Eliminar vehículo |
| POST | `/api/v1/vehicular/solicitudes` | Crear solicitud |
| GET | `/api/v1/vehicular/solicitudes` | Listar mis solicitudes |
| GET | `/api/v1/vehicular/solicitudes/{id}` | Obtener detalle solicitud |
| POST | `/api/v1/vehicular/documentos` | Agregar documento |
| POST | `/api/v1/vehicular/solicitudes/{id}/prevalidar` | Prevalidar solicitud |
| GET | `/api/v1/vehicular/solicitudes/{id}/qr` | Obtener datos QR |
| GET | `/api/v1/vehicular/internal/tramites` | [Interno] Buscar trámites |
| PATCH | `/api/v1/vehicular/internal/tramites/{id}/estado` | [Interno] Cambiar estado |

### Fiscalización (fiscalizacion — puerto 8083)

| Método | Endpoint | Uso |
|---|---|---|
| GET | `/api/v1/fiscalizacion/tramites` | Buscar trámites |
| POST | `/api/v1/fiscalizacion/tramites/{id}/aprobar` | Aprobar |
| POST | `/api/v1/fiscalizacion/tramites/{id}/preAprobar` | Pre-aprobar |
| POST | `/api/v1/fiscalizacion/tramites/{id}/rechazar` | Rechazar |
| POST | `/api/v1/fiscalizacion/tramites/{id}/observar` | Observar |
| GET | `/api/v1/fiscalizacion/tramites/{id}/historial` | Historial de cambios |

### Servicios externos simulados (servicio-externo — puerto 8084)

| Método | Endpoint | Uso |
|---|---|---|
| GET | `/api/v1/externo/claveunica/validar?rut=...` | Validar ClaveÚnica |
| GET | `/api/v1/externo/registro-civil/persona?rut=...` | Consultar persona + vehículos |
| GET | `/api/v1/externo/registro-civil/vehiculo?patente=...` | Consultar vehículo por patente |
