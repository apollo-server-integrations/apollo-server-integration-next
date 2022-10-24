module.exports = {
  testMatch: ['**/src/__tests__/integration.test.ts'],
  transform: {
    '^.+\\.(js|ts)$': ['babel-jest', { plugins: ['tsconfig-paths-module-resolver'], presets: ['next/babel'] }],
  },
};
