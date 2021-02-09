module.exports = {
	// Automatically clear mock calls and instances between every test
	clearMocks: true,
	// The directory where Jest should output its coverage files
	coverageDirectory: 'coverage',
	// Indicates which provider should be used to instrument code for coverage
	coverageProvider: 'v8',
	// A list of reporter names that Jest uses when writing coverage reports
	collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
	// The test environment that will be used for testing
	testEnvironment: 'node',
	// A map from regular expressions to paths to transformers
	transform: {
		'.+\\.ts$': 'ts-jest'
	}
}
