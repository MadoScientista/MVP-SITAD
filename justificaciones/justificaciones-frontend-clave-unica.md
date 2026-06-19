# Guía de Estilos – Tarjeta de Inicio de Sesión con ClaveÚnica
**Complemento de `chileatiende-style-guide.md` · No incluye header ni footer**

---

> **Propósito de este documento**
> Define las reglas visuales para la tarjeta de autenticación con ClaveÚnica dentro del MVP de Aduanas. La pantalla de login es el primer punto de contacto del usuario con el sistema: si se ve oficial y familiar, baja la fricción de entrada. Si se ve improvisada, genera desconfianza y abandono.
>
> **Fuente normativa:** Manual de uso del botón ClaveÚnica publicado por la Secretaría de Gobierno Digital en `wikiguias.digital.gob.cl/Manuales/BotónCU`. El botón ClaveÚnica tiene especificaciones visuales **obligatorias** definidas por el Estado; no se puede reestilizar libremente.
>
> **Dependencia:** este documento asume que los tokens de color y tipografía de `chileatiende-style-guide.md` ya están cargados (`--color-primary`, `--font-body`, etc.).

---

## 1. Estructura de la pantalla de login

La pantalla de autenticación con ClaveÚnica sigue un patrón de **página centrada de propósito único**: no hay distracciones laterales, el foco es exclusivamente autenticarse para continuar el trámite.

```
┌─────────────────────────────────────────┐
│           [fondo gris neutro]           │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │         [logo servicio]         │   │
│   │                                 │   │
│   │  Nombre del servicio / trámite  │   │
│   │  Descripción corta (1 línea)    │   │
│   │                                 │   │
│   │  ─────────────────────────────  │   │
│   │                                 │   │
│   │  Para continuar, inicia sesión  │   │
│   │  con tu ClaveÚnica              │   │
│   │                                 │   │
│   │  [ ClaveÚnica  Iniciar sesión ] │   │
│   │                                 │   │
│   │  ¿No tienes ClaveÚnica? →link   │   │
│   └─────────────────────────────────┘   │
│                                         │
│      Logo GOB.CL  ·  Pie institucional  │
└─────────────────────────────────────────┘
```

> **Por qué este layout:** la pantalla de ClaveÚnica oficial (`accounts.claveunica.gob.cl`) usa exactamente este patrón: tarjeta blanca centrada sobre fondo gris, con el botón como único CTA. Replicarlo genera reconocimiento inmediato. El usuario ya lo vio en otros trámites del Estado (cupón de gas, pase cultural, etc.) y sabe qué hacer.

---

## 2. Página contenedora (fondo de la pantalla de login)

```css
/* Fondo de la pantalla completa de login
 * El gris neutro #EEEEEE del sistema ChileAtiende actúa como "sala de espera":
 * separa visualmente la tarjeta del contenido y comunica que estás en un
 * paso previo al sistema, no dentro de él todavía. */
.login-page {
  min-height: 100vh;
  background-color: #EEEEEE;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: 'Roboto', sans-serif;
}
```

---

## 3. La tarjeta de login

```css
/* Tarjeta principal de autenticación
 * Fondo blanco sobre gris: el mismo patrón de profundidad que usa toda la
 * UI de ChileAtiende para componentes accionables. El ancho máximo de 480px
 * es el mismo que usa la pantalla oficial de ClaveÚnica: suficiente para leer
 * cómodamente sin que el contenido se disperse en pantallas grandes. */
.login-card {
  background-color: #FFFFFF;
  border: 1px solid #A8B7C7;   /* --color-accent del sistema */
  border-radius: 4px;
  width: 100%;
  max-width: 480px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* En móvil la tarjeta ocupa todo el ancho con margen lateral mínimo */
@media (max-width: 540px) {
  .login-card {
    padding: 2rem 1.25rem;
    border-radius: 0;  /* En pantallas muy pequeñas, sin bordes curvos */
    border-left: none;
    border-right: none;
  }
}
```

---

## 4. Identidad del servicio dentro de la tarjeta

```css
/* Bloque de identidad: logo + nombre del servicio
 * Contexto: el usuario llega a esta tarjeta desde una ficha de trámite
 * (ej: "Declaración Jurada de Importación"). Mostrar el nombre del servicio
 * evita la pregunta "¿para qué me están pidiendo que me autentique?".
 * La pantalla oficial de ClaveÚnica siempre muestra el nombre del servicio
 * solicitante antes del botón. */
.login-card__service-identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  width: 100%;
}

/* Logo del servicio / institución
 * Usar el logo oficial del Servicio Nacional de Aduanas o del ministerio
 * correspondiente. Tamaño máximo controlado para no dominar la tarjeta. */
.login-card__service-logo {
  height: 56px;
  width: auto;
  max-width: 200px;
  object-fit: contain;
}

/* Nombre del servicio que solicita autenticación
 * Tipografía Roboto (no Roboto Slab) porque es un label funcional, no un
 * título editorial. Debe ser conciso: máximo 2 líneas. */
.login-card__service-name {
  font-family: 'Roboto', sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111111;
  margin: 0;
  line-height: 1.3;
}

/* Descripción corta del trámite
 * Una sola oración que recuerda al usuario qué está a punto de hacer.
 * Ej: "Sistema de Declaración de Importación – Servicio Nacional de Aduanas" */
.login-card__service-description {
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
  color: #4A4A4A;
  margin: 0;
  line-height: 1.5;
}
```

---

## 5. Separador visual

```css
/* Línea divisoria entre la identidad del servicio y la acción de login.
 * Comunica que lo de arriba es "contexto" y lo de abajo es "acción".
 * Evita usar bordes gruesos o colores llamativos: el separador no debe
 * competir con el botón de ClaveÚnica. */
.login-card__divider {
  width: 100%;
  border: none;
  border-top: 1px solid #A8B7C7;
  margin: 0;
}
```

---

## 6. Bloque de instrucción de autenticación

```css
/* Texto instructivo previo al botón
 * Redacción recomendada: "Para continuar, inicia sesión con tu ClaveÚnica"
 * — No usar: "Ingresa con tu ClaveÚnica" (redundante con el botón)
 * — No usar: "Autentícate" (tecnicismo innecesario para ciudadanos)
 * Esta regla viene explícitamente del manual de ClaveÚnica:
 * evitar redundancia entre el texto introductorio y el label del botón. */
.login-card__instruction {
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  color: #4A4A4A;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}
```

---

## 7. El botón ClaveÚnica (especificación oficial obligatoria)

> ⚠️ **Importante:** el botón ClaveÚnica tiene diseño **normado por el Estado**. No se puede cambiar su color, ícono, ni proporciones. Usar siempre los estilos oficiales de `wikiguias.digital.gob.cl/Manuales/BotónCU`.

### 7.1 Carga del CSS oficial

```html
<!-- Opción A: CDN oficial (recomendado para producción) -->
<!-- Consultar URL vigente en wikiguias.digital.gob.cl/Manuales/BotónCU -->

<!-- Opción B: Copiar los estilos oficiales en tu propio CSS (ver sección 7.2) -->
```

### 7.2 CSS oficial del botón (v2.0, fuente: Gobierno Digital)

```css
/* ──────────────────────────────────────────────────────────────────────────
 * ESTILOS OFICIALES DEL BOTÓN CLAVEUNICA v2.0
 * Fuente: wikiguias.digital.gob.cl/Manuales/BotónCU
 * NO MODIFICAR colores, tamaños base ni estructura del ícono.
 * ────────────────────────────────────────────────────────────────────────── */

/* Base del botón */
.btn-cu {
  display: flex;
  justify-content: center;
  font-family: "Roboto", sans-serif;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  user-select: none;
  border-radius: 0;
  border: 0;
}

.btn-cu:hover {
  text-decoration: none;
}

/* Ícono ClaveÚnica (isotipo blanco sobre fondo azul) */
.btn-cu .cl-claveunica {
  text-indent: -9999px;
  background: url('https://wikiguias.digital.gob.cl/cu-blanco.svg') no-repeat center;
  /* IMPORTANTE: en producción, descargar el SVG oficial y servirlo desde
   * tu propio dominio. No depender del dominio externo para el ícono. */
}

/* Color estándar — AZUL CLAVEUNICA: #0F69C4
 * Este azul es DIFERENTE al azul primario de ChileAtiende (#006FB3).
 * Son dos sistemas distintos: uno es el color de ChileAtiende,
 * el otro es la marca registrada de ClaveÚnica. NO UNIFICARLOS. */
.btn-cu.btn-color-estandar {
  background-color: #0F69C4;
  color: #FFFFFF;
}

.btn-cu.btn-color-estandar:hover {
  background-color: #0B4E91;
  color: #FFFFFF;
}

.btn-cu.btn-color-estandar:active {
  background-color: #07305A;
  color: #FFFFFF;
}

/* Estado de foco: outline amarillo-naranja para máxima visibilidad
 * Este color de foco es parte de la especificación oficial y cumple WCAG 2.1 AA */
.btn-cu.btn-color-estandar:focus {
  background-color: #0B4E91;
  color: #FFFFFF;
  outline: 4px solid #FFBE5C;
  outline-offset: 0;
}

/* Tamaño M (estándar para uso en tarjeta de login)
 * min-height: 48px cumple el mínimo táctil recomendado por WCAG (44px) */
.btn-cu.btn-m {
  width: fit-content;
  min-height: 48px;
  padding: 8px 14px;
  font-size: 16px;
  line-height: 2rem;
}

.btn-cu.btn-m .cl-claveunica {
  width: 24px;
  height: 24px;
  background-size: 24px 24px;
  margin: auto 4px auto 0;
}

/* Variante: ancho completo (usar en móvil o en tarjeta de login centrada)
 * Hace que el botón ocupe todo el ancho del contenedor hasta 550px */
.btn-cu.btn-fw {
  max-width: 550px;
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Variantes de borde redondeado
 * Para la tarjeta de login, usar rounded-middle (coherente con border-radius: 4px
 * del sistema ChileAtiende) */
.btn-cu.rounded-none   { border-radius: 0; }
.btn-cu.rounded-middle { border-radius: 4px; }
.btn-cu.rounded-full   { border-radius: 99px; }

/* Modo alto contraste (activar con clase btn-color-highContrast)
 * Se activa automáticamente si implementas el toggle de contraste del header */
.btn-cu.btn-color-highContrast {
  background-color: #625AF6;
  color: #FFFFFF;
}

.btn-cu.btn-color-highContrast:hover   { background-color: #4943B6; color: #FFFFFF; }
.btn-cu.btn-color-highContrast:active  { background-color: #2D2971; color: #FFFFFF; }
.btn-cu.btn-color-highContrast:focus {
  background-color: #4943B6;
  color: #FFFFFF;
  outline: 4px solid rgba(216, 215, 250, 1);
  outline-offset: 0;
}
```

### 7.3 HTML del botón (copiar exactamente)

```html
<!-- Botón de login para tarjeta centrada: ancho completo + esquinas medias -->
<!-- aria-label es OBLIGATORIO para lectores de pantalla -->
<a class="btn-cu btn-m btn-color-estandar btn-fw rounded-middle"
   href="{{ URL_OAUTH_CLAVEUNICA }}"
   aria-label="Iniciar sesión con ClaveÚnica">
  <span class="cl-claveunica" aria-hidden="true"></span>
  <span class="texto" aria-hidden="true">Iniciar sesión</span>
</a>
```

> **Reglas de redacción del botón (normativa oficial):**
> - ✅ Usar `"Iniciar sesión"` cuando ClaveÚnica es el **único** método de autenticación del sitio (caso del MVP de Aduanas)
> - ✅ Usar `"ClaveÚnica"` cuando hay otros métodos de login y este es uno más
> - ❌ No escribir `"Ingresa con tu ClaveÚnica"` (redundante con el texto instructivo)
> - ❌ No escribir `"Clave Única"` con espacio — es una marca registrada: siempre `ClaveÚnica`
> - ❌ No usar el botón para enlazar a otro tipo de autenticación

### 7.4 Contenedor del botón dentro de la tarjeta

```css
/* Wrapper del botón dentro de la tarjeta
 * Centra el botón y le da espacio suficiente para destacar como único CTA */
.login-card__cta {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
```

---

## 8. Link de ayuda / fallback

```css
/* Link secundario: "¿No tienes ClaveÚnica? Solicítala aquí"
 * Va DEBAJO del botón, en tamaño pequeño para no competir con el CTA.
 * Es un requisito de inclusión: algunos usuarios (adultos mayores,
 * personas sin registro previo) no tienen ClaveÚnica activa todavía. */
.login-card__help-link {
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
  color: #006FB3;    /* --color-primary del sistema ChileAtiende */
  text-align: center;
  text-decoration: none;
}

.login-card__help-link:hover {
  text-decoration: underline;
}

/* Texto normal que acompaña al link (ej: "¿No tienes ClaveÚnica?") */
.login-card__help-text {
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
  color: #8A8A8A;
  text-align: center;
  margin: 0;
}
```

---

## 9. Pie de la tarjeta (información de seguridad)

```css
/* Aviso de seguridad debajo de la tarjeta
 * La pantalla oficial de ClaveÚnica muestra "Servicio de autenticación
 * ClaveÚnica® · Gobierno de Chile". Incluir algo equivalente refuerza
 * la confianza: el usuario sabe que no está en un sitio de phishing. */
.login-page__security-note {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.login-page__security-note img {
  height: 32px;
  width: auto;
  opacity: 0.7;
}

.login-page__security-note p {
  font-family: 'Roboto', sans-serif;
  font-size: 0.75rem;
  color: #8A8A8A;
  margin: 0;
}
```

---

## 10. HTML completo de la tarjeta (estructura de referencia)

```html
<!-- Página de login — sin header ni footer (ver chileatiende-style-guide.md) -->
<main class="login-page">

  <div class="login-card" role="main">

    <!-- 1. Identidad del servicio -->
    <div class="login-card__service-identity">
      <img
        class="login-card__service-logo"
        src="/assets/logo-aduanas.svg"
        alt="Servicio Nacional de Aduanas"
      >
      <h1 class="login-card__service-name">
        Declaración de Importación
      </h1>
      <p class="login-card__service-description">
        Servicio Nacional de Aduanas · Gobierno de Chile
      </p>
    </div>

    <!-- 2. Separador -->
    <hr class="login-card__divider" aria-hidden="true">

    <!-- 3. Instrucción + botón -->
    <div class="login-card__cta">
      <p class="login-card__instruction">
        Para continuar, inicia sesión con tu ClaveÚnica
      </p>

      <!-- Botón oficial ClaveÚnica — NO MODIFICAR clases ni estructura -->
      <a class="btn-cu btn-m btn-color-estandar btn-fw rounded-middle"
         href="{{ URL_OAUTH_CLAVEUNICA }}"
         aria-label="Iniciar sesión con ClaveÚnica">
        <span class="cl-claveunica" aria-hidden="true"></span>
        <span class="texto" aria-hidden="true">Iniciar sesión</span>
      </a>

      <!-- Link de ayuda -->
      <p class="login-card__help-text">
        ¿No tienes ClaveÚnica?
        <a class="login-card__help-link"
           href="https://claveunica.gob.cl/"
           target="_blank"
           rel="noopener noreferrer">
          Solicítala aquí
        </a>
      </p>
    </div>

  </div><!-- /login-card -->

  <!-- Pie de seguridad -->
  <div class="login-page__security-note" aria-hidden="true">
    <img src="/assets/logo-gob.svg" alt="Gobierno de Chile">
    <p>Servicio de autenticación ClaveÚnica® · Gobierno de Chile</p>
  </div>

</main>
```

---

## 11. Estados del flujo de autenticación

### 11.1 Estado: cargando (redirect a ClaveÚnica)

```css
/* Pantalla de transición mientras redirige a accounts.claveunica.gob.cl
 * Mostrar un spinner sobre la tarjeta para que el usuario sepa que algo
 * está pasando y no haga clic dos veces en el botón. */
.login-card--loading {
  pointer-events: none;
  opacity: 0.7;
}

.login-card__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #A8B7C7;
  border-top-color: #006FB3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Respetar preferencia del usuario: sin animaciones */
@media (prefers-reduced-motion: reduce) {
  .login-card__spinner {
    animation: none;
    border-top-color: #006FB3;
  }
}
```

### 11.2 Estado: error de autenticación (callback fallido)

```css
/* Si ClaveÚnica rechaza o el callback falla, mostrar un mensaje de error
 * dentro de la tarjeta usando el componente .alert--error del sistema.
 * Ver chileatiende-style-guide.md sección 9 para estilos de alertas. */

/* Ejemplo de uso dentro de la tarjeta: */
/*
  <div class="alert alert--error" role="alert">
    No fue posible autenticar tu sesión. Por favor intenta nuevamente
    o comunícate con el call center 101.
  </div>
*/
```

### 11.3 Estado: sesión ya iniciada (usuario autenticado)

```css
/* Si el usuario ya tiene sesión activa, mostrar un mensaje de confirmación
 * en lugar de la tarjeta completa. Esto evita confusión al navegar hacia atrás. */
.login-card__already-authenticated {
  text-align: center;
  padding: 1rem 0;
}

.login-card__already-authenticated p {
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  color: #4A4A4A;
  margin-bottom: 1rem;
}
```

---

## 12. Tokens y colores específicos de este componente

| Token | Valor | Uso |
|---|---|---|
| Fondo de página | `#EEEEEE` | `--color-neutral` del sistema |
| Fondo tarjeta | `#FFFFFF` | `--color-white` del sistema |
| Borde tarjeta | `#A8B7C7` | `--color-accent` del sistema |
| Azul ChileAtiende | `#006FB3` | Links secundarios, help-link |
| **Azul ClaveÚnica** | **`#0F69C4`** | **Exclusivo del botón ClaveÚnica** |
| Azul CU hover | `#0B4E91` | Estado hover del botón oficial |
| Azul CU active | `#07305A` | Estado pressed del botón oficial |
| Foco CU | `#FFBE5C` | Outline de foco del botón oficial |
| Texto título | `#111111` | `--color-black` del sistema |
| Texto descripción | `#4A4A4A` | `--color-gray-dark` del sistema |
| Texto secundario | `#8A8A8A` | `--color-gray-mid` del sistema |

> **Nota sobre los dos azules:** el sistema tiene `#006FB3` (ChileAtiende) y `#0F69C4` (ClaveÚnica). Conviven en la misma pantalla y eso es correcto. Son marcas distintas con identidades distintas. No intentar unificarlos.

---

## 13. Lista de verificación para la tarjeta de login

- [ ] La página usa `#EEEEEE` como fondo (no blanco, no gris oscuro)
- [ ] La tarjeta tiene `max-width: 480px` y está centrada
- [ ] El nombre del servicio que solicita autenticación está visible
- [ ] El texto instructivo **no** repite el texto del botón ("Iniciar sesión" / "ClaveÚnica")
- [ ] El botón usa las clases oficiales: `btn-cu btn-m btn-color-estandar`
- [ ] El botón tiene `aria-label="Iniciar sesión con ClaveÚnica"`
- [ ] El ícono `.cl-claveunica` tiene `aria-hidden="true"`
- [ ] El texto `.texto` del botón tiene `aria-hidden="true"`
- [ ] El link "¿No tienes ClaveÚnica?" apunta a `https://claveunica.gob.cl/`
- [ ] El logo `gob.cl` o institucional es visible debajo de la tarjeta
- [ ] El estado de carga desactiva el botón para evitar doble clic
- [ ] Los errores del callback se muestran con `.alert--error` dentro de la tarjeta
- [ ] La pantalla es completamente navegable con teclado

---

## 14. Referencias

| Recurso | URL |
|---|---|
| Manual botón ClaveÚnica (oficial) | https://wikiguias.digital.gob.cl/Manuales/BotónCU |
| Portal ClaveÚnica | https://claveunica.gob.cl |
| Pantalla login ClaveÚnica (referencia visual) | https://accounts.claveunica.gob.cl/accounts/login/ |
| Guía de estilos ChileAtiende (base) | `chileatiende-style-guide.md` |