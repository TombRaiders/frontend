import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    include: ['src/**/*.test.{js,jsx}'],
  },
  resolve: {
    alias: {
      // eslint-disable-next-line no-underscore-dangle
      '@': path.resolve(globalThis.__dirname || '.', './src'),
    },
  },
});
