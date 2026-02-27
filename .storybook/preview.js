/** @type { import('@storybook/html-vite').Preview } */

// Design tokens: same as Drupal. Theme CSS uses var(--color-1), etc.
// Load theme CSS - it includes :root variables defaults from variables.scss (puzz.root.yml)
// These defaults come from config/install/puzz.root.yml and are generated during build
// Note: If files don't exist (e.g., after clean), Storybook will show an error.
// Run "npm run build:dev" before starting Storybook, or use "npm run storybook" which runs build automatically.
import '@/build/css/main.css';

// Load puzz.root.css from Drupal public directory if it exists (contains customized theme colors)
// This file is generated when theme settings are saved in Drupal UI
// Uses Storybook/Vite proxy to avoid CORS issues (configured in main.js)
// The proxy redirects /sites/default/files/puzz.root.css to the Drupal server
const rootCssUrl = '/sites/default/files/puzz.root.css';

// Try to load puzz.root.css dynamically (contains customized colors from Drupal UI)
fetch(rootCssUrl, {
  method: 'GET',
  mode: 'cors',
  credentials: 'omit',
})
  .then(res => {
    if (res.ok) {
      return res.text();
    }
    throw new Error(`HTTP ${res.status}`);
  })
  .then(css => {
    // Inject the CSS into the document
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    console.log('✓ Loaded customized theme colors from puzz.root.css');
  })
  .catch((err) => {
    // Silently fail - will use defaults from main.css
    console.info(`ℹ Using default theme colors from main.css (puzz.root.css not found: ${err.message})`);
    console.info(`Tried: ${rootCssUrl}`);
  });

// Load component CSS files dynamically
// import.meta.glob returns empty object if no files match (e.g., after clean)
const componentStyles = import.meta.glob('@/build/components/**/*.css', { eager: true });
if (Object.keys(componentStyles).length === 0) {
  console.warn('⚠️ No component CSS files found. Run "npm run build:dev" first.');
}

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    docs: {
      autodocs: 'tag',
    },
  },
};

export default preview;
