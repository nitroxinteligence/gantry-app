import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
      '**/node_modules/**',
      '.next/**',
      'dist/**',
      '.aiox-core/**',
      '.aios-core/**',
      '.aios/**',
      '.claude/**',
      '.codex/**',
      '.cursor/**',
      '.gemini/**',
      '.antigravity/**',
      '.kimi/**',
      '.github/agents/**',
    ],
    coverage: {
      provider: 'v8',
      include: ['lib/**', 'hooks/**', 'componentes/**'],
      exclude: [
        '**/node_modules/**',
        '.next/**',
        'dist/**',
        '.aiox-core/**',
        '.aios-core/**',
        '.aios/**',
        '.claude/**',
        '.codex/**',
        '.cursor/**',
        '.gemini/**',
        '.antigravity/**',
        '.kimi/**',
        '.github/agents/**',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
