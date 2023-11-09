module.exports = {
  root: true,
  extends: [
    "@react-native-community",
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended", // Uses the recommended rules from the @typescript-eslint/eslint-recommended
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:jest/recommended", // recomended jest styling
    "plugin:jest/style",
    "plugin:eslint-comments/recommended", // Additional ESLint rules for ESLint directive comments (e.g. //eslint-disable-line).
    "plugin:import/errors", // This plugin intends to support linting of ES2015+ (ES6+) import/export syntax, and prevent issues with misspelling of file paths and import names
    "plugin:import/warnings",
    "plugin:import/typescript", // Enables the import plug in TypeScript
    "plugin:promise/recommended", // Enforce best practices for JavaScript promises.
    "plugin:react/recommended",
    "prettier",
    "prettier/react",
    "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    "plugin:security/recommended", // Run eslint-plugin-security is a security requirnment
  ],
};
