# Puzz Theme

Tema Drupal moderno basado en Single-Directory Components (SDC) con sistema de compilación avanzado y carga automática de CSS/JS por componente.

## 📁 Estructura del Tema

```
puzz/
├── build/                    # Archivos compilados (generados automáticamente)
│   ├── css/
│   │   ├── base.css         # Estilos base (reset, tipografía, variables)
│   │   ├── layout.css       # Estilos de layout (container, grid)
│   │   └── theme.css        # Estilos específicos del tema
│   ├── js/
│   │   └── main.js          # JavaScript global
│   └── components/
│       └── cta/
│           ├── cta.css      # CSS del componente (solo se carga si se usa)
│           └── cta.js       # JS del componente (solo se carga si se usa)
│
├── components/               # Componentes SDC
│   └── cta/                  # Ejemplo: componente CTA
│       ├── cta.component.yml # Metadatos del componente (requerido)
│       ├── cta.twig          # Plantilla Twig (requerido)
│       ├── cta.scss          # Fuente SCSS (compila a build/components/cta/cta.css)
│       └── cta.js            # JavaScript (copia a build/components/cta/cta.js)
│
├── src/                      # Fuentes SCSS/JS globales
│   ├── scss/
│   │   ├── partials/         # Partials SCSS (archivos importados)
│   │   │   ├── variables.scss  # Variables SCSS
│   │   │   ├── mixins.scss     # Mixins SCSS
│   │   │   ├── reset.scss      # CSS Reset
│   │   │   ├── base.scss       # CSS Variables y estilos base
│   │   │   ├── typography.scss # Estilos de tipografía
│   │   │   ├── layout.scss     # Estilos de layout
│   │   │   └── theme.scss      # Estilos específicos del tema
│   │   └── main.scss        # → Compila a build/css/main.css (importa todos los partials)
│   └── js/
│       └── main.js          # → Copia a build/js/main.js
│
├── templates/                # Plantillas Twig globales
├── translations/            # Traducciones
├── config/                  # Configuración de Drupal
│
├── scripts/                 # Scripts de compilación
│   ├── build.js             # Script de compilación
│   └── dev-server.js        # Servidor de desarrollo con hot reload
│
├── package.json
├── puzz.info.yml
├── puzz.libraries.yml
└── puzz.theme
```

## 🚀 Instalación

```bash
cd drupal/web/themes/custom/puzz
npm install
npm run build:prod  # Producción
# o
npm run build:dev   # Desarrollo
npm run dev         # Servidor de desarrollo con hot reload
```

## 📝 Comandos Disponibles

- `npm run build` - Compila en modo producción (CSS minificado, sin source maps)
- `npm run build:dev` - Compila en modo desarrollo (CSS expandido, con source maps `.map`)
- `npm run build:prod` - Compila en modo producción (CSS minificado, sin source maps)
- `npm run dev` - Inicia servidor de desarrollo con hot reload (BrowserSync, usa modo dev automáticamente)
- `npm run clean` - Limpia el directorio `build/`

## 🔤 Sistema de Iconos (Tabler + Custom)

El tema usa una estrategia única, orientada a Drupal y sin dependencias runtime en producción:

- **Fuente base:** `@tabler/icons` (outline, libre y extensa)
- **Fuente custom:** `src/assets/icons/custom/*.svg`
- **Sprite preview (build):** `build/assets/icons/admin-preview-sprite.svg`
- **Sprite frontend (runtime):** `public://puzz.sprite.svg` (normalmente `sites/default/files/puzz.sprite.svg`)
- **Fallback frontend:** `build/assets/icons/sprite.svg`

### Arquitectura real (resumen)

1. El build de frontend genera sprites en `build/assets/icons/`.
2. El selector visual de iconos del theme settings usa `admin-preview-sprite.svg`.
3. Al guardar `/admin/appearance/settings/puzz`, Drupal:
   - guarda la selección,
   - exporta `public://puzz.icons.json`,
   - regenera automáticamente `public://puzz.sprite.svg` filtrando iconos seleccionados.
4. En render de página, el tema inyecta inline el sprite (sin request adicional).

Resultado: en producción no hace falta ejecutar `npm` cuando un editor cambia la selección de iconos.

### Convención de nombres (obligatoria)

- **Tabler:** `icon-{name}`
  - Ejemplos: `icon-search`, `icon-user-circle`, `icon-chevron-right`
- **Custom:** `icon-custom-{name}`
  - Ejemplos: `icon-custom-demo-puzz`, `icon-custom-drupal10-drop`, `icon-custom-puzz-mark`

Regla para custom:
- si el archivo empieza por `custom-`, se respeta;
- si no empieza por `custom-`, el build añade ese prefijo.

Ejemplo:
- archivo: `src/assets/icons/custom/custom-drupal10-drop.svg`
- símbolo final: `icon-custom-drupal10-drop`

### Flujo recomendado (end-to-end)

1. Añade/modifica SVG en `src/assets/icons/custom/`.
2. Ejecuta build de tema para refrescar `admin-preview-sprite.svg`.
3. Ve a `/admin/appearance/settings/puzz` -> **Styles** -> **Icons**.
4. Selecciona iconos y guarda.
5. Drupal regenera `public://puzz.sprite.svg`.
6. Limpia caché si estás validando cambios estructurales de twig (`drush cr`).

Comandos típicos:

```bash
# Local
npm --prefix drupal/web/themes/custom/puzz run build:dev
drush cr

# Docker (proyecto demo)
docker exec -i --user diglesia demo-www npm --prefix /opt/demo/drupal/web/themes/custom/puzz run build:dev
docker exec -i --user diglesia demo-www /opt/demo/drupal/vendor/bin/drush cr
```

### Selector visual en settings del tema

Ruta: `/admin/appearance/settings/puzz` -> **Styles** -> **Icons**

Funcionalidades:
- búsqueda en tiempo real;
- preview visual de iconos;
- paginación;
- toggle **Show selected**;
- lista de seleccionados arriba;
- opción **Include all Tabler icons**.

Comportamiento:
- Si activas **Include all Tabler icons**, todos los Tabler entran en sprite.
- Los custom solo se incluyen cuando están seleccionados.
- Al guardar, verás feedback de estado: `Icon sprite rebuilt automatically.`

### Archivos generados al guardar settings

- `public://puzz.icons.json` -> estado de selección (`include_all`, `selected`)
- `public://puzz.sprite.svg` -> sprite final usado por frontend

### Uso en Twig (recomendado)

Helper oficial: `templates/includes/icon.twig`

```twig
{# Decorativo #}
{% include '@puzz/includes/icon.twig' with {
  name: 'icon-search',
  class: 'icon--md'
} only %}

{# Accesible #}
{% include '@puzz/includes/icon.twig' with {
  name: 'icon-custom-drupal10-drop',
  class: 'icon--lg',
  label: 'Drupal icon'
} only %}
```

Pasando nombre “corto” desde componentes/plantillas:

```twig
{% include '@puzz/includes/icon.twig' with {
  name: 'search'
} only %}
```

### Uso directo sin helper

```twig
<svg class="icon icon--md" aria-hidden="true">
  <use href="#icon-custom-puzz-mark"></use>
</svg>
```

### Integración en menú (puzz_menu_icons)

El módulo `puzz_core/modules/puzz_menu_icons` permite:
- seleccionar icono por enlace de menú (`field_puzz_menu_icon`);
- seleccionar color de icono (`field_puzz_menu_icon_color`);
- renderizar iconos en menú principal, cuenta de usuario y overview de enlaces.

Buenas prácticas:
- mantener icono decorativo con `aria-hidden="true"` cuando el enlace ya tiene texto;
- usar `currentColor` para heredar color del enlace cuando aplique.

### Estilos base de icono

Definidos en `src/scss/partials/base/_icons.scss` (importado desde `main.scss`):
- `.icon`
- `.icon--xs`, `.icon--sm`, `.icon--md`, `.icon--lg`, `.icon--xl`

### Guía para crear SVG custom de calidad

Recomendaciones:
- usar `viewBox="0 0 24 24"`;
- dejar margen interno para evitar recortes visuales;
- evitar `width`/`height` fijos;
- preferir formas simples (se leen mejor a 16px);
- usar `currentColor` o paths sin estilos complejos;
- evitar filtros, masks avanzadas y estilos inline complejos.

El build optimiza con `svgo` y normaliza para sprite.

### Troubleshooting (iconos)

Si un icono no aparece en frontend:

1. Comprueba que existe en `src/assets/icons/custom/`.
2. Ejecuta build (`build:dev` o `build:prod`).
3. Guarda settings del tema para regenerar `public://puzz.sprite.svg`.
4. Limpia caché (`drush cr`).
5. Verifica que el nombre en Twig coincide exactamente.

Checks útiles:

```bash
rg "icon-custom-drupal10-drop" drupal/web/themes/custom/puzz/build/assets/icons/admin-preview-sprite.svg
rg "icon-custom-drupal10-drop" drupal/web/sites/default/files/puzz.sprite.svg
```

Si falla la regeneración al guardar:
- revisar permisos de `public://`;
- verificar que `admin-preview-sprite.svg` existe y es legible;
- revisar log de Drupal (`watchdog` / `Recent log messages`).

## 🧾 Sistema de Formularios (SDC)

El tema ya incluye una capa de componentes para formularios y mapeo automático desde plantillas `templates/form/*.twig`.

### Catálogo actual de componentes de formulario

- `puzz:input` (text, email, password, search, tel, url, number con `min/max/step`)
- `puzz:textarea`
- `puzz:select` (simple + multiple + optgroup)
- `puzz:checkbox`
- `puzz:checkbox-group`
- `puzz:radio-group`
- `puzz:file-input`
- `puzz:input-range`
- `puzz:input-color`
- `puzz:form-fieldset`
- `puzz:cta` (botones de acción / submit)

### Integración automática con Form API

Archivos clave:
- `includes/preprocess.input.inc`
- `includes/preprocess.select.inc`
- `includes/preprocess.textarea.inc`
- `includes/preprocess.checkboxes.inc`
- `includes/preprocess.radios.inc`
- `includes/preprocess.fieldset.inc`
- `includes/preprocess.form_element.inc`

Mapeo principal:
- `input[type=text|email|password|search|tel|url|number]` -> `puzz:input`
- `input[type=file]` -> `puzz:file-input`
- `input[type=checkbox]` -> `puzz:checkbox`
- `input[type=range]` -> `puzz:input-range`
- `input[type=color]` -> `puzz:input-color`
- `select` -> `puzz:select`
- `textarea` -> `puzz:textarea`
- `checkboxes` -> `puzz:checkbox-group`
- `radios` -> `puzz:radio-group`
- `fieldset` -> `puzz:form-fieldset`
- `input[type=submit]` -> `puzz:cta` (`button_type: submit`)

### Sobrescribir componente desde Form API

Puedes forzar componente o props en el elemento:

```php
$form['my_field']['#component'] = 'puzz:input';
$form['my_field']['#component_props'] = [
  'help' => 'Custom help text',
];
```

### Storybook (formularios)

Cada componente tiene historias en su carpeta:
- `components/input/*.stories.js`
- `components/textarea/*.stories.js`
- `components/select/*.stories.js`
- `components/checkbox/*.stories.js`
- `components/checkbox-group/*.stories.js`
- `components/radio-group/*.stories.js`
- `components/file-input/*.stories.js`
- `components/input-range/*.stories.js`
- `components/input-color/*.stories.js`
- `components/form-fieldset/*.stories.js`

Ejecuta:

```bash
npm run storybook
```

### Modos de Compilación

**Modo Desarrollo (`build:dev`):**
- CSS expandido (legible)
- Source maps generados (`.map` files) para debugging en DevTools
- Útil para desarrollo y debugging

**Modo Producción (`build:prod`):**
- CSS minificado (optimizado)
- Sin source maps
- Menor tamaño de archivo
- Útil para producción

## 🎨 Arquitectura CSS/JS

### Archivos Globales (siempre cargados)

Estos archivos se cargan en todas las páginas vía `puzz.libraries.yml`:

- **`build/css/main.css`**: Estilos principales que incluyen:
  - Variables SCSS y CSS (`:root`)
  - Mixins reutilizables
  - CSS Reset y normalización
  - Estilos base de elementos HTML
  - Tipografía (headings, párrafos, utilidades)
  - Layout (contenedores, sistemas de grid)
  - Estilos específicos del tema (header, footer, navegación)
- **`build/js/main.js`**: JavaScript global del tema

### Archivos de Componentes (carga bajo demanda)

Cada componente SDC carga **SOLO su CSS/JS cuando se renderiza**:

- **`build/components/{nombre}/{nombre}.css`**: Estilos del componente (solo se carga si se usa)
- **`build/components/{nombre}/{nombre}.js`**: JavaScript del componente (solo se carga si se usa)

### Convención de clases (BEM)

Los componentes usan **BEM** (Block, Element, Modifier) para nombrar clases CSS:

| Símbolo | Significado | Ejemplo |
|---------|-------------|---------|
| **Block** | El componente en sí | `cta` |
| **`__`** (doble guión bajo) | **Elemento**: parte del bloque | `cta__text` = el texto dentro del CTA |
| **`--`** (doble guión) | **Modificador**: variante del bloque o elemento | `cta--primary`, `cta--large` |

Así se evita que los estilos de un componente afecten a otros y las clases son fáciles de leer. Cada componente tiene su propio README en `components/{nombre}/README.md`.

## ⚡ Cómo Funciona la Carga Automática

### 1. Compilación

```bash
npm run build:dev   # Modo desarrollo (con source maps)
npm run build:prod  # Modo producción (minificado, sin source maps)
```

**Modo Desarrollo:**
- Compila `src/scss/main.scss` → `build/css/main.css` (expandido, legible)
- Genera `build/css/main.css.map` (source map para debugging)
- Compila componentes con source maps
- CSS expandido para fácil lectura

**Modo Producción:**
- Compila `src/scss/main.scss` → `build/css/main.css` (minificado, optimizado)
- Sin source maps
- CSS comprimido para menor tamaño
- Compila componentes minificados

**Ambos modos:**
- Copian `src/js/main.js` → `build/js/main.js`
- Compilan `components/{nombre}/{nombre}.scss` → `build/components/{nombre}/{nombre}.css`
- Copian `components/{nombre}/{nombre}.js` → `build/components/{nombre}/{nombre}.js`

### 2. Registro Automático de Librerías

`hook_library_info_alter()` en `puzz.theme` detecta componentes en `build/components/` y registra automáticamente una librería por cada uno:

- `puzz/cta` → incluye `build/components/cta/cta.css` y `cta.js`
- `puzz/header` → incluye `build/components/header/header.css` y `header.js`

### 3. Asociación Automática

Cada componente SDC tiene `libraryOverrides.dependencies` en su `.component.yml` que referencia su librería personalizada:

```yaml
libraryOverrides:
  dependencies:
    - puzz/cta  # Para componentes en components/cta/
```

### 4. Carga Bajo Demanda

Cuando renderizas un componente:

```twig
{# Componente CTA #}
{{ {
  '#type': 'component',
  '#component': 'puzz:cta',
  '#props': {
    'text': 'Click aquí',
    'url': '#',
    'variant': 'primary',
    'size': 'medium'
  }
} }}

{# Componente Header #}
{{ {
  '#type': 'component',
  '#component': 'puzz:header',
  '#props': {
    'caption': 'Welcome to Puzz',
    'link_url': '#',
    'link_title': 'Learn more'
  }
} }}
```

Drupal automáticamente:
1. Detecta que es un componente SDC
2. Busca su librería asociada (`puzz/cta` vía `libraryOverrides`)
3. Carga el CSS y JS del componente **solo en esa página**
4. Si no renderizas el componente, no se carga nada

## 🧩 Componentes SDC

### Índice rápido de componentes

- [CTA](components/cta/README.md)
- [Input](components/input/README.md)
- [Textarea](components/textarea/README.md)
- [Select](components/select/README.md)
- [Checkbox](components/checkbox/README.md)
- [Checkbox Group](components/checkbox-group/README.md)
- [Radio Group](components/radio-group/README.md)
- [File Input](components/file-input/README.md)
- [Input Range](components/input-range/README.md)
- [Input Color](components/input-color/README.md)
- [Form Fieldset](components/form-fieldset/README.md)
- [Header](components/header/README.md)
- [Section](components/section/README.md)

### Estructura de Componentes

Los componentes están organizados directamente en `components/`:
- Cada componente tiene su propio directorio
- Ejemplo: `components/cta/` → `puzz:cta`
- Ejemplo: `components/header/` → `puzz:header`

### Estructura de Archivos de Componente

Cada componente tiene esta estructura:

```
components/{nombre}/
├── {nombre}.component.yml  # Metadatos del componente (requerido)
├── {nombre}.twig          # Plantilla Twig (requerido)
├── {nombre}.scss          # Estilos fuente (se compila a CSS)
└── {nombre}.js            # JavaScript (opcional, se copia tal cual)
```

**Archivos compilados** (generados automáticamente en `build/components/{nombre}/`):
- `{nombre}.css` - CSS compilado desde SCSS
- `{nombre}.js` - JavaScript copiado

### Identificación de Componentes

Los componentes se referencian usando el nombre del directorio:
- `components/cta/` → ID del componente: `cta` → Referencia: `puzz:cta`
- `components/header/` → ID del componente: `header` → Referencia: `puzz:header`

### Ejemplo: Crear un Nuevo Componente

```bash
# 1. Crear estructura SDC completa
mkdir -p components/mi-componente
touch components/mi-componente/mi-componente.component.yml
touch components/mi-componente/mi-componente.twig
touch components/mi-componente/mi-componente.scss
touch components/mi-componente/mi-componente.js  # opcional

# 2. Editar card.component.yml
# Agregar libraryOverrides:
# libraryOverrides:
#   dependencies:
#     - puzz/card

# 3. Compilar
npm run build
```

Las librerías se registran automáticamente vía `hook_library_info_alter()` cuando existen archivos en `build/components/{nombre}/`.

### Template del Componente

```twig
{# components/cta/cta.twig #}
{% set classes = [
  'cta',
  'cta--' ~ variant|default('primary'),
  'cta--' ~ size|default('medium'),
] %}

<a href="{{ url }}" class="{{ classes|join(' ') }}">
  <span class="cta__text">{{ text }}</span>
</a>
```

### Metadata del Componente

```yaml
# components/cta/cta.component.yml
$schema: https://git.drupalcode.org/project/drupal/-/raw/HEAD/core/assets/schemas/v1/metadata.schema.json
name: CTA
description: A call-to-action button component.
group: Base

# Especificar librería personalizada para carga automática
libraryOverrides:
  dependencies:
    - puzz/cta

props:
  type: object
  properties:
    text:
      type: string
      title: Button text
    url:
      type: string
      title: Link URL
      format: uri
    variant:
      type: string
      title: Button variant
      enum: [primary, secondary, outline]
      default: primary
    size:
      type: string
      title: Button size
      enum: [small, medium, large]
      default: medium
```

## 📄 Párrafos en view mode "component"

Los tipos de párrafo del ecosistema **puzz_component** (por ejemplo `puzz_section`, `puzz_header`) se renderizan en el tema cuando usan el view mode **"component"**. El tema no altera el build en los módulos; toda la lógica de render está en el tema.

### Flujo

1. **Preprocess** (`includes/preprocess.paragraph.inc`): para cada párrafo en view mode `component`, según el bundle se rellenan `component` y `props`.
2. **Plantilla de párrafo**: `paragraph--{bundle}--component.html.twig` solo invoca el componente SDC con esas props (`#type` => `component`, `#component`, `#props`). Si no hay `component`/`props`, se hace fallback a `{{ content }}`.
3. **Componente SDC**: el componente del tema (p. ej. `puzz:section`, `puzz:header`) recibe las props y renderiza su estructura.

### Archivos implicados

| Rol | Archivo |
|-----|--------|
| Preprocess | `includes/preprocess.paragraph.inc` → `_puzz_paragraph_section_component()`, `_puzz_paragraph_header_component()` |
| Plantillas párrafo | `templates/paragraph/paragraph--puzz-section.html.twig`, `paragraph--puzz-header.html.twig` |
| Componentes | `components/section/section.twig`, `components/header/header.twig` |

### Patrón unificado

Todas las plantillas de párrafo en view mode component siguen el mismo patrón (igual que `input.html.twig`):

```twig
{% if component is defined and props is defined %}
  {{ {
    '#type': 'component',
    '#component': component ?? 'puzz:nombre_componente',
    '#props': props
  } }}
{% else %}
  {{ content }}
{% endif %}
```

Nota: las props dependen de cada componente. Por ejemplo, en `puzz:header` el título principal se pasa como `caption` (mapeado desde `field_puzz_header_caption`).

### Añadir un nuevo tipo de párrafo "component"

1. En el módulo: definir el paragraph type, campos y displays (view mode "component").
2. En el tema: en `preprocess.paragraph.inc`, añadir `elseif ($paragraph->bundle() === 'mi_tipo')` y una función `_puzz_paragraph_mi_tipo_component($variables, $paragraph)` que rellene `$variables['component']` y `$variables['props']`.
3. En el tema: crear `templates/paragraph/paragraph--mi-tipo--component.html.twig` con el mismo bloque de arriba (sustituyendo `puzz:nombre_componente` por el ID del componente).
4. En el componente: en el `.twig` del componente renderizar solo las props definidas para ese bundle.

## 🔧 Configuración

### URL de Drupal

```bash
DRUPAL_URL=http://localhost:8080 npm run dev
```

### Puerto de BrowserSync

```bash
BROWSERSYNC_PORT=3001 npm run dev
```

## 🔍 Verificación y Debug

### Verificar que el Componente Carga su CSS/JS

1. **Renderiza el componente en una página**
2. **Abre DevTools (F12) → Network**
3. **Recarga la página**
4. **Busca `{nombre}.css` y `{nombre}.js`** en la lista de recursos

Si los ves → ✅ Funciona correctamente  
Si NO los ves → ❌ Problema con el hook o la librería

### Verificar Librería Registrada

```bash
drush ev "var_dump(\Drupal::service('library.discovery')->getLibraryByName('puzz', 'cta'));"
```

Deberías ver la definición de la librería con `cta.css` y `cta.js`.

### Verificar Componente SDC

```bash
drush ev "\$component = \Drupal::service('sdc.component_loader')->load('puzz', 'cta'); print_r(\$component);"
```

### Limpiar Caché

```bash
drush cr
# o
drush cache:rebuild
```

### Solución de Problemas

Si el componente no carga su CSS/JS:

1. **Verifica que los archivos existen:**
   ```bash
   ls -la build/components/cta/
   ```

2. **Verifica que el componente tiene `libraryOverrides` en su `.component.yml`**

3. **Verifica que la librería está registrada** (ver comandos arriba)

4. **Limpia la caché de Drupal**

5. **Prueba adjuntar manualmente en Twig:**
   ```twig
   {{ attach_library('puzz/cta') }}
   {{ {
     '#type': 'component',
     '#component': 'puzz:cta',
     '#props': {'text': 'Test', 'url': '#'}
   } }}
   ```

## 🔒 Seguridad

### Gestión de Vulnerabilidades

Este tema usa dependencias de desarrollo que pueden tener vulnerabilidades conocidas. Las vulnerabilidades en dependencias de desarrollo **no afectan** el sitio en producción ya que estas dependencias solo se usan durante el desarrollo.

### Configuración de Advertencias

El archivo `.npmrc` está configurado para:
- `audit=false` - No ejecutar audit automáticamente
- `loglevel=error` - Solo mostrar errores, no warnings de deprecación
- `fund=false` - No mostrar mensajes de funding

### Overrides de Dependencias

El `package.json` incluye `overrides` para forzar versiones seguras de dependencias transitivas:
- `glob`: ^11.0.1 (versión segura, reemplaza la 10.5.0 deprecada)

### Verificar Vulnerabilidades Manualmente

```bash
npm audit
```

### Arreglar Vulnerabilidades

```bash
# Arreglar vulnerabilidades que no requieren cambios breaking
npm audit fix

# Arreglar todas las vulnerabilidades (puede requerir actualizaciones breaking)
npm audit fix --force
```

## 📚 Opciones de Arquitectura

### ✅ Opción A: CSS Global Separado + Componentes Individuales (Implementada)

**Ventajas:**
- ✅ Cada componente carga solo lo necesario
- ✅ Mejor rendimiento (código dividido)
- ✅ Más fácil de mantener
- ✅ Carga bajo demanda

**Estructura:**
```
build/
├── css/
│   └── main.css      ← Global (siempre) - incluye todos los partials
├── js/
│   └── main.js       ← Global (siempre)
└── components/
    └── cta/
        ├── cta.css   ← Solo si se usa
        └── cta.js    ← Solo si se usa
```

**Librerías:**
- `puzz/global-styling` → css/main.css, js/main.js (siempre cargado)
- `puzz/cta` → `build/components/cta/cta.css`, `build/components/cta/cta.js` (solo cuando se renderiza el componente)

### Opción B: Un solo CSS/JS Global + Componentes

**Estructura:**
```
build/
├── css/
│   └── main.css      ← Todo el CSS global compilado junto (todos los partials)
├── js/
│   └── main.js       ← Todo el JS global compilado junto
└── components/
    └── cta/
        ├── cta.css   ← Solo si se usa
        └── cta.js    ← Solo si se usa
```

**Cuándo usar:** Si prefieres tener un solo archivo CSS/JS global en lugar de varios.

### Opción C: Todo como Componentes SDC

**Estructura:**
```
build/
└── components/
    ├── base/
    │   ├── base.css
    │   └── base.js
    ├── layout/
    │   ├── layout.css
    │   └── layout.js
    └── cta/
        ├── cta.css
        └── cta.js
```

**Cuándo usar:** Si quieres tratar todo como componentes SDC, incluso los estilos base.

## 📚 Integración con Storybook

Storybook permite visualizar y desarrollar componentes de forma aislada, facilitando el diseño y las pruebas de componentes antes de integrarlos en Drupal.

### Instalación y Configuración

Storybook está configurado en el directorio `.storybook/` del tema y utiliza Vite como bundler.

#### Estructura de Storybook

```
.storybook/
├── main.js          # Configuración principal de Storybook
└── preview.js       # Configuración global del preview (carga CSS, tokens, etc.)

components/
└── {component}/
    └── {component}.stories.js  # Stories del componente (dentro del directorio del componente)
```

### Comandos Disponibles

```bash
# Iniciar Storybook (compila automáticamente antes de iniciar)
npm run storybook

# Build de Storybook para producción
npm run build-storybook
```

**Nota:** El comando `npm run storybook` ejecuta automáticamente `npm run build:dev` antes de iniciar Storybook (mediante el hook `prestorybook` en `package.json`), asegurando que los archivos CSS compilados estén disponibles.

### Configuración de Storybook

#### `.storybook/main.js`

Configuración principal que define:
- **Stories**: Patrones de búsqueda de archivos `.stories.js`
  - `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`
  - `../components/**/*.stories.@(js|jsx|mjs|ts|tsx)`
- **Addons**: Extensiones instaladas
  - `@chromatic-com/storybook`: Integración con Chromatic
  - `@storybook/addon-vitest`: Testing con Vitest
  - `@storybook/addon-a11y`: Auditoría de accesibilidad
  - `@storybook/addon-docs`: Documentación automática
- **Framework**: `@storybook/html-vite` (HTML con Vite)
- **Vite Configuration**: 
  - Root: Directorio raíz del tema
  - Alias `@`: Apunta al directorio del tema
  - **Proxy**: Configurado para evitar problemas de CORS al cargar `puzz.root.css` desde Drupal

#### Proxy para CORS

El proxy de Vite está configurado para redirigir peticiones a `/sites/default/files/puzz.root.css` al servidor de Drupal:

```javascript
server: {
  proxy: {
    '/sites/default/files/puzz.root.css': {
      target: process.env.APPSETTING_SERVICE_WWW_HOST || 'http://localhost',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

**Variable de entorno:** `APPSETTING_SERVICE_WWW_HOST` (por defecto: `http://localhost`)

Esto permite que Storybook cargue dinámicamente los colores personalizados desde Drupal sin problemas de CORS.

#### `.storybook/preview.js`

Configuración global del preview que se aplica a todas las stories:

1. **Carga de CSS Global:**
   ```javascript
   import '@/build/css/main.css';
   ```
   Carga los estilos principales del tema, incluyendo variables CSS por defecto desde `variables.scss` (generadas desde `puzz.root.yml`).

2. **Carga Dinámica de Colores Personalizados:**
   ```javascript
   const rootCssUrl = '/sites/default/files/puzz.root.css';
   fetch(rootCssUrl, { ... })
   ```
   Intenta cargar `puzz.root.css` desde Drupal (generado cuando se guardan los settings del tema). Si existe, inyecta los colores personalizados en el documento. Si no existe, usa los valores por defecto de `main.css`.

3. **Carga Automática de CSS de Componentes:**
   ```javascript
   const componentStyles = import.meta.glob('@/build/components/**/*.css', { eager: true });
   ```
   Carga automáticamente todos los archivos CSS de componentes compilados en `build/components/`.

### Crear Stories para un Componente

Las stories se definen en archivos `.stories.js` dentro del directorio del componente:

```
components/
└── cta/
    ├── cta.component.yml
    ├── cta.twig
    ├── cta.scss
    ├── cta.js
    └── cta.stories.js  ← Story del componente
```

#### Estructura de una Story y snippet Twig

**Importante:** en este tema las stories pueden renderizarse con DOM JS y, en documentación, exponen un snippet Twig de uso mediante `parameters.docs.source.transform`.

```javascript
/**
 * @file
 * CTA component stories.
 * Story renders a preview and exposes Twig usage in Docs.
 * 
 * Note: Component CSS is loaded automatically in .storybook/preview.js
 */

export default {
  title: 'Puzz/CTA',
  tags: ['autodocs'],
  render: (args) => renderCTA(args),
  parameters: {
    docs: {
      source: {
        transform: (code, storyContext) => {
          const { args } = storyContext;
          return `{{ {
  '#type': 'component',
  '#component': 'puzz:cta',
  '#props': {
    'text': '${args.text}',
    'url': '${args.url}',
    'variant': '${args.variant}',
    'size': '${args.size}'
  }
} }}`;
        },
      },
    },
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'Button or link text',
    },
    url: {
      control: 'text',
      description: 'Link URL. Leave empty to render as a button.',
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline'],
      description: 'Button style variant',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Button size',
    },
  },
  args: {
    text: 'Click here',
    url: '#',
    variant: 'primary',
    size: 'medium',
  },
};

export const Primary = {
  args: {
    text: 'Primary CTA',
    url: '#',
    variant: 'primary',
    size: 'medium',
  },
};
```

#### Cómo se muestra Twig en Docs

El bloque de ejemplo Twig se genera en cada story con:

1. `parameters.docs.source.transform`
2. lectura de `storyContext.args`
3. construcción del render array `#type/#component/#props`

#### Características Importantes

1. **Snippet útil**: El bloque Twig mostrado en Docs es copiable y refleja los args de la story.

2. **CSS Automático**: El CSS del componente se carga automáticamente vía `preview.js`, no necesitas importarlo manualmente.

3. **Props**: Los argumentos (`args`) deben coincidir con las props definidas en el `.component.yml`.

4. **Documentación**: Usa `tags: ['autodocs']` para generar documentación automática.

5. **Hot Reload**: Los cambios en los templates Twig se reflejan automáticamente en Storybook.

#### Ventajas de Usar Twig en Storybook

- ✅ **Consistencia de uso**: El snippet Twig mostrado en Storybook coincide con el API de props del componente
- ✅ **Mantenibilidad**: Un solo lugar para mantener el template
- ✅ **Precisión**: El HTML renderizado coincide exactamente con Drupal
- ✅ **Profesionalismo**: Muestra el código real usado en producción

### Sincronización de Colores con Drupal

Storybook puede reflejar los colores personalizados configurados en la UI de Drupal:

#### Flujo de Sincronización

1. **Usuario modifica colores en Drupal UI** (`/admin/appearance/settings/puzz`)
2. **Al guardar**, se ejecuta `puzz_theme_settings_submit()` en `puzz.theme`
3. **Se genera `puzz.root.css`** en `/sites/default/files/puzz.root.css` con los colores actuales
4. **Storybook carga dinámicamente** `puzz.root.css` al iniciar (vía `preview.js`)
5. **Los componentes reflejan** los colores personalizados

#### Archivo `puzz.root.css`

Este archivo se genera automáticamente cuando se guardan los settings del tema y contiene:

```css
/**
 * Theme colors from Drupal UI settings (puzz.settings).
 * Generated automatically - do not edit manually.
 */
:root {
  --color-1: #3b82f6;
  --color-2: #10b981;
  --color-3: #f59e0b;
  --color-4: #ef4444;
  --color-5: #8b5cf6;
}
```

**Ubicación:** `/sites/default/files/puzz.root.css` (directorio público de Drupal)

**Generación:** Automática al guardar settings del tema

**Uso en Storybook:** Cargado dinámicamente vía proxy de Vite

#### Valores por Defecto

Si `puzz.root.css` no existe o no se puede cargar, Storybook usa los valores por defecto definidos en:
- `src/scss/partials/variables.scss` (generado desde `config/install/puzz.root.yml`)

### Configuración de Variables de Entorno

Para que Storybook se conecte correctamente a Drupal, configura la variable de entorno:

```bash
# En tu entorno de desarrollo
export APPSETTING_SERVICE_WWW_HOST=http://local-www.demo.es

# O al ejecutar Storybook
APPSETTING_SERVICE_WWW_HOST=http://local-www.demo.es npm run storybook
```

**Nota:** La URL debe incluir el protocolo (`http://` o `https://`). Si solo proporcionas el host, puede que necesites añadir el protocolo manualmente.

### Troubleshooting

#### Storybook no carga los colores personalizados

1. **Verifica que `puzz.root.css` existe:**
   ```bash
   ls -la /sites/default/files/puzz.root.css
   ```

2. **Verifica la variable de entorno:**
   ```bash
   echo $APPSETTING_SERVICE_WWW_HOST
   ```

3. **Revisa la consola del navegador** para mensajes de error al cargar `puzz.root.css`

4. **Verifica el proxy en `.storybook/main.js`** está configurado correctamente

#### CSS de componentes no se carga

1. **Asegúrate de haber compilado el tema:**
   ```bash
   npm run build:dev
   ```

2. **Verifica que los archivos CSS existen:**
   ```bash
   ls -la build/components/*/
   ```

3. **Revisa `preview.js`** para asegurarte de que `import.meta.glob` está configurado correctamente

#### Errores de CORS

Si ves errores de CORS al cargar `puzz.root.css`:

1. **Verifica que el proxy está configurado** en `.storybook/main.js`
2. **Asegúrate de usar HTTP** si Storybook está en HTTP (no HTTPS)
3. **Verifica que `hook_file_download()`** en `puzz.theme` está añadiendo headers CORS correctamente

### Ventajas de la Integración

- ✅ **Desarrollo Aislado**: Desarrolla componentes sin necesidad de Drupal
- ✅ **Documentación Automática**: Genera documentación interactiva de componentes
- ✅ **Testing Visual**: Prueba diferentes variantes y estados de componentes
- ✅ **Sincronización de Tokens**: Los colores personalizados en Drupal se reflejan en Storybook
- ✅ **Accesibilidad**: Addon de a11y para verificar accesibilidad de componentes
- ✅ **Hot Reload**: Cambios en CSS/JS se reflejan automáticamente

## 🛠️ Tecnologías Utilizadas

- **Sass (Dart Sass)**: Compilador SCSS → CSS
- **PostCSS**: Post-procesador CSS (Autoprefixer, sorting)
- **BrowserSync**: Hot reload y sincronización del navegador
- **Chokidar**: Observador de archivos para desarrollo
- **Fast-Glob**: Expansión de patrones glob en imports SCSS
- **Drupal SDC**: Single-Directory Components para organización modular
- **Storybook**: Herramienta de desarrollo y documentación de componentes
- **Vite**: Bundler rápido para Storybook

## 📄 Licencia

ISC
