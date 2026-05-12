/** @type { import('@storybook/html-vite').StorybookConfig } */
import { mergeConfig } from 'vite';
import { readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Raiz del tema (puzz o un hijo en `themes/custom/<machine_name>/`). */
const themeRoot = join(__dirname, '..');

/**
 * `name` del `*.info.yml` del tema actual (hijo o padre). No hardcodear "puzz".
 */
function readThemeDisplayName() {
  const slug = basename(themeRoot);
  try {
    const files = readdirSync(themeRoot);
    const preferred = `${slug}.info.yml`;
    const ymlName = files.includes(preferred)
      ? preferred
      : files.find((f) => f.endsWith('.info.yml'));
    if (!ymlName) return slug;
    const raw = readFileSync(join(themeRoot, ymlName), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (!t.startsWith('name:')) continue;
      let v = t.slice(5).trim();
      if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
        return v.slice(1, -1).trim();
      }
      return v.replace(/\s+#.*$/, '').trim();
    }
  } catch {
    /* vacio */
  }
  return slug;
}

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

/** Logo en URLs publicas (fallback): con `staticDirs` en `/`, el fichero es `/logo.svg` (o bajo base). */
function brandLogoUrlFromConfig() {
  const base = storybookPublicPath();
  if (base === '/') return '/logo.svg';
  return `${base}logo.svg`;
}

/** Logo en el manager: data URL leida en tiempo de config (evita GET a `/@storybook/...` con Basic Auth, que el `<img>` suele no autenticar). Fallback: ruta publica. */
function brandLogoSrcForManager() {
  try {
    const logoPath = join(__dirname, 'assets', 'logo.svg');
    const svg = readFileSync(logoPath, 'utf8');
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  } catch {
    return brandLogoUrlFromConfig();
  }
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
  // Mismo directorio: `logo.svg` (tema) + `favicon.svg` -> mismo fichero (preset favicon de Storybook busca favicon.svg en raiz del estatico).
  staticDirs: [{ from: join(__dirname, 'assets'), to: '/' }],
  stories: ['../components/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/html-vite',
  /** CSS del manager + logo incrustado (data URL) para no depender de Basic Auth en subrecursos. */
  managerHead: (head) => {
    const logoSrc = brandLogoSrcForManager();
    const themeDisplayName = readThemeDisplayName();
    return `${head ?? ''}
<script>globalThis.__PUZZ_STORYBOOK_THEME_NAME__=${JSON.stringify(themeDisplayName)};</script>
<style id="puzz-storybook-manager">
  .sidebar-header a[title][href] {
    display: inline-flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 0.5rem !important;
  }
  .sidebar-header a[title][href]::after {
    content: attr(title);
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 1.2;
    color: #a0a0a0;
  }
  .sidebar-header img {
    max-height: 50px;
    width: auto;
    height: auto;
    object-fit: contain;
  }
</style>
<script id="puzz-storybook-brand-src">
(function () {
  var SRC = ${JSON.stringify(logoSrc)};
  function puzzApplyBrandSrc() {
    document.querySelectorAll(".sidebar-header img").forEach(function (el) {
      if (el.getAttribute("src") !== SRC) {
        el.setAttribute("src", SRC);
      }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", puzzApplyBrandSrc);
  } else {
    puzzApplyBrandSrc();
  }
  var obs = new MutationObserver(function () {
    clearTimeout(obs.t);
    obs.t = setTimeout(puzzApplyBrandSrc, 0);
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
  [0, 100, 400, 1200].forEach(function (ms) {
    setTimeout(puzzApplyBrandSrc, ms);
  });
})();
<\/script>
`;
  },
  async viteFinal(config) {
    const drupalUrl =
      process.env.APPSETTING_SERVICE_WWW_HOST || 'http://localhost';
    if (process.env.DEBUG_STORYBOOK) {
      console.log('Drupal URL (Storybook proxy):', drupalUrl);
    }

    // Primero merge normal (no tocar `plugins` aqui: mergeConfig los concatena y duplicaria).
    const merged = mergeConfig(config, {
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

    const existing = merged.plugins;
    const list = Array.isArray(existing)
      ? existing.flat(Infinity).filter(Boolean)
      : existing
        ? [existing]
        : [];

    return {
      ...merged,
      plugins: [injectBaseFirstPlugin(), ...list],
    };
  },
};
export default config;
