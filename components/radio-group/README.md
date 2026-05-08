# Radio Group

Componente para grupos de radios con `legend`, ayuda y error.

## Props

| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `legend` | string | — | Título del grupo. |
| `name` | string | — | Nombre del grupo de radios. |
| `options` | array | `[]` | Opciones (`value`, `label`, `checked`). |
| `children` | mixed | — | Render children de Drupal (prioridad alta). |
| `required` | boolean | `false` | Grupo obligatorio. |
| `disabled` | boolean | `false` | Grupo deshabilitado. |
| `help` | string | — | Texto de ayuda. |
| `error` | string | — | Mensaje de error. |

## Ejemplo

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:radio-group',
  '#props': {
    'legend': 'Contact preference',
    'name': 'contact_preference',
    'options': [
      {'value': 'email', 'label': 'Email', 'checked': true},
      {'value': 'phone', 'label': 'Phone'}
    ]
  }
} }}
```

## Integración Drupal

`templates/form/radios.html.twig` usa este componente con `puzz_preprocess_radios()`.

