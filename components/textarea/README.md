# Textarea

Componente de textarea accesible con label, ayuda y error.

## Props

| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `name` | string | — | Atributo `name`. |
| `id` | string | auto | ID del campo. |
| `label` | string | — | Etiqueta visible. |
| `value` | string | `''` | Contenido inicial. |
| `rows` | number | `5` | Número de filas. |
| `placeholder` | string | — | Placeholder opcional. |
| `required` | boolean | `false` | Campo obligatorio. |
| `disabled` | boolean | `false` | Campo deshabilitado. |
| `help` | string | — | Texto de ayuda. |
| `error` | string | — | Mensaje de error. |

## Uso

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:textarea',
  '#props': {
    'name': 'message',
    'label': 'Message',
    'rows': 6,
    'placeholder': 'Write your message...'
  }
} }}
```

## Integración Drupal

`templates/form/textarea.html.twig` renderiza este componente usando `puzz_preprocess_textarea()` en `includes/preprocess.textarea.inc`.

