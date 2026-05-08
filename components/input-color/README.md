# Input Color

Componente selector de color (`type="color"`) con visualización del valor HEX.

## Props

| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `name` | string | — | Atributo `name`. |
| `id` | string | auto | ID del campo. |
| `label` | string | — | Etiqueta visible. |
| `value` | string | `#3b82f6` | Color inicial. |
| `required` | boolean | `false` | Campo obligatorio. |
| `disabled` | boolean | `false` | Campo deshabilitado. |
| `help` | string | — | Texto de ayuda. |
| `error` | string | — | Mensaje de error. |

## Ejemplo

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:input-color',
  '#props': {
    'name': 'brand_color',
    'label': 'Brand color',
    'value': '#0ea5e9'
  }
} }}
```

## Integración Drupal

`puzz_preprocess_input()` mapea `type="color"` a `puzz:input-color`.

