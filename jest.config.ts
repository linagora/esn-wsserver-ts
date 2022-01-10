import path from 'path';
const rootDirectory = path.resolve(__dirname);

export default {
  clearMocks: true,
  globals: {
    'ts-jest': {
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    },
  },
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '@server(.*)$': `${rootDirectory}/src$1`,
    '@tests(.*)$': `${rootDirectory}/tests$1`,
  },
  rootDir: rootDirectory,
  roots: [rootDirectory],
  setupFilesAfterEnv: [`${rootDirectory}/tests/setup.ts`],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/build',
    `${rootDirectory}/tests/fixtures`,
    `${rootDirectory}/tests/setup.ts`,
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: ['((/tests/.*)|(\\.|/)(test|spec))\\.tsx?$'],
};
