# Select

Componente select accesible con soporte para `option` y `optgroup`, incluyendo modo múltiple.

## Props

| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `name` | string | — | Atributo `name`. |
| `id` | string | auto | ID del campo. |
| `label` | string | — | Etiqueta visible. |
| `multiple` | boolean | `false` | Activa selección múltiple. |
| `required` | boolean | `false` | Campo obligatorio. |
| `disabled` | boolean | `false` | Campo deshabilitado. |
| `options` | array | `[]` | Opciones y grupos. |
| `help` | string | — | Texto de ayuda. |
| `error` | string | — | Mensaje de error. |

## Ejemplo

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:select',
  '#props': {
    'name': 'country',
    'label': 'Country',
    'options': [
      {'type': 'option', 'value': '', 'label': 'Select one', 'selected': true},
      {'type': 'option', 'value': 'es', 'label': 'Spain'}
    ]
  }
} }}
```

## Integración Drupal

`templates/form/select.html.twig` renderiza este componente y toma props desde `puzz_preprocess_select()` (`includes/preprocess.select.inc`).

