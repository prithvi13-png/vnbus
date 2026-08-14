module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  moduleNameMapper: {
    "^@vnbus/config$": "<rootDir>/../../packages/config/src",
    "^@vnbus/shared$": "<rootDir>/../../packages/shared/src",
    "^@vnbus/supplier-sdk$": "<rootDir>/../../packages/supplier-sdk/src",
    "^@vnbus/types$": "<rootDir>/../../packages/types/src",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  collectCoverageFrom: ["src/**/*.(t|j)s", "!src/main.ts"],
  testEnvironment: "node",
};
