module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  collectCoverage: true,
  collectCoverageFrom: ['lib/**/*.js'],
  verbose: true,
  globalSetup: '<rootDir>/test/clean.js',
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/test/unit/**/*.test.js']
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/test/integration/**/*.test.js']
    }
  ]
}
