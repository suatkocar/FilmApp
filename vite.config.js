import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import clean from 'vite-plugin-clean';

export default defineConfig({
  base: '/FilmApp/',
  plugins: [react(), clean()],
  build: {
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  }
});
