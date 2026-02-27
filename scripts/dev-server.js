#!/usr/bin/env node

/**
 * @file
 * Development server with hot reload using BrowserSync.
 */

import chokidar from 'chokidar';
import browserSync from 'browser-sync';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { build } from './build.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const themeRoot = join(__dirname, '..');

const config = {
  drupalUrl: process.env.DRUPAL_URL || 'http://localhost',
  port: process.env.BROWSERSYNC_PORT || 3000,
  watchFiles: [
    'src/scss/**/*.scss',      // Global SCSS
    'src/js/**/*.js',          // Global JS
    'components/**/*.scss',    // Component SCSS
    'components/**/*.js',      // Component JS
    'components/**/*.twig',    // Component templates
    'templates/**/*.twig',     // Global theme templates
  ],
};

let isBuilding = false;
let buildQueue = [];

/**
 * Build components in dev mode (with source maps).
 */
async function buildComponents() {
  return new Promise(async (resolve, reject) => {
    if (isBuilding) {
      buildQueue.push({ resolve, reject });
      return;
    }

    isBuilding = true;
    console.log('🔄 Compiling (dev mode)...');

    try {
      // Always use 'dev' mode for development server
      await build(true, 'dev');
      console.log('✅ Build complete!\n');
      isBuilding = false;
      resolve();
      
      if (buildQueue.length > 0) {
        const next = buildQueue.shift();
        buildComponents().then(next.resolve).catch(next.reject);
      }
    } catch (error) {
      isBuilding = false;
      console.error('❌ Build failed:', error.message, '\n');
      reject(error);
      
      if (buildQueue.length > 0) {
        const next = buildQueue.shift();
        buildComponents().then(next.resolve).catch(next.reject);
      }
    }
  });
}

/**
 * Initialize BrowserSync.
 */
function initBrowserSync() {
  const bs = browserSync.create();

  bs.init({
    proxy: config.drupalUrl,
    port: config.port,
    ui: {
      port: config.port + 1,
    },
    files: [
      {
        match: [
          join(themeRoot, 'build/css/**/*.css'),
          join(themeRoot, 'build/js/**/*.js'),
          join(themeRoot, 'build/components/**/*.css'),
          join(themeRoot, 'build/components/**/*.js'),
          join(themeRoot, 'components/**/*.twig'),
          join(themeRoot, 'templates/**/*.twig'),
        ],
        fn: function (event, file) {
          if (file.endsWith('.css')) {
            bs.reload('*.css');
          } else {
            // Reload full page for Twig or JS changes
            bs.reload();
          }
        },
      },
    ],
    watchOptions: {
      ignoreInitial: true,
      ignored: ['node_modules/**', '.git/**'],
    },
    logLevel: 'info',
    logPrefix: 'Puzz',
    logConnections: true,
    notify: false,
    open: false,
    reloadOnRestart: true,
  });

  return bs;
}

/**
 * Main function.
 */
async function main() {
  console.log('🚀 Starting development server...\n');
  console.log(`📡 Proxying: ${config.drupalUrl}\n`);
  console.log(`🌐 BrowserSync UI: http://localhost:${config.port + 1}\n`);

  await buildComponents();
  const bs = initBrowserSync();

  const watcher = chokidar.watch(config.watchFiles, {
    cwd: themeRoot,
    ignoreInitial: true,
    ignored: [
      'node_modules/**',
      '.git/**',
      'build/**',
      '**/_breakpoints.scss', // Exclude auto-generated breakpoints file
      'src/scss/partials/_breakpoints.scss', // Explicit path exclusion
      '**/_env.scss', // Exclude auto-generated env file
      'src/scss/partials/_env.scss', // Explicit path exclusion
    ],
  });

  watcher.on('change', async (path) => {
    console.log(`\n📝 File changed: ${path}`);
    
    if (path.endsWith('.scss') || path.endsWith('.js')) {
      // Compile SCSS/JS and then reload
      try {
        await buildComponents();
      } catch (error) {
        console.error('Build error:', error);
      }
    } else if (path.endsWith('.twig')) {
      // Reload page when Twig templates change
      console.log('🔄 Reloading page due to Twig change...');
      bs.reload();
    } else {
      bs.reload();
    }
  });

  watcher.on('add', async (path) => {
    console.log(`\n➕ File added: ${path}`);
    if (path.endsWith('.scss') || path.endsWith('.js')) {
      // Compilar nuevo archivo SCSS/JS
      try {
        await buildComponents();
      } catch (error) {
        console.error('Build error:', error);
      }
    } else if (path.endsWith('.twig')) {
      // Reload when a new template is added
      console.log('🔄 Reloading page due to new Twig file...');
      bs.reload();
    }
  });

  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down...');
    watcher.close();
    bs.exit();
    process.exit(0);
  });

  console.log('👀 Watching for changes...\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
