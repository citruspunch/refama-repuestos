export default [
  { ignores: ["node_modules/**", "dist/**", "test-results/**", "playwright-report/**"] },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: { semi: ["error", "never"], "no-unexpected-multiline": "error" },
  },
]
