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
    target: 'es2015',
    minify: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        presets: 'presets.html',
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        format: 'es',
      }
    }
  }
})