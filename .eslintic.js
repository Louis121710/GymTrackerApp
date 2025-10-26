module.exports = {
  env: {
    es6: true,
    node: true,
    'react-native/react-native': true,
  },
  extends: [
    '@react-native-community',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'react-native/no-raw-text': ['error'],
    'no-unused-vars': ['warn'],
    'react/prop-types': ['off'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};