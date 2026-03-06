# Section

Sección contenedora con contenido (por ejemplo cuerpo de texto). Se usa desde el paragraph type **Section** del módulo **puzz_component_section** cuando el campo de párrafos se muestra con el view mode **Component**. Los estilos y el JavaScript se cargan automáticamente cuando el componente se renderiza. Las clases CSS siguen la convención **BEM** (Block, Element, Modifier); ver el README principal del tema.

## Props

| Prop       | Tipo   | Por defecto | Descripción                                      |
|------------|--------|-------------|--------------------------------------------------|
| `content`  | string | —           | Contenido HTML de la sección (p. ej. cuerpo del párrafo). |

## Ejemplos de uso

### Render array en Twig

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:section',
  '#props': {
    'content': '<p>Contenido de la sección.</p>',
  }
} }}
```

### Con título y párrafo

```twig
{{ {
  '#type': 'component',
  '#component': 'puzz:section',
  '#props': {
    'content': '<h2>Título</h2><p>Texto de la sección.</p>',
  }
} }}
```

### Render array (PHP)

```php
$build['section'] = [
  '#type' => 'component',
  '#component' => 'puzz:section',
  '#props' => [
    'content' => '<p>Contenido generado en PHP.</p>',
  ],
];
```

## Integración con Drupal (paragraph Section)

El módulo **puzz_component_section** define el paragraph type **Section** con un campo **Body** (texto formateado). Cuando los párrafos se muestran con el view mode **Component** (definido en el módulo **puzz_component**), `hook_entity_view()` sustituye el render por el componente `puzz:section` y pasa el HTML del body en la prop `content`. No hace falta preprocess en el tema; basta con asignar el view mode **Component** al campo de párrafos en la configuración de visualización del contenido.

## Storybook

Las historias están en `components/section/section.stories.js`. Ejecuta `npm run storybook` y abre **Puzz → Section** para probar el componente.
