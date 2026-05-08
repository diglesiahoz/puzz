# Form Fieldset

Componente contenedor para agrupar controles de formulario con `legend`, descripción y errores.

## Props

| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `legend` | string | — | Título del fieldset. |
| `description` | string | — | Texto descriptivo. |
| `description_display` | string | `after` | `before`, `after`, `invisible`. |
| `required` | boolean | `false` | Marca visual de requerido. |
| `errors` | string | — | Mensaje de error del grupo. |
| `prefix` | string | — | Prefijo opcional. |
| `suffix` | string | — | Sufijo opcional. |
| `children` | mixed | — | Contenido interno renderizado. |

## Ejemplo

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:form-fieldset',
  '#props': {
    'legend': 'Preferences',
    'description': 'Choose one or more options.',
    'children': my_children_render_array
  }
} }}
```

## Integración Drupal

`templates/form/fieldset.html.twig` renderiza este componente usando `puzz_preprocess_fieldset()` (`includes/preprocess.fieldset.inc`).

