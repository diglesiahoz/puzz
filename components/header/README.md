# Header

Componente hero/header para el paragraph `puzz_header`.

## Props

| Prop | Tipo | Descripción |
|---|---|---|
| `caption` | string | Título principal (mapeado desde `field_puzz_header_caption`; fallback al título de página). |
| `image` | render array / markup | Imagen de fondo renderizada (media view mode `puzz_header`). |
| `link_url` | string | URL del CTA. Si está vacío, no se renderiza CTA. |
| `link_title` | string | Texto del CTA. |

## Ejemplo

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:header',
  '#props': {
    'caption': 'Build better digital experiences',
    'image': image_render_array,
    'link_url': '/contact',
    'link_title': 'Discover more'
  }
} }}
```

## Integración Drupal

Se resuelve en `includes/preprocess.paragraph.inc` mediante `_puzz_paragraph_header_component()`.

- `caption` se toma de `field_puzz_header_caption`.
- Si está vacío, usa fallback al título de la página.
- `image` se renderiza desde `field_puzz_header_image`.
- `link_url` y `link_title` se toman de `field_puzz_header_link`.

