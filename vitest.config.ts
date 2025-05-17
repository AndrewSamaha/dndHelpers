/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      '@': resolve(__dirname, './src'),
    },
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: [
      '**/*.stories.*',
      '**/.storybook/**/*',
      'node_modules',
      'dist',
      'build',
      '*.config.{js,ts}',
      '**/*.config.{js,ts}',
      'next.config.{js,ts}',
      'drizzle.config.{js,ts}',
      'tailwind.config.{js,ts}',
      'postcss.config.{js,ts}',
      'src/app/**/*.{js,ts,jsx,tsx}',
    ],
    coverage: {
      include: ['src/**/*.{js,ts,jsx,tsx}'],
    },
  },
});
