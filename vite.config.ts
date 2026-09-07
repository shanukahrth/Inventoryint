import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// `base: './'` makes the build use relative asset paths, so it works
// whether it's deployed at the root of a domain or under a GitHub Pages
// project path like https://<user>.github.io/<repo>/ without extra config.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
  },
})
