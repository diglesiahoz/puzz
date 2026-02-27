# CTA (Call-to-Action)

Componente de botón o enlace de llamada a la acción. Se renderiza como `<a>` cuando se indica una URL, o como `<button>` cuando la URL está vacía. Los estilos y el JavaScript se cargan automáticamente cuando el componente se renderiza. Las clases CSS siguen la convención **BEM** (Block, Element, Modifier); ver el README principal del tema.

## Props

| Prop      | Tipo   | Por defecto | Descripción                                      |
|-----------|--------|-------------|--------------------------------------------------|
| `text`    | string | —           | Texto del botón o del enlace.                     |
| `url`     | string | —           | URL del enlace. Vacía = se renderiza como botón. |
| `variant` | string | `primary`   | Estilo: `primary`, `secondary`, `outline`.       |
| `size`    | string | `medium`    | Tamaño: `small`, `medium`, `large`.              |
| `button_type` | string | `button` | Tipo del `<button>` cuando no hay URL: `button` o `submit`. |

## Variantes

- **primary** – Acción principal (fondo con color del tema).
- **secondary** – Acción secundaria (gris).
- **outline** – Estilo con borde (transparente con borde).

## Tamaños

- **small** – Menos padding y tamaño de fuente.
- **medium** – Por defecto.
- **large** – Más padding y tamaño de fuente.

## Ejemplos de uso

### Render array en Twig

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:cta',
  '#props': {
    'text': 'Saber más',
    'url': '/sobre-nosotros',
    'variant': 'primary',
    'size': 'medium',
  }
} }}
```

### Como enlace (con URL)

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:cta',
  '#props': {
    'text': 'Contactar',
    'url': '/contacto',
    'variant': 'outline',
    'size': 'medium',
  }
} }}
```

### Como botón (sin URL)

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:cta',
  '#props': {
    'text': 'Enviar',
    'url': '',
    'variant': 'primary',
    'size': 'large',
  }
} }}
```

### Render array (PHP)

```php
$build['cta'] = [
  '#type' => 'component',
  '#component' => 'puzz:cta',
  '#props' => [
    'text' => 'Pulsar aquí',
    'url' => 'https://ejemplo.com',
    'variant' => 'primary',
    'size' => 'medium',
  ],
];
```

### Mínimo (valores por defecto)

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:cta',
  '#props': {
    'text': 'Pulsar aquí',
    'url': '#',
  }
} }}
```

## Integración con formularios Drupal

Los botones de tipo **submit** (`<input type="submit">`) se renderizan automáticamente con este componente mediante el preprocess del tema. Ver `includes/preprocess.input.inc`: cuando el tipo HTML del input es `submit`, se mapea a `puzz:cta` con `button_type: 'submit'` para que el formulario siga enviándose correctamente.

## Storybook

Las historias están en `components/cta/cta.stories.js`. Ejecuta `npm run storybook` y abre **Puzz → CTA** para probar variantes y tamaños.
