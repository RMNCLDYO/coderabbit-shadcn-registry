#!/usr/bin/env node

/**
 * Build backend-specific bundle registries
 *
 * Generates complete bundle files for each backend (localstorage, convex, etc.)
 * These bundles use registryDependencies to pull in all required components
 * without embedding content (registry index compatible).
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'public/r';
const BUNDLES_DIR = 'registry/bundles';
const REGISTRY_BASE_URL =
  'https://raw.githubusercontent.com/RMNCLDYO/coderabbit-shadcn-registry/main/public/r';

console.log('📦 Building backend bundle registries...\n');

/**
 * Transform registryDependencies to use full URLs for custom items
 * shadcn/ui items (button, input, etc.) stay as names
 * coderabbit-* items get full URLs
 */
function transformRegistryDependencies(deps) {
  return deps.map((dep) => {
    if (dep.startsWith('coderabbit-')) {
      return `${REGISTRY_BASE_URL}/${dep}.json`;
    }
    return dep;
  });
}

/**
 * Bundle configurations for each backend
 */
const BUNDLES = {
  localstorage: {
    name: 'coderabbit',
    type: 'registry:block',
    title: 'CodeRabbit with LocalStorage',
    author: 'Ray <hi@rmncldyo.com>',
    description:
      'Complete CodeRabbit integration with browser localStorage persistence. Includes types, API client, storage adapter, React hook, form component, and branding. Perfect for browser-based applications, prototyping, and testing. Reports persist across page reloads.',
    dependencies: ['react', 'lucide-react'],
    registryDependencies: [
      'button',
      'input',
      'label',
      'select',
      'textarea',
      'coderabbit-types',
      'coderabbit-client',
      'coderabbit-storage-adapter',
      'coderabbit-storage-localstorage',
      'coderabbit-react',
      'coderabbit-form',
      'coderabbit-branding',
    ],
    envVars: {
      CODERABBIT_API_KEY: '',
    },
    meta: {
      source: 'https://github.com/RMNCLDYO/coderabbit-shadcn-registry',
      license: 'MIT',
      backend: 'localStorage',
    },
    docs: 'Get CODERABBIT_API_KEY from https://app.coderabbit.ai/settings/api-keys (requires Pro plan). No database setup required. Data persists in browser localStorage across page reloads (~5-10MB limit). Perfect for prototyping and client-side apps. Use LocalStorageAdapter in your useCodeRabbit hook.',
    categories: ['complete', 'browser', 'developer-tools'],
  },
  convex: {
    name: 'coderabbit',
    type: 'registry:block',
    title: 'CodeRabbit with Convex',
    author: 'Ray <hi@rmncldyo.com>',
    description:
      'Complete CodeRabbit integration with Convex real-time database. Includes types, API client, storage adapter, schema, React hook, form component, and branding. Perfect for production applications with real-time sync and auth support.',
    dependencies: ['react', 'lucide-react', 'convex'],
    registryDependencies: [
      'button',
      'input',
      'label',
      'select',
      'textarea',
      'coderabbit-types',
      'coderabbit-client',
      'coderabbit-storage-adapter',
      'coderabbit-storage-convex',
      'coderabbit-react',
      'coderabbit-form',
      'coderabbit-branding',
    ],
    envVars: {
      CODERABBIT_API_KEY: '',
      CONVEX_DEPLOYMENT: '',
      CONVEX_URL: '',
      CONVEX_SITE_URL: '',
    },
    meta: {
      source: 'https://github.com/RMNCLDYO/coderabbit-shadcn-registry',
      license: 'MIT',
      backend: 'Convex',
    },
    docs: 'Get CODERABBIT_API_KEY from https://app.coderabbit.ai/settings/api-keys (requires Pro plan). Run "npx convex dev" to automatically populate CONVEX_DEPLOYMENT and CONVEX_URL in your .env.local. CONVEX_SITE_URL is optional (only needed for HTTP actions). Import coderabbitReportsTable in your convex/schema.ts and add as "coderabbit_reports" table.',
    categories: ['complete', 'database', 'real-time', 'developer-tools'],
  },
  supabase: {
    name: 'coderabbit',
    type: 'registry:block',
    title: 'CodeRabbit with Supabase',
    author: 'Ray <hi@rmncldyo.com>',
    description:
      'Complete CodeRabbit integration with Supabase (PostgreSQL). Includes types, API client, storage adapter with Row Level Security, React hook, form component, and branding. Perfect for apps with authentication and real-time features.',
    dependencies: ['react', 'lucide-react', '@supabase/supabase-js'],
    registryDependencies: [
      'button',
      'input',
      'label',
      'select',
      'textarea',
      'coderabbit-types',
      'coderabbit-client',
      'coderabbit-storage-adapter',
      'coderabbit-storage-supabase',
      'coderabbit-react',
      'coderabbit-form',
      'coderabbit-branding',
    ],
    envVars: {
      CODERABBIT_API_KEY: '',
      SUPABASE_URL: '',
      SUPABASE_ANON_KEY: '',
    },
    meta: {
      source: 'https://github.com/RMNCLDYO/coderabbit-shadcn-registry',
      license: 'MIT',
      backend: 'Supabase',
    },
    docs: 'Get CODERABBIT_API_KEY from https://app.coderabbit.ai/settings/api-keys (requires Pro plan). Get SUPABASE_URL and SUPABASE_ANON_KEY from your Supabase dashboard: Project Settings → API. Or run "npx supabase init && npx supabase start" for local development. Run the SQL schema from storage-supabase.ts to create the coderabbit_reports table with RLS policies.',
    categories: ['complete', 'database', 'developer-tools'],
  },
  postgres: {
    name: 'coderabbit',
    type: 'registry:block',
    title: 'CodeRabbit with PostgreSQL',
    author: 'Ray <hi@rmncldyo.com>',
    description:
      'Complete CodeRabbit integration with PostgreSQL. Includes types, API client, storage adapter with connection pooling, React hook, form component, and branding. Works with Neon, Vercel Postgres, Railway, AWS RDS, Google Cloud SQL, etc.',
    dependencies: ['react', 'lucide-react', 'pg'],
    devDependencies: ['@types/pg'],
    registryDependencies: [
      'button',
      'input',
      'label',
      'select',
      'textarea',
      'coderabbit-types',
      'coderabbit-client',
      'coderabbit-storage-adapter',
      'coderabbit-storage-postgres',
      'coderabbit-react',
      'coderabbit-form',
      'coderabbit-branding',
    ],
    envVars: {
      CODERABBIT_API_KEY: '',
      POSTGRES_HOST: '',
      POSTGRES_PORT: '5432',
      POSTGRES_DATABASE: '',
      POSTGRES_USER: '',
      POSTGRES_PASSWORD: '',
    },
    meta: {
      source: 'https://github.com/RMNCLDYO/coderabbit-shadcn-registry',
      license: 'MIT',
      backend: 'PostgreSQL',
    },
    docs: 'Get CODERABBIT_API_KEY from https://app.coderabbit.ai/settings/api-keys (requires Pro plan). Get connection details from your provider dashboard (Neon, Vercel Postgres, Railway, AWS RDS). For local dev: "docker run -e POSTGRES_PASSWORD=password -p 5432:5432 postgres". Run the SQL schema from storage-postgres.ts to create the coderabbit_reports table.',
    categories: ['complete', 'database', 'developer-tools'],
  },
  mysql: {
    name: 'coderabbit',
    type: 'registry:block',
    title: 'CodeRabbit with MySQL',
    author: 'Ray <hi@rmncldyo.com>',
    description:
      'Complete CodeRabbit integration with MySQL/MariaDB. Includes types, API client, storage adapter with connection pooling, React hook, form component, and branding. Works with PlanetScale, AWS RDS, Google Cloud SQL, Azure, etc.',
    dependencies: ['react', 'lucide-react', 'mysql2'],
    devDependencies: ['@types/mysql2'],
    registryDependencies: [
      'button',
      'input',
      'label',
      'select',
      'textarea',
      'coderabbit-types',
      'coderabbit-client',
      'coderabbit-storage-adapter',
      'coderabbit-storage-mysql',
      'coderabbit-react',
      'coderabbit-form',
      'coderabbit-branding',
    ],
    envVars: {
      CODERABBIT_API_KEY: '',
      MYSQL_HOST: '',
      MYSQL_PORT: '3306',
      MYSQL_DATABASE: '',
      MYSQL_USER: '',
      MYSQL_PASSWORD: '',
    },
    meta: {
      source: 'https://github.com/RMNCLDYO/coderabbit-shadcn-registry',
      license: 'MIT',
      backend: 'MySQL',
    },
    docs: 'Get CODERABBIT_API_KEY from https://app.coderabbit.ai/settings/api-keys (requires Pro plan). Get connection details from your provider dashboard (PlanetScale, AWS RDS, Google Cloud SQL). For local dev: "docker run -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 mysql". Run the SQL schema from storage-mysql.ts to create the coderabbit_reports table.',
    categories: ['complete', 'database', 'developer-tools'],
  },
};

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Generate bundle JSON file with transformed registryDependencies
 */
function generateBundleJSON(bundleConfig) {
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    ...bundleConfig,
    registryDependencies: transformRegistryDependencies(
      bundleConfig.registryDependencies
    ),
  };
}

/**
 * Create bundle registry.json for each backend
 */
function createBundleRegistry(backend, items) {
  const transformedItems = items.map((item) => ({
    ...item,
    registryDependencies: transformRegistryDependencies(
      item.registryDependencies
    ),
  }));

  const registry = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'coderabbit',
    homepage: 'https://github.com/RMNCLDYO/coderabbit-shadcn-registry',
    items: transformedItems,
  };

  return registry;
}

/**
 * Build all bundles
 */
function buildBundles() {
  const backends = Object.keys(BUNDLES);

  console.log(`Processing ${backends.length} backend bundles...\n`);

  for (const backend of backends) {
    const bundleConfig = BUNDLES[backend];
    const bundleDir = path.join(OUTPUT_DIR, backend);

    // Ensure bundle directory exists
    ensureDir(bundleDir);

    // Generate coderabbit.json (the main bundle file)
    const bundleJSON = generateBundleJSON(bundleConfig);
    const bundleFilePath = path.join(bundleDir, 'coderabbit.json');

    fs.writeFileSync(
      bundleFilePath,
      JSON.stringify(bundleJSON, null, 2),
      'utf-8'
    );

    // Generate registry.json for this backend
    const registryJSON = createBundleRegistry(backend, [bundleConfig]);
    const registryFilePath = path.join(bundleDir, 'registry.json');

    fs.writeFileSync(
      registryFilePath,
      JSON.stringify(registryJSON, null, 2),
      'utf-8'
    );

    console.log(`✅ ${backend}`);
    console.log(`   ${bundleConfig.title}`);
    console.log(`   Backend: ${bundleConfig.meta.backend}`);
    console.log(
      `   Dependencies: ${bundleConfig.registryDependencies.length} registry items`
    );
    console.log();
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ Bundle Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📦 Bundles created: ${backends.length}`);
  console.log(`📁 Output: ${OUTPUT_DIR}/<backend>/coderabbit.json`);
  console.log();
  console.log('✅ Backend bundles built successfully!');
  console.log();
  console.log('📦 Installation URLs:');
  backends.forEach((backend) => {
    console.log(
      `   ${backend}: .../public/r/${backend}/coderabbit.json`
    );
  });
  console.log();
}

// Run the build
try {
  buildBundles();
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
