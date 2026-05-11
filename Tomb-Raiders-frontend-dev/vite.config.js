import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const removeTrailingSlashes = (value) => {
  let trimmedValue = value.trim();

  while (trimmedValue.endsWith('/')) {
    trimmedValue = trimmedValue.slice(0, -1);
  }

  return trimmedValue;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiBaseUrl = removeTrailingSlashes(
    env.VITE_API_BASE_URL || env.VITE_API_URL || 'http://localhost',
  );

  return {
    plugins: [react()],
    base: './',
    build: {
      // 빈 문자열('') 대신 마침표('.')를 넣어 폴더 생성을 완벽히 막습니다.
      assetsDir: '.',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          assetFileNames: '[name]-[hash][extname]',
          chunkFileNames: '[name]-[hash].js',
          entryFileNames: '[name]-[hash].js',
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.js',
    },
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        clientPort: 5173,
      },
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          // 💡 1. 문지기(방화벽/CORS)를 속이는 우회 세팅
          headers: {
            Origin: apiBaseUrl,
            Referer: `${apiBaseUrl}/`,
          },
        },
      },
    },
  };
});
