#!/usr/bin/env node

/**
 * Build flat registry compatible with shadcn registry index
 *
 * This script generates registry item files WITHOUT content property,
 * and copies source files to be served at their paths.
 *
 * Required for registry index submission per:
 * https://ui.shadcn.com/docs/registry/registry-index
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_FILE = 'registry.json';
const OUTPUT_DIR = 'public/r';
const SOURCE_DIR = 'registry';
const REGISTRY_BASE_URL =
  'https://raw.githubusercontent.com/RMNCLDYO/coderabbit-shadcn-registry/main/public/r';

console.log('🚀 Building flat registry (registry index compatible)...\n');

/**
 * Transform registryDependencies to use full URLs for custom items
 * shadcn/ui items (button, input, etc.) stay as names
 * coderabbit-* items get full URLs
 */
function transformRegistryDependencies(deps) {
  if (!deps || !Array.isArray(deps)) return deps;
  return deps.map((dep) => {
    if (dep.startsWith('coderabbit-')) {
      return `${REGISTRY_BASE_URL}/${dep}.json`;
    }
    return dep;
  });
}

/**
 * Read and parse registry.json
 */
function readRegistryConfig() {
  try {
    const content = fs.readFileSync(REGISTRY_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to read registry.json:', error.message);
    process.exit(1);
  }
}

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Copy file from source to destination
 */
function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

/**
 * Generate registry item JSON without content property
 * and with transformed registryDependencies
 */
function generateItemJSON(item) {
  // Create a clean copy of the item
  const cleanItem = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    ...item,
  };

  // Transform registryDependencies to full URLs for custom items
  if (cleanItem.registryDependencies) {
    cleanItem.registryDependencies = transformRegistryDependencies(
      cleanItem.registryDependencies
    );
  }

  // If files exist, remove content property from each file
  if (cleanItem.files && Array.isArray(cleanItem.files)) {
    cleanItem.files = cleanItem.files.map((file) => {
      const { content, ...fileWithoutContent } = file;
      return fileWithoutContent;
    });
  }

  return cleanItem;
}

/**
 * Copy source files to output directory
 */
function copySourceFiles(item) {
  if (!item.files || !Array.isArray(item.files)) {
    return;
  }

  let copiedCount = 0;

  for (const file of item.files) {
    const sourcePath = file.path;
    const destPath = path.join(OUTPUT_DIR, file.path);

    if (fs.existsSync(sourcePath)) {
      copyFile(sourcePath, destPath);
      copiedCount++;
    } else {
      console.warn(`⚠️  Warning: Source file not found: ${sourcePath}`);
    }
  }

  return copiedCount;
}

/**
 * Build flat registry
 */
function buildFlatRegistry() {
  const registry = readRegistryConfig();

  if (!registry.items || !Array.isArray(registry.items)) {
    console.error('❌ No items found in registry.json');
    process.exit(1);
  }

  // Ensure output directory exists
  ensureDir(OUTPUT_DIR);

  console.log(`📦 Processing ${registry.items.length} registry items...\n`);

  let totalFiles = 0;
  const itemStats = [];

  // Process each registry item
  for (const item of registry.items) {
    if (!item.name) {
      console.warn('⚠️  Warning: Item missing name, skipping');
      continue;
    }

    // Generate item JSON without content
    const itemJSON = generateItemJSON(item);
    const itemFilePath = path.join(OUTPUT_DIR, `${item.name}.json`);

    // Write item JSON file
    fs.writeFileSync(
      itemFilePath,
      JSON.stringify(itemJSON, null, 2),
      'utf-8'
    );

    // Copy source files
    const filesCopied = copySourceFiles(item);
    totalFiles += filesCopied || 0;

    itemStats.push({
      name: item.name,
      type: item.type,
      files: filesCopied || 0,
    });

    console.log(`✅ ${item.name}`);
    console.log(`   Type: ${item.type}`);
    if (filesCopied) {
      console.log(`   Files: ${filesCopied} copied`);
    }
    console.log();
  }

  // Generate main registry.json in output directory with transformed deps
  const transformedRegistry = {
    ...registry,
    items: registry.items.map((item) => ({
      ...item,
      registryDependencies: transformRegistryDependencies(
        item.registryDependencies
      ),
    })),
  };
  const mainRegistryPath = path.join(OUTPUT_DIR, 'registry.json');
  fs.writeFileSync(
    mainRegistryPath,
    JSON.stringify(transformedRegistry, null, 2),
    'utf-8'
  );

  // Print summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ Build Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📋 Registry items: ${itemStats.length}`);
  console.log(`📄 Source files copied: ${totalFiles}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log();
  console.log('📊 Items by Type:');
  const typeGroups = itemStats.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  Object.entries(typeGroups).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });
  console.log();
  console.log('✅ Flat registry built successfully!');
  console.log();
  console.log('🎯 Registry Index Compatible:');
  console.log('   ✓ No content property in files');
  console.log('   ✓ Source files served at paths');
  console.log('   ✓ Flat structure maintained');
  console.log();
  console.log('📦 Test installation:');
  console.log('   npx shadcn@latest add http://localhost:3001/r/coderabbit-types.json');
  console.log();
}

// Run the build
try {
  buildFlatRegistry();
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
