module.exports = {
  extends: 'eslint:recommended',
  env: {
    node: true
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': 0,
    'no-unused-vars': ['error', { 'args': 'none' }],
    'yoda': ["error", "always"],
    'max-len': ["error", { "code": 80 }],
  },
  globals: {
    Promise: 'readonly'
  },
}
