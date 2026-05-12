import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Rutas relativas al documento del manager: el build del manager NO recibe STORYBOOK_BASE_PATH
// (process.env queda vacio y antes generaba `/theme/logo.svg` en la raiz del dominio -> 404).
// Con `staticDirs` en `/`, el logo queda en `./logo.svg` (y favicon en `./favicon.svg`, mismo SVG).
addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Puzz',
    brandUrl: './',
    brandImage: './logo.svg',
    brandTarget: '_self',
  }),
});
