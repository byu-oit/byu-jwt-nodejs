module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['packages/*/tsconfig.eslint.json'],
  },
  plugins: ['eslint-plugin-tsdoc'],
  root: true,
  rules: {
    "tsdoc/syntax": "warn"
  },
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  }
}
