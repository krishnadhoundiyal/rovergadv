import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/rovergadv/',
  build: { target: 'safari16', sourcemap: true },
  test: { environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'], setupFiles: './src/test-setup.ts', restoreMocks: true },
});
