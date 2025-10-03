#!/usr/bin/env node

/**
 * Copy Lua filters to dist directory
 * This script is run during the build process to ensure filters are available
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyFilters() {
  const rootDir = join(__dirname, '..');
  const srcFiltersDir = join(rootDir, 'src', 'filters');
  const distFiltersDir = join(rootDir, 'dist', 'filters');

  try {
    // Create dist/filters directory if it doesn't exist
    await fs.mkdir(distFiltersDir, { recursive: true });

    // Read all files from src/filters
    const files = await fs.readdir(srcFiltersDir);

    // Copy each .lua file
    let copiedCount = 0;
    for (const file of files) {
      if (file.endsWith('.lua')) {
        const srcPath = join(srcFiltersDir, file);
        const distPath = join(distFiltersDir, file);

        await fs.copyFile(srcPath, distPath);
        console.log(`✓ Copied ${file} to dist/filters/`);
        copiedCount++;
      }
    }

    if (copiedCount > 0) {
      console.log(`\n✅ Successfully copied ${copiedCount} filter(s) to dist/filters/`);
    } else {
      console.log('⚠️  No .lua filter files found to copy');
    }
  } catch (error) {
    console.error('❌ Error copying filters:', error.message);
    process.exit(1);
  }
}

copyFilters();
