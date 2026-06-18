# Guía de Estilos – Identidad Visual ChileAtiende
**Para proyectos del Estado chileno · Referencia para MVP de Aduanas**

---

> **Propósito de este documento**
> Este archivo define las reglas de estilo necesarias para que el MVP de Aduanas sea visualmente coherente con ChileAtiende (`chileatiende.gob.cl`). La coherencia visual tiene dos objetivos concretos:
> 1. **Reconocimiento institucional**: el ciudadano identifica el sitio como parte del ecosistema del Estado chileno.
> 2. **Transferencia de navegación**: alguien que ya usó ChileAtiende sabrá instintivamente cómo moverse por el MVP.
>
> Las reglas aquí descritas se basan en:
> - Observación directa de `chileatiende.gob.cl` y `chileatiende.gob.cl/fichas/143529-cupon-de-gas-licuado`
> - El **Framework Kit Gobierno** (`framework.digital.gob.cl`), que es el design system oficial del Estado chileno basado en Bootstrap 4
> - El Manual de Comunicación Visual Gobierno de Chile 2024

---

## 1. Fundamento: el Framework Kit Gobierno

ChileAtiende **no usa CSS casero**: implementa el **Framework Kit Gobierno**, la librería oficial de componentes del Estado de Chile. Este framework extiende Bootstrap 4 con la paleta, tipografía e identidad visual del Gobierno.

**Regla de oro:** antes de escribir CSS custom para cualquier componente, verifica si ya existe en el Framework Kit Gobierno.

```html
<!-- CDN oficial del Framework Kit Gobierno -->
<link rel="stylesheet" href="https://cdn.digital.gob.cl/lib/gob-mobile/1.1.1/css/gob-mobile.min.css">

<!-- Tipografías requeridas (Google Fonts) -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Slab:wght@700&display=swap" rel="stylesheet">
```

> **Por qué importa para el MVP:** importar este framework antes que cualquier CSS propio garantiza que los componentes base (botones, formularios, alertas, navegación) ya tengan la apariencia estatal correcta. Solo se necesita CSS custom para componentes específicos de aduanas que no existan en el kit.

---

## 2. Paleta de Colores

La paleta viene del sistema de marca del Gobierno de Chile adaptado al plano digital. Usar estos valores exactos es lo que hace que el sitio "se vea del Estado".

### 2.1 Colores principales

```css
:root {
  /* AZUL PRIMARIO
   * El color más importante del sistema. Se usa en:
   * - Encabezados de navegación (header)
   * - Botones de acción principal (CTA)
   * - Enlaces y elementos interactivos
   * - Íconos de énfasis
   * En ChileAtiende lo verás en el header azul, los botones "Realizar trámite"
   * y los links de texto activos. */
  --color-primary: #006FB3;

  /* ROJO SECUNDARIO
   * Color de acento para llamadas a la atención. Se usa en:
   * - Badges y etiquetas de estado (ej: "Nuevo", "Urgente")
   * - Highlights sobre cards destacadas
   * - Indicadores de error leve o advertencia visual (no errores de formulario)
   * En ChileAtiende aparece en etiquetas de categorías y el separador del logo. */
  --color-secondary: #FE6565;

  /* AZUL OSCURO / TERCIARIO
   * Para fondos de secciones de alto contraste y headers de nivel 2.
   * Da la sensación de "formalidad gubernamental" sin ser negro puro. */
  --color-tertiary: #0A132D;

  /* GRIS ACCENT
   * Usado para bordes de tarjetas, separadores y elementos decorativos.
   * No debe usarse para texto: está debajo del umbral WCAG AA. */
  --color-accent: #A8B7C7;

  /* GRIS NEUTRAL
   * Fondo alternativo de secciones. En ChileAtiende separa visualmente
   * bloques de contenido (ej: "Lo más buscado" sobre fondo #EEEEEE). */
  --color-neutral: #EEEEEE;

  /* GRISES DE TEXTO */
  --color-gray-dark: #4A4A4A;  /* Párrafos y texto secundario */
  --color-gray-mid: #8A8A8A;   /* Texto de apoyo, placeholders, meta-info */
  --color-black: #111111;      /* Títulos y texto de máximo contraste */

  /* BLANCO
   * Fondo principal de todas las páginas y tarjetas. */
  --color-white: #FFFFFF;
}
```

### 2.2 Colores funcionales adicionales

```css
:root {
  /* Usados con moderación para estados específicos del sistema */
  --color-purple: #6633CC;      /* Accesibilidad o categorías especiales */
  --color-orange: #E0701E;      /* Advertencias funcionales */
  --color-orange-light: #FFA11B;/* Íconos de alerta o destacado */
  --color-green: #2D717C;       /* Estados de éxito o confirmación */
}
```

### 2.3 Regla de uso de color

| Elemento | Color a usar | Variable |
|---|---|---|
| Títulos (h1–h3) | Negro | `--color-black` |
| Párrafos y texto general | Gris oscuro | `--color-gray-dark` |
| Íconos decorativos | Gris medio | `--color-gray-mid` |
| Fondo general de página | Blanco | `--color-white` |
| Bordes de cards | Gris accent | `--color-accent` |
| Botones primarios | Azul primario | `--color-primary` |
| Alertas de éxito | Verde | `--color-green` |
| Alertas de error | Rojo secundario | `--color-secondary` |

> **Regla de accesibilidad:** el sistema ChileAtiende cumple WCAG 2.1 AA. Nunca usar texto gris sobre fondo blanco en tamaño menor a 16px si el color es más claro que `#767676`. Para texto pequeño, usar siempre `--color-black` o `--color-gray-dark`.

---

## 3. Tipografía

ChileAtiende usa exactamente dos familias tipográficas, ambas de Google Fonts. Esta combinación es obligatoria en cualquier producto del ecosistema.

### 3.1 Familias

```css
/* ROBOTO SLAB (serif)
 * Solo para títulos de sección (h1, h2). Da el "peso visual institucional"
 * y diferencia visualmente los encabezados del contenido de página.
 * En ChileAtiende: "Encuentra beneficios y servicios del Estado" usa esta fuente.
 * NUNCA usar en párrafos, labels, ni elementos de navegación. */
--font-titles: 'Roboto Slab', serif;

/* ROBOTO (sans-serif)
 * Para TODO lo demás: párrafos, botones, links, formularios, navegación.
 * Es la fuente de trabajo del sistema. Su neutralidad garantiza legibilidad
 * en todos los contextos y dispositivos. */
--font-body: 'Roboto', sans-serif;
```

### 3.2 Escala tipográfica

```css
/* Tamaños definidos en rem para respetar las preferencias de accesibilidad
 * del navegador. Nunca usar px para tamaños de fuente. */

/* H1 - Título principal de página
 * En fichas como "Cupón de Gas Licuado", el h1 define de qué trata el trámite.
 * Debe ser el único h1 por página. */
h1 {
  font-family: 'Roboto Slab', serif;
  font-size: 2rem;       /* ~32px */
  font-weight: 700;
  line-height: 1.2;
  color: #111111;
}

/* H2 - Subtítulos de sección
 * Ej: "Descripción", "Requisitos", "¿Cómo realizarlo?" en una ficha de trámite */
h2 {
  font-family: 'Roboto Slab', serif;
  font-size: 1.5rem;     /* ~24px */
  font-weight: 700;
  line-height: 1.3;
  color: #111111;
}

/* H3 - Encabezados de sub-sección
 * Ej: "Atención presencial" dentro del menú "Red de atención"
 * Aquí se puede usar Roboto normal (no Slab) para menor jerarquía visual */
h3 {
  font-family: 'Roboto', sans-serif;
  font-size: 1.25rem;    /* ~20px */
  font-weight: 700;
  line-height: 1.4;
  color: #111111;
}

/* Párrafo / Body default
 * Todo el texto de contenido: descripciones de trámites, instrucciones, etc. */
p, body {
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;       /* 16px */
  font-weight: 400;
  line-height: 1.6;
  color: #4A4A4A;
}

/* Texto pequeño / meta-información
 * Ej: "Última actualización:", código de trámite, etiquetas de institución */
small, .text-meta {
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;   /* 14px */
  font-weight: 400;
  color: #8A8A8A;
}

/* Texto de cita o aclaración
 * Ej: bloques "Importante:" dentro de la descripción de un beneficio */
blockquote, .text-cite {
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  font-style: italic;
  font-weight: 400;
  color: #4A4A4A;
  border-left: 4px solid #006FB3;
  padding-left: 1rem;
}
```

---

## 4. Layout y Espaciado

### 4.1 Contenedor principal

```css
/* ChileAtiende usa un contenedor centrado con ancho máximo.
 * Esto da la sensación de "página oficial" con aire a los costados
 * en pantallas grandes, sin perder densidad de información útil. */
.container-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* En pantallas medianas (tablet), el contenido se ajusta */
@media (max-width: 992px) {
  .container-main {
    padding: 0 1.5rem;
  }
}

/* En móvil, el padding lateral aumenta para dar espacio táctil */
@media (max-width: 576px) {
  .container-main {
    padding: 0 1rem;
  }
}
```

### 4.2 Grid de contenido

```css
/* ChileAtiende usa un layout de 2 columnas en fichas de trámite:
 * - Columna principal (~70%): contenido del trámite
 * - Columna lateral (~30%): información de contacto, código de trámite, ayuda
 * En móvil, ambas columnas se apilan verticalmente. */
.layout-ficha {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

@media (max-width: 768px) {
  .layout-ficha {
    grid-template-columns: 1fr;
  }
}
```

### 4.3 Escala de espaciado

```css
/* Basado en múltiplos de 8px, igual que el framework.
 * Usar estas variables en lugar de valores arbitrarios de margin/padding. */
:root {
  --space-xs:  0.5rem;   /*  8px - separación mínima entre elementos inline */
  --space-sm:  1rem;     /* 16px - padding interno de tarjetas y botones */
  --space-md:  1.5rem;   /* 24px - separación entre componentes */
  --space-lg:  2rem;     /* 32px - separación entre secciones de página */
  --space-xl:  3rem;     /* 48px - separación entre bloques mayores */
  --space-xxl: 4rem;     /* 64px - solo para separar el header del contenido */
}
```

---

## 5. Componentes de Navegación

### 5.1 Header / Barra superior

```css
/* El header de ChileAtiende tiene:
 * - Fondo blanco con borde inferior sutil
 * - Logo a la izquierda
 * - Links de accesibilidad (aumentar/disminuir texto, contraste alto)
 * - Link a "Mi ChileAtiende" (área privada con ClaveÚnica) a la derecha
 *
 * Para el MVP de Aduanas: mantener la misma estructura de header blanco
 * con logo oficial GOB.CL visible. El usuario reconocerá el patrón. */
.site-header {
  background-color: #FFFFFF;
  border-bottom: 1px solid #A8B7C7;
  padding: var(--space-sm) 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.site-header__logo img {
  height: 48px;
  width: auto;
}

/* Barra de accesibilidad (controles de tamaño de texto y contraste)
 * ChileAtiende la muestra encima del header principal.
 * Para el MVP, incluirla aunque sea en forma simplificada:
 * refuerza la percepción de sitio gubernamental accesible. */
.accessibility-bar {
  background-color: #EEEEEE;
  padding: 4px var(--space-sm);
  font-size: 0.75rem;
  display: flex;
  justify-content: flex-end;
  gap: var(--space-xs);
}
```

### 5.2 Navegación principal

```css
/* La nav de ChileAtiende en desktop es horizontal con dropdown.
 * En el MVP puede ser más simple (sidebar o tabs según el flujo aduanero),
 * pero los colores y tipografía deben mantenerse. */
.site-nav {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.site-nav__link {
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: #111111;
  text-decoration: none;
  padding: var(--space-xs) 0;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s, color 0.2s;
}

/* Estado activo / página actual */
.site-nav__link--active,
.site-nav__link:hover {
  color: #006FB3;
  border-bottom-color: #006FB3;
}

/* Menú móvil: overlay completo con fondo blanco */
@media (max-width: 768px) {
  .site-nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #FFFFFF;
    flex-direction: column;
    justify-content: flex-start;
    padding: var(--space-xl) var(--space-md);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 999;
  }
  .site-nav--open {
    transform: translateX(0);
  }
}
```

### 5.3 Breadcrumb (migas de pan)

```css
/* En ChileAtiende, todas las fichas de trámite muestran breadcrumb.
 * Ej: Inicio > Subsecretaría del Interior > Cupón de Gas Licuado
 * Para el MVP: Inicio > Declaraciones > [Nombre del trámite]
 * El breadcrumb es FUNDAMENTAL para orientar al usuario en flujos complejos
 * como los de aduana (donde hay múltiples pasos y sub-formularios). */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
  color: #8A8A8A;
  margin-bottom: var(--space-md);
  list-style: none;
  padding: 0;
}

.breadcrumb__item a {
  color: #006FB3;
  text-decoration: none;
}

.breadcrumb__item a:hover {
  text-decoration: underline;
}

/* Separador entre niveles del breadcrumb */
.breadcrumb__item + .breadcrumb__item::before {
  content: "›";
  color: #8A8A8A;
  margin-right: var(--space-xs);
}

/* Último nivel: no es enlace, es el nombre de la página actual */
.breadcrumb__item--current {
  color: #4A4A4A;
  font-weight: 500;
}
```

---

## 6. Tarjetas (Cards)

```css
/* Las tarjetas son el componente más frecuente en ChileAtiende.
 * Se usan para: trámites destacados, momentos de vida, servicios por tema.
 * El patrón visual es siempre el mismo: fondo blanco, borde sutil, sombra mínima.
 * NO usar sombras gruesas ni gradientes: rompen la apariencia institucional. */
.card {
  background-color: #FFFFFF;
  border: 1px solid #A8B7C7;
  border-radius: 4px;
  padding: var(--space-md);
  transition: box-shadow 0.2s, transform 0.2s;
}

/* Al hacer hover, la tarjeta "levanta" sutilmente.
 * Este micro-feedback es el mismo que usa ChileAtiende para indicar
 * que el elemento es clicable. */
.card:hover {
  box-shadow: 0 4px 12px rgba(0, 111, 179, 0.15);
  transform: translateY(-2px);
}

.card__title {
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #006FB3;
  margin-bottom: var(--space-xs);
}

.card__description {
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
  color: #4A4A4A;
  line-height: 1.5;
}

/* Card destacada (como las de "Destacamos" en ChileAtiende)
 * Tiene borde azul en el lado izquierdo para distinguirse */
.card--featured {
  border-left: 4px solid #006FB3;
}
```

---

## 7. Botones

```css
/* ChileAtiende tiene 2 tipos principales de botón:
 * 1. Primario (azul): acción principal del flujo ("Realizar trámite", "Activar")
 * 2. Secundario (borde azul): acción alternativa ("Conocer más", "Cancelar")
 * Para el MVP de Aduanas: aplicar el mismo patrón.
 * Ej: "Enviar declaración" → primario. "Guardar borrador" → secundario. */

/* Botón primario */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background-color: #006FB3;
  color: #FFFFFF;
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border: 2px solid #006FB3;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s, border-color 0.2s;
}

.btn-primary:hover,
.btn-primary:focus {
  background-color: #005a91;  /* Azul más oscuro al hacer hover */
  border-color: #005a91;
  outline: none;
}

/* Estado de foco para teclado (accesibilidad WCAG 2.1 AA) */
.btn-primary:focus-visible {
  outline: 3px solid #FFA11B;
  outline-offset: 2px;
}

/* Botón secundario */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background-color: transparent;
  color: #006FB3;
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border: 2px solid #006FB3;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.btn-secondary:hover,
.btn-secondary:focus {
  background-color: #006FB3;
  color: #FFFFFF;
}

/* Botón deshabilitado
 * Para pasos de flujo que aún no están disponibles (ej: formulario incompleto) */
.btn-primary:disabled,
.btn-secondary:disabled {
  background-color: #EEEEEE;
  color: #8A8A8A;
  border-color: #A8B7C7;
  cursor: not-allowed;
  transform: none;
}
```

---

## 8. Formularios

```css
/* Los formularios son el core del MVP de Aduanas.
 * ChileAtiende usa un patrón muy claro: label encima del campo,
 * campo con borde visible, mensaje de error en rojo bajo el campo.
 * Esto cumple WCAG y reduce errores de usuario en trámites complejos. */

/* Grupo de campo: label + input + mensaje */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: var(--space-md);
}

/* Label del campo
 * Siempre visible (NO usar placeholder como único label: rompe accesibilidad) */
.form-label {
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111111;
}

/* Indicador de campo obligatorio */
.form-label--required::after {
  content: " *";
  color: #FE6565;
}

/* Input y select */
.form-input,
.form-select {
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  color: #111111;
  background-color: #FFFFFF;
  border: 1px solid #A8B7C7;
  border-radius: 4px;
  padding: 0.625rem 0.75rem;
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-select:focus {
  border-color: #006FB3;
  box-shadow: 0 0 0 3px rgba(0, 111, 179, 0.15);
  outline: none;
}

/* Estado de error en campo */
.form-input--error {
  border-color: #FE6565;
}

/* Mensaje de error bajo el campo */
.form-error-message {
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
  color: #FE6565;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Texto de ayuda bajo el campo (hint text)
 * Ej: "Ingresa el RUT sin puntos y con guión" */
.form-hint {
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
  color: #8A8A8A;
}
```

---

## 9. Alertas e Información Destacada

```css
/* ChileAtiende usa bloques de alerta para información crítica.
 * En las fichas de trámite, el bloque "Importante:" es recurrente.
 * Para el MVP de Aduanas: usar para advertencias de plazo, documentos
 * faltantes, o requisitos especiales de la declaración. */

/* Alerta genérica */
.alert {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: 4px;
  border-left: 4px solid;
  margin-bottom: var(--space-md);
  font-family: 'Roboto', sans-serif;
  font-size: 0.9375rem;
  line-height: 1.5;
}

/* Alerta de información (azul) */
.alert--info {
  background-color: rgba(0, 111, 179, 0.08);
  border-left-color: #006FB3;
  color: #0A132D;
}

/* Alerta de éxito (verde)
 * Ej: "Tu declaración fue enviada correctamente" */
.alert--success {
  background-color: rgba(45, 113, 124, 0.08);
  border-left-color: #2D717C;
  color: #1a4a52;
}

/* Alerta de advertencia (naranja)
 * Ej: "Tienes 3 días para completar este formulario" */
.alert--warning {
  background-color: rgba(255, 161, 27, 0.12);
  border-left-color: #FFA11B;
  color: #5c3a00;
}

/* Alerta de error (rojo)
 * Ej: "Faltan documentos obligatorios" */
.alert--error {
  background-color: rgba(254, 101, 101, 0.1);
  border-left-color: #FE6565;
  color: #7a1c1c;
}
```

---

## 10. Secciones de Página

```css
/* ChileAtiende alterna secciones blancas y grises para separar
 * visualmente bloques de contenido sin usar líneas ni bordes gruesos.
 * Este patrón es muy característico: el usuario lo percibe como
 * "cambio de tema" dentro de la misma página. */

/* Sección sobre fondo blanco (default) */
.page-section {
  padding: var(--space-xl) 0;
  background-color: #FFFFFF;
}

/* Sección sobre fondo gris neutro
 * Usar para: resúmenes, bloques de "Lo más buscado", información secundaria */
.page-section--gray {
  padding: var(--space-xl) 0;
  background-color: #EEEEEE;
}

/* Sección destacada con fondo azul oscuro
 * Solo para bloques muy importantes (ej: banner de reforma o urgencia).
 * En el MVP de Aduanas podría usarse para el banner de "Declaración obligatoria" */
.page-section--dark {
  padding: var(--space-xl) 0;
  background-color: #0A132D;
  color: #FFFFFF;
}

.page-section--dark h2,
.page-section--dark p {
  color: #FFFFFF;
}

/* Título de sección
 * Patrón de ChileAtiende: h2 centrado en secciones de la home,
 * alineado a la izquierda en fichas de trámite */
.section-title {
  font-family: 'Roboto Slab', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111111;
  margin-bottom: var(--space-lg);
}

.section-title--centered {
  text-align: center;
}
```

---

## 11. Footer

```css
/* El footer de ChileAtiende tiene estructura de 4-5 columnas en desktop
 * con links institucionales. En el MVP de Aduanas debe mantenerse el
 * patrón: footer oscuro con links blancos y logo gob.cl al pie.
 * Esto refuerza la legitimidad del sitio como producto del Estado. */
.site-footer {
  background-color: #0A132D;
  color: #FFFFFF;
  padding: var(--space-xl) 0 var(--space-lg);
}

.site-footer__title {
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-sm);
}

.site-footer__link {
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
  color: #A8B7C7;
  text-decoration: none;
  display: block;
  margin-bottom: 0.5rem;
  transition: color 0.2s;
}

.site-footer__link:hover {
  color: #FFFFFF;
}

/* Barra inferior del footer con copyright y logo gob.cl */
.site-footer__bottom {
  border-top: 1px solid rgba(168, 183, 199, 0.3);
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #8A8A8A;
}
```

---

## 12. Elementos Específicos de Estado

```css
/* Badge / etiqueta de estado del trámite
 * En el MVP de Aduanas: "En revisión", "Aprobado", "Rechazado", "Pendiente"
 * Estos estados son críticos para el usuario en flujos de aduana. */
.badge {
  display: inline-block;
  font-family: 'Roboto', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badge--pending {
  background-color: rgba(255, 161, 27, 0.15);
  color: #7a4d00;
}

.badge--success {
  background-color: rgba(45, 113, 124, 0.15);
  color: #1a4a52;
}

.badge--error {
  background-color: rgba(254, 101, 101, 0.15);
  color: #7a1c1c;
}

.badge--info {
  background-color: rgba(0, 111, 179, 0.12);
  color: #003d6b;
}

/* Código de trámite
 * ChileAtiende muestra el código de trámite en un box destacado.
 * Para el MVP: número de declaración, folio, o código de seguimiento. */
.tramite-code {
  background-color: #EEEEEE;
  border: 1px solid #A8B7C7;
  border-radius: 4px;
  padding: var(--space-sm);
  text-align: center;
  font-family: 'Roboto', sans-serif;
}

.tramite-code__label {
  font-size: 0.75rem;
  color: #8A8A8A;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.tramite-code__number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #006FB3;
  letter-spacing: 0.1em;
}
```

---

## 13. Accesibilidad

```css
/* ChileAtiende cumple WCAG 2.1 AA. El MVP debe mantener este estándar
 * porque los sitios del Estado chileno están regulados por la
 * Ley 20.422 (Normas sobre Igualdad de Oportunidades e Inclusión Social
 * de Personas con Discapacidad). */

/* 1. Skip link: primer elemento del DOM, oculto visualmente pero accesible
 *    por teclado. Permite saltar al contenido principal directamente. */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: #006FB3;
  color: #FFFFFF;
  padding: 0.5rem 1rem;
  z-index: 9999;
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
}

.skip-link:focus {
  top: 0;
}

/* 2. Foco visible: nunca usar outline: none sin reemplazarlo */
*:focus-visible {
  outline: 3px solid #FFA11B;
  outline-offset: 2px;
}

/* 3. Modo de alto contraste (simula el comportamiento del botón de
 *    accesibilidad que ChileAtiende tiene en su header) */
@media (prefers-contrast: high) {
  :root {
    --color-primary: #004d80;
    --color-gray-dark: #000000;
    --color-gray-mid: #333333;
    --color-accent: #666666;
  }
}

/* 4. Respeto por preferencia de movimiento reducido
 *    Usuarios con epilepsia o vértigo activan esta opción en su OS */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 14. Responsive / Mobile First

```css
/* ChileAtiende es completamente responsive. El orden de breakpoints
 * sigue el mismo que Bootstrap 4 (base del framework kit). */

/* BREAKPOINTS
 * xs: < 576px   → Móvil (diseño base)
 * sm: ≥ 576px   → Móvil grande / phablet
 * md: ≥ 768px   → Tablet
 * lg: ≥ 992px   → Desktop
 * xl: ≥ 1200px  → Desktop grande */

/* Reglas generales de adaptación mobile */
@media (max-width: 576px) {
  /* En móvil, todos los botones ocupan el ancho completo */
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  /* Tarjetas en lista vertical en lugar de grid */
  .cards-grid {
    grid-template-columns: 1fr;
  }

  /* El h1 se reduce para no desbordar en pantallas pequeñas */
  h1 {
    font-size: 1.5rem;
  }

  h2 {
    font-size: 1.25rem;
  }
}
```

---

## 15. Lista de Verificación Final

Antes de hacer deploy del MVP, verificar que:

**Identidad visual**
- [ ] Se carga `Roboto` y `Roboto Slab` desde Google Fonts
- [ ] El azul principal usado es exactamente `#006FB3`
- [ ] El logo incluye referencia a `gob.cl` (obligatorio para sitios del Estado)
- [ ] El favicon usa el escudo del gobierno o el logo institucional

**Estructura de página**
- [ ] Existe un `<h1>` único por página
- [ ] El breadcrumb está presente en todas las páginas internas
- [ ] El footer incluye links a Política de Privacidad y Términos de Uso
- [ ] El header tiene la barra de accesibilidad (tamaño de texto / contraste)

**Accesibilidad**
- [ ] Existe un skip link al inicio del `<body>`
- [ ] Todos los `<img>` tienen atributo `alt`
- [ ] Todos los campos de formulario tienen `<label>` asociado (no solo placeholder)
- [ ] El contraste de texto sobre fondo supera 4.5:1 (herramienta: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/))
- [ ] El sitio es navegable completamente con teclado (Tab + Enter)

**Formularios**
- [ ] Los campos obligatorios están marcados con asterisco y leyenda explicativa
- [ ] Los mensajes de error son descriptivos (no solo "Error")
- [ ] El botón de envío está deshabilitado mientras el formulario tiene errores

---

## 16. Referencias

| Recurso | URL |
|---|---|
| ChileAtiende (home) | https://www.chileatiende.gob.cl |
| Ficha de trámite (ejemplo) | https://www.chileatiende.gob.cl/fichas/143529-cupon-de-gas-licuado |
| Framework Kit Gobierno | https://framework.digital.gob.cl |
| Colores del framework | https://framework.digital.gob.cl/colors.html |
| Tipografía del framework | https://framework.digital.gob.cl/typography.html |
| Kit Digital Gobierno | https://kitdigital.gob.cl |
| Roboto en Google Fonts | https://fonts.google.com/specimen/Roboto |
| Roboto Slab en Google Fonts | https://fonts.google.com/specimen/Roboto+Slab |
| WCAG 2.1 (accesibilidad) | https://www.w3.org/TR/WCAG21/ |
| WebAIM Contrast Checker | https://webaim.org/resources/contrastchecker/ |