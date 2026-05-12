import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// `name` del tema: lo inyecta `main.js` (managerHead) leyendo el `*.info.yml` de la raiz del tema (puzz o hijo).
function brandTitleFromTheme() {
  const n = globalThis.__PUZZ_STORYBOOK_THEME_NAME__;
  return typeof n === 'string' && n.trim() ? n.trim() : 'Theme';
}

// Con `staticDirs` en `/`, logo y favicon en `./logo.svg` / `./favicon.svg`.
addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: brandTitleFromTheme(),
    brandUrl: './',
    brandImage: './logo.svg',
    brandTarget: '_self',
  }),
});
