#!/usr/bin/env node

/**
 * @file
 * Build script for Puzz theme.
 * Compiles SCSS files from src/ to build/ directory.
 */

import { readdir, stat, mkdir, readFile, writeFile } from 'fs/promises';
import { writeFileSync, readFileSync, chmodSync } from 'fs';
import { join, dirname, relative, dirname as pathDirname, normalize, resolve } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import * as sass from 'sass';
import fg from 'fast-glob';
import { tmpdir } from 'os';
import svgstore from 'svgstore';
import { optimize } from 'svgo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const themeRoot = join(__dirname, '..');
const srcDir = join(themeRoot, 'src');
const srcScssDir = join(srcDir, 'scss');
const srcJsDir = join(srcDir, 'js');
const componentsDir = join(themeRoot, 'components'); // Componentes SDC (fuentes y metadata)
const buildDir = join(themeRoot, 'build');
const buildCssDir = join(buildDir, 'css');
const buildJsDir = join(buildDir, 'js');
const buildComponentsDir = join(buildDir, 'components');
const srcIconsDir = join(srcDir, 'assets', 'icons');
const srcCustomIconsDir = join(srcIconsDir, 'custom');
const buildIconsDir = join(buildDir, 'assets', 'icons');

/**
 * Fix source map paths: convert absolute file:// paths to relative paths.
 * 
 * @param {object} sourceMap - The source map object from Sass
 * @param {string} cssFilePath - Path to the compiled CSS file
 * @param {string} srcScssDir - Path to the src/scss directory
 * @return {object} - Fixed source map with relative paths
 */
function fixSourceMapPaths(sourceMap, cssFilePath, srcScssDir) {
  if (!sourceMap || !sourceMap.sources || !Array.isArray(sourceMap.sources)) {
    return sourceMap;
  }
  
  const cssDir = dirname(cssFilePath);
  const fixedSources = sourceMap.sources.map((source, index) => {
    // Remove file:// protocol if present
    let cleanPath = source.replace(/^file:\/\//, '');
    
    // Skip tmp files - they're not useful for debugging
    if (cleanPath.includes('/tmp/')) {
      // If we have source content, use a descriptive name
      if (sourceMap.sourcesContent && sourceMap.sourcesContent[index]) {
        // Try to extract meaningful name from content or other sources
        const otherSources = sourceMap.sources.filter((s, i) => 
          i !== index && !s.includes('/tmp/') && s.includes(srcScssDir)
        );
        if (otherSources.length > 0) {
          // Use the first matching source as reference
          const refSource = otherSources[0].replace(/^file:\/\//, '');
          const relativePath = relative(cssDir, refSource);
          return normalize(relativePath).replace(/\\/g, '/');
        }
      }
      // Return a generic name for tmp files
      return 'source.scss';
    }
    
    // If it's an absolute path, convert to relative
    if (cleanPath.startsWith('/')) {
      // Check if it's in src/scss directory
      if (cleanPath.includes(srcScssDir)) {
        // Make it relative from CSS file to source file
        const relativePath = relative(cssDir, cleanPath);
        return normalize(relativePath).replace(/\\/g, '/');
      }
      
      // Fallback: try to make relative from theme root
      const themeRelative = relative(themeRoot, cleanPath);
      if (!themeRelative.startsWith('..')) {
        return normalize(themeRelative).replace(/\\/g, '/');
      }
    }
    
    // If already relative, normalize it
    if (!cleanPath.startsWith('/')) {
      return normalize(cleanPath).replace(/\\/g, '/');
    }
    
    // If can't convert, return as is without file://
    return cleanPath;
  });
  
  return {
    ...sourceMap,
    sources: fixedSources
  };
}

/**
 * Expand glob patterns in SCSS imports.
 */
async function expandGlobImports(scssContent, scssFile) {
  const scssDir = pathDirname(scssFile);
  const importRegex = /@import\s+['"]([^'"]+\*[^'"]*)['"];?/g;
  let expanded = scssContent;
  const matches = [];

  let match;
  const regex = new RegExp(importRegex.source, importRegex.flags);
  while ((match = regex.exec(scssContent)) !== null) {
    matches.push({ fullMatch: match[0], pattern: match[1], index: match.index });
  }

  for (let i = matches.length - 1; i >= 0; i--) {
    const { fullMatch, pattern } = matches[i];
    let searchPattern = join(scssDir, pattern);
    if (searchPattern.endsWith('*')) searchPattern = searchPattern.replace(/\*$/, '*.scss');
    else if (!searchPattern.endsWith('.scss')) searchPattern = join(searchPattern, '*.scss');

    try {
      const files = await fg(searchPattern, { onlyFiles: true, absolute: true });
      if (files.length) {
        files.sort();
        const imports = files
          .map(file => `@import '${relative(scssDir, file).replace(/\.scss$/, '').replace(/\\/g, '/')}'`)
          .join('\n');
        expanded = expanded.substring(0, matches[i].index) + imports + expanded.substring(matches[i].index + fullMatch.length);
      }
    } catch (error) {
      console.warn(`Warning: Could not expand glob pattern ${pattern}:`, error.message);
    }
  }

  return expanded;
}

/**
 * Copy global JS file to build directory.
 */
async function copyGlobalJS(silent = false) {
  const jsFile = join(srcDir, 'js', 'main.js');
  const buildJsFile = join(buildJsDir, 'main.js');

  try {
    const fs = await import('fs/promises');
    await fs.mkdir(buildJsDir, { recursive: true });
    await fs.copyFile(jsFile, buildJsFile);
    chmodSync(buildJsFile, 0o644);
    // if (!silent) console.log(`✓ Copied ... main.js`);
  } catch (error) {
    if (error.code !== 'ENOENT' && !silent) console.error(`✗ Error copying main.js:`, error.message);
  }
}

/**
 * Copy fonts from src/assets/fonts to build/assets/fonts.
 */
async function copyAssets(silent = false) {
  const srcAssetsDir = join(srcDir, 'assets');
  const buildAssetsDir = join(buildDir, 'assets');
  const srcFontsDir = join(srcAssetsDir, 'fonts');
  const buildFontsDir = join(buildAssetsDir, 'fonts');

  try {
    const fs = await import('fs/promises');
    try { await stat(srcFontsDir); } catch { return; }
    await fs.mkdir(buildAssetsDir, { recursive: true });
    await fs.cp(srcFontsDir, buildFontsDir, { recursive: true });
    const setPermissions = async dir => {
      chmodSync(dir, 0o755);
      const files = await fs.readdir(dir, { withFileTypes: true });
      for (const file of files) {
        const filePath = join(dir, file.name);
        if (file.isDirectory()) await setPermissions(filePath);
        else chmodSync(filePath, 0o644);
      }
    };
    await setPermissions(buildFontsDir);
    chmodSync(buildAssetsDir, 0o755);
    //if (!silent) console.log(`✓ Copied ... assets/fonts`);
  } catch (error) {
    if (error.code !== 'ENOENT' && !silent) console.error(`✗ Error copying assets:`, error.message);
  }
}

/**
 * Build global CSS with APPSETTING_DEV injected.
 */
async function buildGlobalCSS(silent = false, mode = 'dev') {
  const globalFiles = ['main'];
  const adminFile = 'admin';
  const fs = await import('fs/promises');
  const isDev = mode === 'dev';

  const sassOptions = {
    style: isDev ? 'expanded' : 'compressed',
    sourceMap: isDev,
    sourceMapIncludeSources: isDev, // Include source content in map so browser doesn't need to load SCSS files
    loadPaths: [resolve(srcScssDir), tmpdir()], // Add srcScssDir first (resolved to absolute path) for _env.scss and _breakpoints.scss, then tmpdir for temporary files
  };
  await fs.mkdir(buildCssDir, { recursive: true });

  let sourceMapsGenerated = 0;

  for (const file of globalFiles) {
    const scssFile = join(srcScssDir, `${file}.scss`);
    const cssFile = join(buildCssDir, `${file}.css`);
    try {
      await stat(scssFile);
      const scssContent = await readFile(scssFile, 'utf-8');
      const expandedScss = await expandGlobImports(scssContent, scssFile);
      
      const tmpFile = join(tmpdir(), `puzz-${file}-${Date.now()}.scss`);
      await writeFile(tmpFile, expandedScss, 'utf-8');

      const result = sass.compile(tmpFile, sassOptions);
      writeFileSync(cssFile, result.css);
      chmodSync(cssFile, 0o644);

      // Save source map if available (dev mode)
      if (result.sourceMap && isDev) {
        const sourceMapFile = `${file}.css.map`;
        const sourceMapPath = join(buildCssDir, sourceMapFile);
        
        // Fix source map paths: convert absolute file:// paths to relative paths
        const fixedSourceMap = fixSourceMapPaths(result.sourceMap, cssFile, srcScssDir);
        
        writeFileSync(sourceMapPath, JSON.stringify(fixedSourceMap), 'utf-8');
        chmodSync(sourceMapPath, 0o644);
        sourceMapsGenerated++;
        
        // Add source map comment to CSS
        const cssWithSourceMap = result.css + `\n/*# sourceMappingURL=${sourceMapFile} */\n`;
        writeFileSync(cssFile, cssWithSourceMap, 'utf-8');
      }

      execSync(`postcss "${cssFile}" --replace --config postcss.config.cjs`, { stdio: silent ? 'pipe' : 'inherit', cwd: themeRoot });
      try { await fs.unlink(tmpFile); } catch {}
      if (!silent) console.log(`✓ Built ... ${file}.css (${mode})${isDev && result.sourceMap ? ' + .map' : ''}`);
    } catch (error) {
      if (error.code !== 'ENOENT') { if (!silent) console.error(`✗ Error building ${file}.css:`, error.message); throw error; }
    }
  }

  // Build admin.css directly from partials/base/_admin.scss (no wrapper needed)
  const adminScssFile = join(srcScssDir, 'partials', 'base', `_${adminFile}.scss`);
  const adminCssFile = join(buildCssDir, `${adminFile}.css`);
  try {
    await stat(adminScssFile);
    const adminScssContent = await readFile(adminScssFile, 'utf-8');
    const expandedAdminScss = await expandGlobImports(adminScssContent, adminScssFile);
    
    const adminTmpFile = join(tmpdir(), `puzz-${adminFile}-${Date.now()}.scss`);
    await writeFile(adminTmpFile, expandedAdminScss, 'utf-8');

    const adminResult = sass.compile(adminTmpFile, sassOptions);
    writeFileSync(adminCssFile, adminResult.css);
    chmodSync(adminCssFile, 0o644);

    // Save source map if available (dev mode)
    if (adminResult.sourceMap && isDev) {
      const adminSourceMapFile = `${adminFile}.css.map`;
      const adminSourceMapPath = join(buildCssDir, adminSourceMapFile);
      
      // Fix source map paths: convert absolute file:// paths to relative paths
      const fixedAdminSourceMap = fixSourceMapPaths(adminResult.sourceMap, adminCssFile, srcScssDir);
      
      writeFileSync(adminSourceMapPath, JSON.stringify(fixedAdminSourceMap), 'utf-8');
      chmodSync(adminSourceMapPath, 0o644);
      sourceMapsGenerated++;
      
      // Add source map comment to CSS
      const adminCssWithSourceMap = adminResult.css + `\n/*# sourceMappingURL=${adminSourceMapFile} */\n`;
      writeFileSync(adminCssFile, adminCssWithSourceMap, 'utf-8');
    }

    execSync(`postcss "${adminCssFile}" --replace --config postcss.config.cjs`, { stdio: silent ? 'pipe' : 'inherit', cwd: themeRoot });
    try { await fs.unlink(adminTmpFile); } catch {}
    if (!silent) console.log(`✓ Built ... ${adminFile}.css (${mode})${isDev && adminResult.sourceMap ? ' + .map' : ''}`);
  } catch (error) {
    if (error.code !== 'ENOENT') { if (!silent) console.error(`✗ Error building ${adminFile}.css:`, error.message); }
  }

  return sourceMapsGenerated;
}

/**
 * Build component CSS with APPSETTING_DEV injected.
 */
async function buildComponentCSS(componentName, silent = false, mode = 'dev') {
  const scssFile = join(componentsDir, componentName, `${componentName}.scss`);
  const componentBuildDir = join(buildComponentsDir, componentName);
  const cssFile = join(componentBuildDir, `${componentName}.css`);

  try {
    await stat(scssFile);
    const fs = await import('fs/promises');
    await fs.mkdir(componentBuildDir, { recursive: true });

    const isDev = mode === 'dev';

    const scssContent = await readFile(scssFile, 'utf-8');
    const expandedScss = await expandGlobImports(scssContent, scssFile);
    
    const sassOptions = {
      style: isDev ? 'expanded' : 'compressed',
      sourceMap: isDev,
      sourceMapIncludeSources: isDev, // Include source content in map so browser doesn't need to load SCSS files
      loadPaths: [tmpdir(), join(componentsDir, componentName), resolve(join(srcScssDir, 'partials')), resolve(srcScssDir)], // Add tmpdir, component dir, partials for _env.scss and _breakpoints.scss, then srcScssDir
    };
    const tmpFile = join(tmpdir(), `puzz-${componentName}-${Date.now()}.scss`);
    await writeFile(tmpFile, expandedScss, 'utf-8');

    const result = sass.compile(tmpFile, sassOptions);
    writeFileSync(cssFile, result.css);
    chmodSync(cssFile, 0o644);

    let sourceMapGenerated = false;

    // Save source map if available (dev mode)
    if (result.sourceMap && isDev) {
      const sourceMapFile = `${componentName}.css.map`;
      const sourceMapPath = join(componentBuildDir, sourceMapFile);
      writeFileSync(sourceMapPath, JSON.stringify(result.sourceMap), 'utf-8');
      chmodSync(sourceMapPath, 0o644);
      sourceMapGenerated = true;
      
      // Add source map comment to CSS
      const cssWithSourceMap = result.css + `\n/*# sourceMappingURL=${sourceMapFile} */\n`;
      writeFileSync(cssFile, cssWithSourceMap, 'utf-8');
    }

    execSync(`postcss "${cssFile}" --replace --config postcss.config.cjs`, { stdio: silent ? 'pipe' : 'inherit', cwd: themeRoot });
    try { await fs.unlink(tmpFile); } catch {}
    if (!silent) console.log(`✓ Built ... components/${componentName}/${componentName}.css (${mode})${sourceMapGenerated ? ' + .map' : ''}`);
    
    return sourceMapGenerated ? 1 : 0;
  } catch (error) {
    if (error.code !== 'ENOENT') { const errorMsg = `Error building ${componentName}: ${error.message}`; if (silent) throw new Error(errorMsg); console.error(`✗ ${errorMsg}`); throw error; }
    return 0;
  }
}

/**
 * Copy component JS
 */
async function copyComponentJS(componentPath, silent = false) {
  const componentName = componentPath.split('/').pop();
  const jsFile = join(componentsDir, componentPath, `${componentName}.js`);
  const componentBuildDir = join(buildComponentsDir, componentPath);
  const buildJsFile = join(componentBuildDir, `${componentName}.js`);

  try {
    const fs = await import('fs/promises');
    await fs.mkdir(componentBuildDir, { recursive: true });
    await fs.copyFile(jsFile, buildJsFile);
    chmodSync(buildJsFile, 0o644);
    // if (!silent) console.log(`✓ Copied ... components/${componentName}/${componentName}.js`);
  } catch (error) { if (error.code !== 'ENOENT') console.error(`✗ Error copying ${componentName}.js:`, error.message); }
}

/**
 * Generate _env.scss with environment variable.
 */
async function generateEnv(silent = false, mode = 'dev') {
  const isDev = mode === 'dev';
  // Default to false unless explicitly set to true
  // Only set to true if APPSETTING_DEV is explicitly 'true' or '1'
  const appSettingDev = process.env.APPSETTING_DEV !== undefined
    ? process.env.APPSETTING_DEV === 'true' || process.env.APPSETTING_DEV === '1'
    : false; // Default to false instead of isDev
  
  const envScssPath = join(srcScssDir, 'partials', '_env.scss');
  const scssContent = `/**
 * @file
 * Environment variables generated by build script.
 * Do not edit this file directly. It is regenerated on each build.
 */

$APPSETTING_DEV: ${appSettingDev};
`;

  await writeFile(envScssPath, scssContent, 'utf-8');
  
  if (!silent) {
    console.log(`✓ Generated _env.scss (APPSETTING_DEV: ${appSettingDev})`);
  }
  
  return envScssPath;
}

/**
 * Generate _breakpoints.scss from puzz.breakpoints.yml
 */
async function generateBreakpoints(silent = false) {
  const breakpointsYmlPath = join(themeRoot, 'puzz.breakpoints.yml');
  const breakpointsScssPath = join(srcScssDir, 'partials', '_breakpoints.scss');

  try {
    // Read puzz.breakpoints.yml
    const ymlContent = await readFile(breakpointsYmlPath, 'utf-8');
    
    // Parse YAML manually (simple parser for this specific format)
    const breakpoints = {};
    const lines = ymlContent.split('\n');
    let currentKey = null;
    let currentData = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Match breakpoint key: "default.xs:", "default.sm:", etc.
      const keyMatch = line.match(/^default\.(\w+):$/);
      if (keyMatch) {
        if (currentKey) {
          breakpoints[currentKey] = currentData;
        }
        currentKey = keyMatch[1];
        currentData = {};
        continue;
      }
      
      // Match key-value pairs
      const kvMatch = line.match(/^(\w+):\s*(.+)$/);
      if (kvMatch && currentKey) {
        const [, key, value] = kvMatch;
        // Remove quotes from value if present
        currentData[key] = value.replace(/^['"]|['"]$/g, '');
      }
    }
    
    // Add last breakpoint
    if (currentKey) {
      breakpoints[currentKey] = currentData;
    }
    
    // Extract min-width from mediaQuery
    const breakpointKeys = Object.keys(breakpoints).sort((a, b) => {
      const order = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
      return order.indexOf(a) - order.indexOf(b);
    });
    
    // Generate _breakpoints.scss
    let scssContent = '/**\n * @file\n * Breakpoints generated from puzz.breakpoints.yml\n * Do not edit this file directly. Edit puzz.breakpoints.yml instead.\n */\n\n';
    
    const breakpointValues = [];
    
    for (const key of breakpointKeys) {
      const bp = breakpoints[key];
      const mediaQuery = bp.mediaQuery || '';
      
      // Extract min-width from media query
      // Format: "(min-width: 576px)" or "(min-width: 576px) and (max-width: 767px)"
      let minWidth = '0';
      const minWidthMatch = mediaQuery.match(/min-width:\s*(\d+)px/);
      if (minWidthMatch) {
        minWidth = minWidthMatch[1];
      } else {
        // XS breakpoint: check for max-width only
        const maxWidthMatch = mediaQuery.match(/max-width:\s*(\d+)px/);
        if (maxWidthMatch) {
          minWidth = '0';
        }
      }
      
      const value = minWidth === '0' ? '0' : `${minWidth}px`;
      scssContent += `$breakpoint-${key}: ${value};\n`;
      breakpointValues.push(`  '${key}': $breakpoint-${key}`);
    }
    
    scssContent += '\n$breakpoints: (\n';
    scssContent += breakpointValues.join(',\n');
    scssContent += '\n);\n';
    
    await writeFile(breakpointsScssPath, scssContent, 'utf-8');
    
    // Note: breakpoints.json is no longer needed - PHP reads YAML directly via puzz_get_breakpoints()
    
    if (!silent) {
      console.log(`✓ Generated _breakpoints.scss from puzz.breakpoints.yml`);
    }
    
    return breakpointsScssPath;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      if (!silent) console.error(`✗ Error generating breakpoints:`, error.message);
      throw error;
    }
    return null;
  }
}

/**
 * Build SVG sprite from Tabler icons + custom icons.
 *
 * Naming convention:
 * - Tabler icons: icon-{name}
 * - Custom icons: icon-custom-{name}
 */
async function buildIconSprite(silent = false) {
  const tablerOutlinePattern = join(themeRoot, 'node_modules', '@tabler', 'icons', 'icons', 'outline', '*.svg').replace(/\\/g, '/');
  const customIconsPattern = join(srcCustomIconsDir, '*.svg').replace(/\\/g, '/');
  const tablerFiles = await fg(tablerOutlinePattern, { onlyFiles: true, absolute: true });
  const customFiles = await fg(customIconsPattern, { onlyFiles: true, absolute: true });
  const iconSettingsPath = join(themeRoot, '..', '..', '..', 'sites', 'default', 'files', 'puzz.icons.json');
  let includeAll = true;
  let selectedIcons = new Set();

  try {
    const payload = JSON.parse(readFileSync(iconSettingsPath, 'utf-8'));
    includeAll = !!payload.include_all;
    if (Array.isArray(payload.selected)) {
      selectedIcons = new Set(
        payload.selected
          .map(name => String(name).replace(/^icon-/, '').trim().toLowerCase())
          .filter(Boolean)
      );
    }
  } catch (error) {
    // No selection file yet: default behavior is include all.
  }

  if (!tablerFiles.length && !customFiles.length) {
    if (!silent) console.warn('⚠ No SVG icons found for sprite generation.');
    return;
  }

  await mkdir(buildIconsDir, { recursive: true });
  const sprite = svgstore({ inline: true });
  const previewSprite = svgstore({ inline: true });
  let added = 0;
  let previewAdded = 0;

  const sanitizeName = name => name
    .toLowerCase()
    .replace(/^icon-/, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

  const extractSvgInner = (svgRaw, filePath) => {
    const optimized = optimize(svgRaw, {
      path: filePath,
      multipass: true,
      plugins: [
        'removeXMLNS',
        'removeDimensions',
      ],
    });

    if (optimized.error) {
      throw new Error(`SVGO error in ${filePath}: ${optimized.error}`);
    }

    const svg = optimized.data;
    const viewBoxMatch = svg.match(/viewBox="([^"]+)"/i);
    const innerMatch = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    if (!innerMatch) {
      throw new Error(`Invalid SVG format: ${filePath}`);
    }
    return {
      viewBox: viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24',
      inner: innerMatch[1],
    };
  };

  for (const filePath of tablerFiles) {
    const baseName = sanitizeName(pathDirname(filePath) ? filePath.split('/').pop().replace(/\.svg$/i, '') : '');
    if (!baseName) continue;
    const symbolId = `icon-${baseName}`;
    try {
      const svgRaw = await readFile(filePath, 'utf-8');
      const { viewBox, inner } = extractSvgInner(svgRaw, filePath);
      const tablerSymbol = `<svg viewBox="${viewBox}"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
      previewSprite.add(symbolId, tablerSymbol);
      previewAdded++;
      if (!includeAll && !selectedIcons.has(baseName)) {
        continue;
      }
      sprite.add(symbolId, tablerSymbol);
      added++;
    } catch (error) {
      if (!silent) console.warn(`⚠ Skipped invalid icon ${filePath}: ${error.message}`);
    }
  }

  for (const filePath of customFiles) {
    const fileName = sanitizeName(filePath.split('/').pop().replace(/\.svg$/i, ''));
    if (!fileName) continue;
    const customName = fileName.startsWith('custom-') ? fileName : `custom-${fileName}`;
    const symbolId = `icon-${customName}`;
    try {
      const svgRaw = await readFile(filePath, 'utf-8');
      const { viewBox, inner } = extractSvgInner(svgRaw, filePath);
      previewSprite.add(symbolId, `<svg viewBox="${viewBox}">${inner}</svg>`);
      previewAdded++;
      // Custom icons are included in frontend sprite only when selected.
      if (selectedIcons.has(customName)) {
        sprite.add(symbolId, `<svg viewBox="${viewBox}">${inner}</svg>`);
        added++;
      }
    } catch (error) {
      if (!silent) console.warn(`⚠ Skipped invalid custom icon ${filePath}: ${error.message}`);
    }
  }

  if (!previewAdded) {
    if (!silent) console.warn('⚠ Icon preview sprite not generated: no valid SVG icons.');
    return;
  }

  const previewSpriteContent = previewSprite.toString({ inline: true });
  const previewSpriteFile = join(buildIconsDir, 'admin-preview-sprite.svg');
  writeFileSync(previewSpriteFile, previewSpriteContent, 'utf-8');
  chmodSync(previewSpriteFile, 0o644);

  if (!added) {
    if (!silent) console.warn('⚠ Icon sprite not generated: no selected icons.');
    return;
  }

  const spriteContent = sprite.toString({ inline: true });
  const spriteFile = join(buildIconsDir, 'sprite.svg');
  writeFileSync(spriteFile, spriteContent, 'utf-8');
  chmodSync(spriteFile, 0o644);
  chmodSync(buildIconsDir, 0o755);
  if (!silent) {
    const modeLabel = includeAll ? 'all tabler icons' : `selected tabler icons (${selectedIcons.size})`;
    console.log(`✓ Built ... assets/icons/admin-preview-sprite.svg (${previewAdded} icons)`);
    console.log(`✓ Built ... assets/icons/sprite.svg (${added} icons, ${modeLabel})`);
  }
}

/**
 * Get all component directories
 */
async function getComponents() {
  const components = [];
  const entries = await readdir(componentsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      const fullPath = join(componentsDir, entry.name);
      const componentYml = join(fullPath, `${entry.name}.component.yml`);
      try { await stat(componentYml); components.push(entry.name); } catch {}
    }
  }
  return components;
}

/**
 * Main build function
 */
async function build(silent = false, mode = 'dev') {
  const isDev = mode === 'dev';
  const modeLabel = isDev ? 'dev' : 'prod';
  if (mode !== 'dev' && mode !== 'prod') throw new Error(`Invalid build mode: ${mode}. Use 'dev' or 'prod'.`);

  try {
    await mkdir(buildDir, { recursive: true });
    await mkdir(buildComponentsDir, { recursive: true });
    if (!silent) console.log(`Building in ${modeLabel} mode...\n`);

    // Generate environment and breakpoints files first
    await generateEnv(silent, mode);
    await generateBreakpoints(silent);

    let totalSourceMaps = 0;
    
    totalSourceMaps += await buildGlobalCSS(silent, mode);
    await copyGlobalJS(silent);
    await copyAssets(silent);
    await buildIconSprite(silent);

    const components = await getComponents();
    for (const component of components) {
      totalSourceMaps += await buildComponentCSS(component, silent, mode);
      await copyComponentJS(component, silent);
    }

    console.log(`\n✓ APPSETTING_DEV: ${process.env.APPSETTING_DEV}\n`);

    if (!silent) {
      console.log(`✅ Build complete (${modeLabel})!`);
      if (isDev) {
        if (totalSourceMaps > 0) {
          console.log(`✅ Source maps (.map) generated: ${totalSourceMaps} file(s)`);
        } else {
          console.log(`⚠️ No source maps (.map) generated (expected in dev mode)`);
        }
      } else {
        console.log(`✅ Source maps disabled in production mode`);
      }
    }
  } catch (error) {
    if (!silent) console.error('✗ Build failed:', error.message);
    throw error;
  }
}

// Run build if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('build.js');
if (isMainModule) {
  const mode = process.argv[2] === 'prod' ? 'prod' : 'dev';
  build(false, mode).catch(() => process.exit(1));
}

// ✅ Export build for ESM
export { build };
