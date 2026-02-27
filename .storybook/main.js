/** @type { import('@storybook/html-vite').StorybookConfig } */
import { mergeConfig } from 'vite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  "stories": [
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/html-vite",
  async viteFinal(config) {
    // const drupalUrl = process.env.APPSETTING_SERVICE_WWW_HOST || 'http://localhost';
    const drupalUrl = 'http://localhost';
    console.log('🔍 Drupal URL:', drupalUrl);
    
    return mergeConfig(config, {
      root: join(__dirname, '..'),
      resolve: {
        alias: {
          '@': join(__dirname, '..'),
        },
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
