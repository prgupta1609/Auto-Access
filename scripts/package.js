#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📦 Packaging AutoAccess extension...');

// Check if dist directory exists
if (!fs.existsSync('dist')) {
  console.error('❌ dist directory not found. Run "pnpm build" first.');
  process.exit(1);
}

// Create package directory
const packageDir = 'package';
if (fs.existsSync(packageDir)) {
  fs.rmSync(packageDir, { recursive: true });
}
fs.mkdirSync(packageDir);

// Copy dist contents to package directory
console.log('📁 Copying build files...');
execSync(`xcopy /E /I /Y dist ${packageDir}`, { stdio: 'inherit' });

// Copy additional files
const additionalFiles = [
  'README.md',
  'CHANGELOG.md',
  'USER_GUIDE.md',
  'DEVELOPER_DOCS.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'PRIVACY.md',
  'LICENSE'
];

console.log('📄 Copying documentation...');
additionalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(packageDir, file));
    console.log(`  ✓ ${file}`);
  }
});

// Create package info
const packageInfo = {
  name: 'autoaccess',
  version: '1.0.0',
  buildDate: new Date().toISOString(),
  buildInfo: {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  }
};

fs.writeFileSync(
  path.join(packageDir, 'package-info.json'),
  JSON.stringify(packageInfo, null, 2)
);

// Create ZIP file
console.log('🗜️ Creating ZIP package...');
try {
  execSync(`powershell Compress-Archive -Path "${packageDir}\\*" -DestinationPath "autoaccess.zip" -Force`, { stdio: 'inherit' });
  console.log('✅ Package created: autoaccess.zip');
} catch (error) {
  console.error('❌ Failed to create ZIP package:', error.message);
  process.exit(1);
}

// Clean up package directory
fs.rmSync(packageDir, { recursive: true });

// Display package info
const stats = fs.statSync('autoaccess.zip');
const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log('\n📊 Package Information:');
console.log(`  📦 File: autoaccess.zip`);
console.log(`  📏 Size: ${sizeInMB} MB`);
console.log(`  📅 Built: ${new Date().toLocaleString()}`);
console.log(`  🏷️ Version: ${packageInfo.version}`);

console.log('\n🎉 AutoAccess extension packaged successfully!');
console.log('📋 Next steps:');
console.log('  1. Test the extension in Chrome');
console.log('  2. Upload to Chrome Web Store');
console.log('  3. Create GitHub release');
