import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs'

// Plugin to copy static files
function copyStaticFiles() {
  return {
    name: 'copy-static-files',
    writeBundle() {
      // Copy manifest.json
      copyFileSync('src/manifest.json', 'dist/manifest.json')
      
      // HTML files are handled by Vite build process
      
      // Create icons directory if it doesn't exist
      if (!existsSync('dist/icons')) {
        mkdirSync('dist/icons', { recursive: true })
      }
      
      // Copy icons
      const iconSizes = [16, 32, 48, 128]
      iconSizes.forEach(size => {
        const iconContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size/4}"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold">A</text>
</svg>`
        
        writeFileSync(`dist/icons/icon-${size}.svg`, iconContent)
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), copyStaticFiles()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/ui/popup/index.html'),
        options: resolve(__dirname, 'src/ui/options/index.html'),
        devtools: resolve(__dirname, 'src/devtools/index.html'),
        welcome: resolve(__dirname, 'src/ui/welcome/index.html'),
        demo: resolve(__dirname, 'src/demo/index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts'),
        toolbar: resolve(__dirname, 'src/ui/toolbar/index.ts'),
        'welcome-init': resolve(__dirname, 'src/ui/welcome/main.tsx'),
        'demo-init': resolve(__dirname, 'src/demo/demo-init.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background' || chunkInfo.name === 'content' || chunkInfo.name === 'toolbar') {
            return '[name].js'
          }
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    target: 'es2020',
    minify: 'terser',
    sourcemap: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
