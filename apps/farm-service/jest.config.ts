import type { Config } from "jest"
import { pathsToModuleNameMapper } from "ts-jest"
const { compilerOptions } = require("./tsconfig")

const config: Config = {
	clearMocks: true,
	transform: {
		"^.+\\.(t|j)sx?$": "@swc/jest",
	},
	coverageProvider: "v8",
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: "<rootDir>/",
	}),
	testMatch: ["**/__tests__/**/?(*.)+(spec|test).ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
}

export default config
