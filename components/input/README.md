# Input

Componente de campo de texto accesible. Renderiza un `<input>` con etiqueta visible y mensajes opcionales de ayuda y error. Los estilos y el JavaScript se cargan automáticamente cuando se renderiza el componente. Las clases CSS siguen la convención **BEM**; ver el README principal del tema.

## Props

| Prop          | Tipo    | Por defecto | Descripción                                         |
|---------------|---------|-------------|-----------------------------------------------------|
| `name`        | string  | —           | Atributo `name` del input.                          |
| `id`          | string  | auto        | Atributo `id` del input. Se genera a partir de `name` si se omite. |
| `type`        | string  | `text`      | Tipo HTML (`text`, `email`, `password`, etc.).      |
| `label`       | string  | —           | Texto visible de la etiqueta.                       |
| `value`       | string  | —           | Valor actual.                                       |
| `placeholder` | string  | —           | Texto de marcador cuando el campo está vacío.      |
| `required`    | boolean | `false`     | Indica si el campo es obligatorio.                  |
| `disabled`    | boolean | `false`     | Indica si el campo está deshabilitado.              |
| `error`       | string  | —           | Mensaje de error de validación.                     |
| `help`        | string  | —           | Texto de ayuda opcional bajo el campo.              |

## Tipos de input soportados

Se consideran “texto” y se renderizan con este componente: `text`, `email`, `password`, `search`, `tel`, `url`, `number`. Otros tipos (`hidden`, `checkbox`, `radio`, etc.) no usan el componente y mantienen el markup por defecto de Drupal.

## Ejemplos de uso

### Render array en Twig

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:input',
  '#props': {
    'name': 'email',
    'label': 'Email',
    'type': 'email',
    'placeholder': 'tu@ejemplo.com',
    'required': true,
  }
} }}
```

### Con texto de ayuda

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:input',
  '#props': {
    'name': 'search',
    'label': 'Buscar',
    'type': 'search',
    'placeholder': 'Buscar...',
    'help': 'Escribe una palabra clave y pulsa Enter.',
  }
} }}
```

### Con mensaje de error

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:input',
  '#props': {
    'name': 'email',
    'label': 'Email',
    'type': 'email',
    'value': 'no-es-un-email',
    'error': 'Introduce una dirección de correo válida.',
  }
} }}
```

### Render array (PHP)

```php
$build['email'] = [
  '#type' => 'component',
  '#component' => 'puzz:input',
  '#props' => [
    'name' => 'email',
    'label' => 'Email',
    'type' => 'email',
    'placeholder' => 'tu@ejemplo.com',
    'required' => TRUE,
  ],
];
```

## Integración con formularios Drupal (preprocess)

Los campos de formulario de tipo **texto** (`textfield`, `email`, `password`, etc.) y los **submit** se renderizan automáticamente con componentes del tema:

- **Input de texto**: `templates/form/input.html.twig` usa el render array con `puzz:input`. El mapeo Form API → props del componente se hace en `includes/preprocess.input.inc` (`puzz_preprocess_input`): se leen atributos del elemento y `#title`, `#description`, `#errors`, etc., y se exponen como `component` y `props` para la plantilla.
- **Label única**: para no duplicar la etiqueta (la de Drupal y la del componente), en `includes/preprocess.form_element.inc` (`puzz_preprocess_form_element`) se vacía el render array de la label para los mismos tipos de input (`textfield`, `email`, `password`, …). Así solo se muestra la label que pinta el componente `puzz:input`.
- **Submit**: los `<input type="submit">` se mapean a `puzz:cta` con `button_type: 'submit'` en el mismo `preprocess.input.inc`.

Archivos implicados:

- `includes/preprocess.input.inc` – Preprocess para `input.html.twig`: decide componente (input vs CTA) y mapea props.
- `includes/preprocess.form_element.inc` – Preprocess para `form-element.html.twig`: vacía la label para tipos de input de texto.
- `templates/form/input.html.twig` – Renderiza el componente indicado en `component` / `props` o el `<input>` por defecto.

## Storybook

Las historias están en `components/input/input.stories.js`. Ejecuta `npm run storybook` y abre **Puzz → Input** para probar diferentes configuraciones.
