module.exports = {
  'env': {
    'commonjs': true,
    'es2021': true,
    'node': true,
  },
  'extends': [
    'eslint:recommended',
  ],
  'parserOptions': {
    'ecmaVersion': 12,
  },
  'rules': {
    'array-bracket-newline': [
      'error',
      {
        minItems: 1,
        multiline: true,
      },
    ],
    'array-element-newline': [
      'error',
      {
        minItems: 1,
        multiline: true,
      },
    ],
    'comma-dangle': [
      'error',
      {
        'arrays': 'always',
        'objects': 'always',
        'imports': 'always',
        'exports': 'always',
        'functions': 'never',
      },
    ],
    'indent': [
      'error',
      2,
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'quotes': [
      'error',
      'single',
    ],
    'semi': [
      'error',
      'always',
    ],
    'eol-last': [
      'error',
      'always',
    ],
  },
};
