module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.js", "!src/server.js", "!src/config/passport.js"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"],
  testTimeout: 10000,
}
