import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        presets: 'presets.html',
        content: 'src/content.js',
      },
      output: {
        entryFileNames: (chunk) => {
          return chunk.name === 'content' ? 'src/content.js' : 'assets/[name]-[hash].js';
        }
      }
    }
  }
})