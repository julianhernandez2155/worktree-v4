import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const rootDir = resolve(__dirname, '..');

export default defineConfig({
  plugins: [react()] as any,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [resolve(rootDir, 'tests/setup.ts')],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/__mocks__/**',
        '.next/**',
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        }
      },
    },
    // Performance optimizations
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
      },
    },
    cache: {
      dir: resolve(rootDir, '.vitest'),
    },
    sequence: {
      shuffle: true,
    },
  },
  resolve: {
    alias: {
      '@': resolve(rootDir, './app'),
      '@/components': resolve(rootDir, './components'),
      '@/lib': resolve(rootDir, './lib'),
      '@/hooks': resolve(rootDir, './lib/hooks'),
      '@/utils': resolve(rootDir, './lib/utils'),
      '@/types': resolve(rootDir, './types'),
      '@/styles': resolve(rootDir, './styles'),
    },
  },
});