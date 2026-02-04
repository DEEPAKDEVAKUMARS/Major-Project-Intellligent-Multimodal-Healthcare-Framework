/** Jest configuration (CommonJS) */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/backend/**/*.test.js'],
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/node_modules/**',
    '!backend/**/*.test.js'
  ],
  coverageDirectory: 'coverage/backend',
  coverageReporters: ['text', 'lcov', 'html']
}
