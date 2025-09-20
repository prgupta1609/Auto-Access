#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Post-build analysis...');

// Check if dist directory exists
if (!fs.existsSync('dist')) {
  console.error('❌ dist directory not found.');
  process.exit(1);
}

// Ensure required files are copied
console.log('📋 Ensuring required files are present...');

// Copy manifest.json if missing
if (!fs.existsSync('dist/manifest.json')) {
  console.log('  📄 Copying manifest.json...');
  fs.copyFileSync('src/manifest.json', 'dist/manifest.json');
}

// Copy built HTML files to root dist directory
const builtHtmlFiles = [
  { src: 'dist/src/ui/popup/index.html', dest: 'dist/popup.html' },
  { src: 'dist/src/ui/options/index.html', dest: 'dist/options.html' },
  { src: 'dist/src/devtools/index.html', dest: 'dist/devtools.html' },
  { src: 'dist/public/welcome.html', dest: 'dist/welcome.html' },
  { src: 'dist/src/demo/index.html', dest: 'dist/demo.html' }
];

builtHtmlFiles.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    console.log(`  📄 Copying ${path.basename(dest)}...`);
    let content = fs.readFileSync(src, 'utf8');
    
    // Fix script paths to be relative for extension context
    content = content.replace(/src="\/assets\//g, 'src="./assets/');
    content = content.replace(/href="\/assets\//g, 'href="./assets/');
    
    // Fix welcome page script paths
    if (dest.includes('welcome.html')) {
      const assetsDir = 'dist/assets';
      if (fs.existsSync(assetsDir)) {
        const assets = fs.readdirSync(assetsDir);
        
        // Find welcome-init script
        const welcomeInitScript = assets.find(file => file.startsWith('welcome-init-') && file.endsWith('.js'));
        if (welcomeInitScript) {
          content = content.replace(/src="\/src\/ui\/welcome\/main\.tsx"/, `src="./assets/${welcomeInitScript}"`);
        }
      }
    }
    
    // Fix demo page script paths
    if (dest.includes('demo.html')) {
      const assetsDir = 'dist/assets';
      if (fs.existsSync(assetsDir)) {
        const assets = fs.readdirSync(assetsDir);
        
        // Find demo-init script
        const demoInitScript = assets.find(file => file.startsWith('demo-init-') && file.endsWith('.js'));
        if (demoInitScript) {
          content = content.replace(/src="\/src\/demo\/demo-init\.js"/, `src="./assets/${demoInitScript}"`);
        }
      }
    }
    
    fs.writeFileSync(dest, content);
  }
});

// Ensure icons directory exists and create icons if missing
if (!fs.existsSync('dist/icons')) {
  console.log('  🎨 Creating icons directory...');
  fs.mkdirSync('dist/icons', { recursive: true });
}

// Create SVG icons if missing
const iconSizes = [16, 32, 48, 128];
iconSizes.forEach(size => {
  const iconPath = `dist/icons/icon-${size}.svg`;
  if (!fs.existsSync(iconPath)) {
    console.log(`  🎨 Creating icon-${size}.svg...`);
    const iconContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size/4}"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold">A</text>
</svg>`;
    fs.writeFileSync(iconPath, iconContent);
  }
});

// Analyze build output
console.log('\n📁 Build Structure:');
function analyzeDirectory(dir, prefix = '') {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      console.log(`${prefix}📁 ${item}/`);
      analyzeDirectory(itemPath, prefix + '  ');
    } else {
      const size = (stats.size / 1024).toFixed(1);
      console.log(`${prefix}📄 ${item} (${size} KB)`);
    }
  });
}

analyzeDirectory('dist');

// Check for required files
console.log('\n✅ Required Files Check:');
const requiredFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'options.html',
  'devtools.html',
  'welcome.html',
  'demo.html'
];

requiredFiles.forEach(file => {
  const filePath = path.join('dist', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
  }
});

// Check for icons
console.log('\n🎨 Icons Check:');
const iconSizesCheck = ['16', '32', '48', '128'];
iconSizesCheck.forEach(size => {
  const iconPath = path.join('dist', 'icons', `icon-${size}.svg`);
  if (fs.existsSync(iconPath)) {
    console.log(`  ✓ icon-${size}.svg`);
  } else {
    console.log(`  ❌ icon-${size}.svg - MISSING`);
  }
});

// Calculate total size
console.log('\n📊 Build Statistics:');
function getDirectorySize(dir) {
  let totalSize = 0;
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      totalSize += getDirectorySize(itemPath);
    } else {
      totalSize += stats.size;
    }
  });
  
  return totalSize;
}

const totalSize = getDirectorySize('dist');
const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

console.log(`  📏 Total Size: ${totalSizeMB} MB`);
console.log(`  📁 Files: ${countFiles('dist')}`);
console.log(`  📅 Build Time: ${new Date().toLocaleString()}`);

function countFiles(dir) {
  let count = 0;
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      count += countFiles(itemPath);
    } else {
      count++;
    }
  });
  
  return count;
}

// Check for potential issues
console.log('\n⚠️ Potential Issues:');
const issues = [];

// Check manifest.json
const manifestPath = path.join('dist', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    if (!manifest.name) issues.push('Manifest missing name');
    if (!manifest.version) issues.push('Manifest missing version');
    if (!manifest.manifest_version) issues.push('Manifest missing manifest_version');
    if (manifest.manifest_version !== 3) issues.push('Manifest version should be 3');
    
    if (issues.length === 0) {
      console.log('  ✓ Manifest.json is valid');
    } else {
      issues.forEach(issue => console.log(`  ❌ ${issue}`));
    }
  } catch (error) {
    console.log('  ❌ Manifest.json is invalid JSON');
  }
} else {
  console.log('  ❌ Manifest.json not found');
}

// Check for large files
console.log('\n📏 Large Files (>1MB):');
function findLargeFiles(dir, prefix = '') {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      findLargeFiles(itemPath, prefix + item + '/');
    } else {
      const sizeMB = stats.size / (1024 * 1024);
      if (sizeMB > 1) {
        console.log(`  ⚠️ ${prefix}${item} (${sizeMB.toFixed(2)} MB)`);
      }
    }
  });
}

findLargeFiles('dist');

console.log('\n🎉 Post-build analysis complete!');
