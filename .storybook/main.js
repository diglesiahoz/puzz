/** @type { import('@storybook/html-vite').StorybookConfig } */
import { mergeConfig } from 'vite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Ruta publicada del estatico (p. ej. nginx `/@storybook/`).
 * En dev (`npm run storybook`) no definas env: queda `/`.
 * En build para ese path: `STORYBOOK_BASE_PATH=/@storybook/` (ver package.json).
 */
function storybookPublicPath() {
  const raw = process.env.STORYBOOK_BASE_PATH;
  if (!raw || raw === '/') return '/';
  return raw.endsWith('/') ? raw : `${raw}/`;
}

/** Sin esto, `<base href>` queda despues de los modulepreload y las rutas `./...` fallan en subruta. */
function injectBaseFirstPlugin() {
  const basePath = storybookPublicPath();
  return {
    name: 'storybook-subpath-base-first',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (basePath === '/') return html;
        const pathStr = ctx?.path ?? ctx?.filename ?? '';
        const isIframe =
          pathStr.includes('iframe') ||
          html.includes('vite-inject-mocker-entry');
        const baseTag = isIframe
          ? `<base href="${basePath}" target="_parent" />\n`
          : `<base href="${basePath}" />\n`;
        let out = html.replace(/<head([^>]*)>/i, `<head$1>\n${baseTag}`);
        if (isIframe) {
          out = out.replace(/\n\s*<base target="_parent" \/>\s*\n/, '\n');
        }
        return out;
      },
    },
  };
}

const config = {
  stories: ['../components/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/html-vite',
  async viteFinal(config) {
    const drupalUrl =
      process.env.APPSETTING_SERVICE_WWW_HOST || 'http://localhost';
    if (process.env.DEBUG_STORYBOOK) {
      console.log('Drupal URL (Storybook proxy):', drupalUrl);
    }

    return mergeConfig(config, {
      plugins: [injectBaseFirstPlugin(), ...(config.plugins ?? [])],
      base: storybookPublicPath(),
      root: join(__dirname, '..'),
      resolve: {
        alias: {
          '@': join(__dirname, '..'),
        },
      },
      build: {
        chunkSizeWarningLimit: 1200,
      },
      server: {
        proxy: {
          '/sites/default/files/puzz.root.css': {
            target: drupalUrl,
            changeOrigin: true,
            secure: false,
          },
        },
      },
    });
  },
};
export default config;
