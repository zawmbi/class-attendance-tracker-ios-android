/** Jest configuration for unit + QA logic tests (Expo SDK 53 / RN 0.79). */
// Pin the timezone so date-bucketing tests are deterministic across machines/CI.
process.env.TZ = "UTC";

module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  // Mirror the tsconfig "@/*" path alias so tests import like the app does.
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
  // Don't treat shared fixtures/helpers as test files.
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/__tests__/helpers/"],
  collectCoverageFrom: [
    "utils/**/*.ts",
    "services/iap.ts",
    "store/**/*.ts",
    "!**/*.d.ts"
  ]
};
