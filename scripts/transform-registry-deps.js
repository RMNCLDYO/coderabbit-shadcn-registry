#!/usr/bin/env node

/**
 * Transform registryDependencies to use full URLs for custom items
 *
 * Run this AFTER `shadcn build` to convert coderabbit-* dependencies
 * to full GitHub raw URLs so they can be resolved by the CLI.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'public/r';
const REGISTRY_BASE_URL =
  'https://raw.githubusercontent.com/RMNCLDYO/coderabbit-shadcn-registry/main/public/r';

console.log('🔗 Transforming registryDependencies to full URLs...\n');

/**
 * Transform registryDependencies to use full URLs for custom items
 */
function transformDeps(deps) {
  if (!deps || !Array.isArray(deps)) return deps;
  return deps.map((dep) => {
    // Skip if already a URL
    if (dep.startsWith('http://') || dep.startsWith('https://')) {
      return dep;
    }
    // Transform coderabbit-* items to full URLs
    if (dep.startsWith('coderabbit-')) {
      return `${REGISTRY_BASE_URL}/${dep}.json`;
    }
    return dep;
  });
}

/**
 * Process a single JSON file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    let modified = false;

    // Transform registryDependencies
    if (data.registryDependencies) {
      const transformed = transformDeps(data.registryDependencies);
      if (JSON.stringify(transformed) !== JSON.stringify(data.registryDependencies)) {
        data.registryDependencies = transformed;
        modified = true;
      }
    }

    // Transform items array (for registry.json files)
    if (data.items && Array.isArray(data.items)) {
      data.items = data.items.map((item) => {
        if (item.registryDependencies) {
          const transformed = transformDeps(item.registryDependencies);
          if (JSON.stringify(transformed) !== JSON.stringify(item.registryDependencies)) {
            modified = true;
            return { ...item, registryDependencies: transformed };
          }
        }
        return item;
      });
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Recursively find all JSON files
 */
function findJsonFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip the registry source directory
      if (entry.name !== 'registry') {
        files.push(...findJsonFiles(fullPath));
      }
    } else if (entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main
const jsonFiles = findJsonFiles(OUTPUT_DIR);
let transformedCount = 0;

for (const file of jsonFiles) {
  if (processFile(file)) {
    console.log(`✅ ${path.relative(OUTPUT_DIR, file)}`);
    transformedCount++;
  }
}

console.log();
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✨ Transformed ${transformedCount} files`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
