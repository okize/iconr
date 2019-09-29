module.exports = {
  extends: 'airbnb-base',
  plugins: ['prettier'],
  env: {
    node: true,
  },
  rules: {
    'prettier/prettier': 'error',
    'arrow-body-style': 'off',
    'no-console': 'off',
    'no-param-reassign': ['error', { props: false }],
  },
};
