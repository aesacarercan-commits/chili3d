/**
 * Test Configuration for Solvespace Package
 * Vitest configuration for @chili3d/solvespace tests
 */

export default {
  include: ['**/__tests__/**/*.test.ts'],
  exclude: ['node_modules', 'dist', 'build'],
  environment: 'happy-dom',
  globals: true,
  setupFiles: [],
}
