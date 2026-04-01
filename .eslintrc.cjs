// .eslintrc.cjs
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'prettier'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier' // Should be last to override other configs
  ],
  rules: {
    'prettier/prettier': 'error',
    // Add any other specific rules you want to enforce
  },
  env: {
    node: true
  }
};
