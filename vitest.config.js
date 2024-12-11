import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './fasp-core-ui/setupTests.js',
    testTimeout: 10000,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json'],
      reportsDirectory: './coverage',
      enabled: true,
      clean: true,
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    include: ['**/*.js'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    }
  },
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxPragma: 'React',
      jsxPragmaFrag: 'React.Fragment',
      include: '**/*.{js,jsx}',
      exclude: '',
      babel: {
        plugins: ['@babel/plugin-transform-react-jsx'],
        parserOpts: {
          plugins: ['jsx'],
        },
      },
    }),
  ],
  build: {
    minify: false,
  },
});