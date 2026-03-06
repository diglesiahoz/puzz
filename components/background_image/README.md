# Background image

Sección con imagen de fondo y contenido opcional encima. Usado por el paragraph type "Background image" del módulo Puzz component.

## Props

- **image_url**: URL de la imagen de fondo.
- **image_alt**: Texto alternativo de la imagen.
- **content**: Contenido opcional (HTML) sobre la imagen.
- **overlay**: `none` | `dark` | `light` — capa semitransparente sobre la imagen.

## Uso desde Drupal

El paragraph type `background_image` expone el campo `field_image`. Para renderizarlo con este componente, usar un preprocess que construya el render array con `#component 'puzz:background_image'` y pase la URL y alt de la imagen del párrafo.
