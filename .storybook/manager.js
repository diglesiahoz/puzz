import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Rutas relativas al documento del manager: el build del manager NO recibe STORYBOOK_BASE_PATH
// (process.env queda vacio y antes generaba `/theme/logo.svg` en la raiz del dominio -> 404).
// Con `<base href="/@storybook/">` inyectado en main.js, `./theme/logo.svg` -> `/@storybook/theme/logo.svg`.
addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Puzz',
    brandUrl: './',
    brandImage: './theme/logo.svg',
    brandTarget: '_self',
  }),
});
