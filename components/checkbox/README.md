# Checkbox

Componente para checkbox individual con label, ayuda y error.

## Props

| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `name` | string | — | Atributo `name`. |
| `id` | string | auto | ID del campo. |
| `label` | string | — | Texto de la etiqueta. |
| `value` | string | `1` | Valor enviado al marcar. |
| `checked` | boolean | `false` | Estado marcado. |
| `required` | boolean | `false` | Campo obligatorio. |
| `disabled` | boolean | `false` | Campo deshabilitado. |
| `help` | string | — | Texto de ayuda. |
| `error` | string | — | Mensaje de error. |

## Ejemplo

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:checkbox',
  '#props': {
    'name': 'terms',
    'label': 'Accept terms',
    'checked': true
  }
} }}
```

## Integración Drupal

`puzz_preprocess_input()` mapea `type="checkbox"` a `puzz:checkbox`.

