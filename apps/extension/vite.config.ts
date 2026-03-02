import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { copyFileSync, mkdirSync } from 'fs'

export default defineConfig({
  plugins: [
    svelte(),
    {
      name: 'copy-content-script',
      closeBundle() {
        mkdirSync('dist/src', { recursive: true })
        copyFileSync('src/content.js', 'dist/src/content.js')
        console.log('✓ content.js copied to dist/src/')
      }
    }
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        presets: 'presets.html',
      },
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        manualChunks: undefined,
      }
    }
  }
})