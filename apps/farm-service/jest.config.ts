import type { Config } from "jest"
import { pathsToModuleNameMapper } from "ts-jest"
const { compilerOptions } = require("./tsconfig")

const config: Config = {
  clearMocks: true,
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  coverageProvider: "v8",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
  testMatch: ["**/__tests__/**/?(*.)+(spec|test).ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  testTimeout: process.env.NODE_ENV === "DEBUG" ? 1000 * 60 * 10 : 1000 * 5, // debug 10m, normal 5s
}

export default config
