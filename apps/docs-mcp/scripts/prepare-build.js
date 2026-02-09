#!/usr/bin/env node
import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_DIR = join(__dirname, '..');
const WORKSPACE_ROOT = join(PROJECT_DIR, '../..');
const CONTENT_DIR = join(PROJECT_DIR, 'content');
const DOCS_SOURCE = join(WORKSPACE_ROOT, 'apps/docs-app/content/docs');

console.log('📦 Preparing docs-mcp for containerized build...');
console.log('📂 Project directory:', PROJECT_DIR);
console.log('📂 Workspace root:', WORKSPACE_ROOT);

async function copyDirectory(src, dest) {
  let fileCount = 0;
  
  async function copyRecursive(srcPath, destPath) {
    const entries = await readdir(srcPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcEntry = join(srcPath, entry.name);
      const destEntry = join(destPath, entry.name);
      
      if (entry.isDirectory()) {
        await mkdir(destEntry, { recursive: true });
        await copyRecursive(srcEntry, destEntry);
      } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
        await mkdir(dirname(destEntry), { recursive: true });
        await copyFile(srcEntry, destEntry);
        fileCount++;
      }
    }
  }
  
  await copyRecursive(src, dest);
  return fileCount;
}

async function main() {
  try {
    // Check if source exists
    try {
      await stat(DOCS_SOURCE);
    } catch (err) {
      console.error('❌ Error: Source docs directory not found at', DOCS_SOURCE);
      process.exit(1);
    }
    
    // Create content directory
    console.log('🗂️  Creating content directory:', CONTENT_DIR);
    await mkdir(CONTENT_DIR, { recursive: true });
    
    // Copy MDX files
    console.log('📋 Copying MDX files from:', DOCS_SOURCE);
    const fileCount = await copyDirectory(DOCS_SOURCE, CONTENT_DIR);
    
    console.log(`✅ Copied ${fileCount} MDX files to content directory`);
    console.log('✨ Build preparation complete!');
  } catch (error) {
    console.error('❌ Error during build preparation:', error);
    process.exit(1);
  }
}

main();
