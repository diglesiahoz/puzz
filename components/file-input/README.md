# File Input

Componente para carga de archivos (single/multiple) con estados de ayuda y error.

## Props

| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `name` | string | — | Atributo `name`. |
| `id` | string | auto | ID del campo. |
| `label` | string | — | Etiqueta visible. |
| `multiple` | boolean | `false` | Permite seleccionar varios archivos. |
| `accept` | string | — | Restricción de tipos (ej: `image/*`). |
| `required` | boolean | `false` | Campo obligatorio. |
| `disabled` | boolean | `false` | Campo deshabilitado. |
| `help` | string | — | Texto de ayuda. |
| `error` | string | — | Mensaje de error. |

## Ejemplo

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:file-input',
  '#props': {
    'name': 'attachments[]',
    'label': 'Attachments',
    'multiple': true,
    'accept': 'image/*,.pdf'
  }
} }}
```

## Integración Drupal

`puzz_preprocess_input()` mapea `type="file"` a `puzz:file-input`.

