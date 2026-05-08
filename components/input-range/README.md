# Input Range

Componente slider (`type="range"`) con visualización del valor actual.

## Props

| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `name` | string | — | Atributo `name`. |
| `id` | string | auto | ID del campo. |
| `label` | string | — | Etiqueta visible. |
| `value` | string | `0` | Valor actual. |
| `min` | string | — | Valor mínimo. |
| `max` | string | — | Valor máximo. |
| `step` | string | — | Paso de incremento/decremento. |
| `required` | boolean | `false` | Campo obligatorio. |
| `disabled` | boolean | `false` | Campo deshabilitado. |
| `help` | string | — | Texto de ayuda. |
| `error` | string | — | Mensaje de error. |

## Ejemplo

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:input-range',
  '#props': {
    'name': 'score',
    'label': 'Score',
    'value': '30',
    'min': '0',
    'max': '100',
    'step': '1'
  }
} }}
```

## Integración Drupal

`puzz_preprocess_input()` mapea `type="range"` a `puzz:input-range`.

