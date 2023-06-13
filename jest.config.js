// Headers needs to be globally defined for tests to pass
// eslint-disable-next-line max-classes-per-file
class Headers {}
class Response {}

module.exports = {
  globals: {
    Headers,
    Response,
  },
  testMatch: ['**/src/__tests__/integration.test.ts'],
  transform: {
    '^.+\\.(js|ts)$': ['babel-jest', { plugins: ['tsconfig-paths-module-resolver'], presets: ['next/babel'] }],
  },
};
