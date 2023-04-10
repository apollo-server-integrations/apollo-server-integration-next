// Headers needs to be globally defined for tests to pass
class Headers {}

module.exports = {
  globals: {
    Headers,
  },
  testMatch: ['**/src/__tests__/integration.test.ts'],
  transform: {
    '^.+\\.(js|ts)$': ['babel-jest', { plugins: ['tsconfig-paths-module-resolver'], presets: ['next/babel'] }],
  },
};
