import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/test/**/*.test.{js,jsx}', 'src/test/**/*.spec.{js,jsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      all: true,
      include: [
        'src/components/**/*.{js,jsx}',
        'src/container/**/*.{js,jsx}',
        'src/service/**/*.{js,jsx}'
      ],
      exclude: [
        'src/test/**',
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.{js,jsx}',
        'src/main.jsx',
        'src/pages/**',
        'src/App.jsx'
      ],
      reportOnFailure: true
    }
  }
})