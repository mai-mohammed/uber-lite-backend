export default {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  testEnvironment: 'node',

  clearMocks: true,

  // collectCoverage: true,

  coverageDirectory: 'coverage',

  transformIgnorePatterns: [
    '/node_modules/',
  ],
};
