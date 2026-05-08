# Checkbox Group

Componente para grupos de checkboxes con `legend`, ayuda y error.

## Props

| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `legend` | string | — | Título del grupo. |
| `name` | string | — | Nombre base del grupo. |
| `options` | array | `[]` | Opciones del grupo (`value`, `label`, `checked`). |
| `children` | mixed | — | Render children de Drupal (si existe, tiene prioridad). |
| `required` | boolean | `false` | Grupo obligatorio. |
| `disabled` | boolean | `false` | Grupo deshabilitado. |
| `help` | string | — | Texto de ayuda. |
| `error` | string | — | Mensaje de error. |

## Ejemplo

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:checkbox-group',
  '#props': {
    'legend': 'Topics',
    'name': 'topics',
    'options': [
      {'value': 'news', 'label': 'News', 'checked': true},
      {'value': 'events', 'label': 'Events'}
    ]
  }
} }}
```

## Integración Drupal

`templates/form/checkboxes.html.twig` usa este componente a través de `puzz_preprocess_checkboxes()`.

