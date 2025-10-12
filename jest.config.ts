// jest.config.ts
import type { Config } from 'jest'

const config: Config = {
  // Use the jsdom environment to simulate a browser DOM
  testEnvironment: 'jest-environment-jsdom',
  
  // Array of file extensions Jest should look for
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Directories to search for test files
  roots: ['<rootDir>/src'], 
  
  // Pattern to detect test files
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx)$',
  
  // Configuration for ts-jest
   transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
    }],
  },

  transformIgnorePatterns: ['/node_modules/'],
  
  // Setup file to configure testing environment before running tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Mapping paths in your code (e.g., @/providers/...) to their actual location
   moduleNameMapper: {
    // Maps SVG imports to your mock file
    '\\.svg$': '<rootDir>/__mocks__/svgrMock.js', 
    '^@/svgs/(.*)\\.js$': '<rootDir>/__mocks__/svgrMock.js',
    
    // You may also need this for CSS/images:
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|png|jpg|jpeg)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Keep your path alias for the mock file
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;