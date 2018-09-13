module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/essential',
    'plugin:prettier/recommended'
  ],
  plugins: [
    'vue'
  ],
  rules: {
    'semi': [2, 'never'],
    'no-console': 'off',
    'vue/max-attributes-per-line': 'off',
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'prettier/prettier': [
      'error', {
        'semi': false,
        'singleQuote': true,
        'printWidth': 150
      }
    ]
  }
}
