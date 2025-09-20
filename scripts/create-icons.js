#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Create simple SVG icons
const createIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="4"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold">A</text>
</svg>`;
};

const sizes = [16, 32, 48, 128];

console.log('🎨 Creating extension icons...');

sizes.forEach(size => {
  const svg = createIcon(size);
  const filename = `dist/icons/icon-${size}.svg`;
  fs.writeFileSync(filename, svg);
  console.log(`  ✓ Created icon-${size}.svg`);
});

console.log('✅ Icons created successfully!');
console.log('Note: These are SVG icons. For production, convert to PNG format.');
