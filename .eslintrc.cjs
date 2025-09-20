module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true, 
    node: true,
    webextensions: true 
  },
  extends: [
    'eslint:recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react-refresh'],
  globals: {
    chrome: 'readonly',
    process: 'readonly',
    __dirname: 'readonly',
    vi: 'readonly',
    React: 'readonly',
    describe: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'off', // Allow console statements for now
    'no-undef': 'off', // Turn off for TypeScript files
    'no-case-declarations': 'off', // Allow declarations in case blocks
    'no-cond-assign': 'off', // Allow assignment in conditions
  },
}
