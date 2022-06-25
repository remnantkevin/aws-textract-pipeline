/* eslint-disable sort-keys */
/* eslint-disable @typescript-eslint/no-magic-numbers */

module.exports = {
  root: true,
  env: { node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    project: "./tsconfig.eslint.json"
  },
  plugins: ["@typescript-eslint", "import", "unused-imports"],
  extends: [
    "eslint:recommended",

    // https://github.com/import-js/eslint-plugin-import#typescript
    "plugin:import/recommended",
    "plugin:import/typescript",

    // https://typescript-eslint.io/docs/linting/type-linting
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict", // https://typescript-eslint.io/docs/linting/configs#strict

    "prettier"
  ],
  // https://github.com/import-js/eslint-plugin-import#resolvers
  // https://github.com/alexgorbatchev/eslint-import-resolver-typescript#configuration
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"]
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code
        project: "./tsconfig.eslint.json"
      }
    }
  },
  rules: {
    "no-unused-expressions": "error", // https://eslint.org/docs/rules/no-unused-expressions
    "sort-keys": ["warn", "asc", { caseSensitive: false, natural: false, minKeys: 2 }], // https://eslint.org/docs/rules/sort-keys
    // https://eslint.org/docs/rules/sort-imports
    "sort-imports": [
      "warn",
      {
        ignoreCase: true,
        ignoreDeclarationSort: true, // handled by "import/order" rule
        ignoreMemberSort: false // 'member sort' is the reason "sort-imports" is used (it is not available through "import/order")
      }
    ],

    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "parent", "sibling", "index"],
        alphabetize: { order: "asc", caseInsensitive: true }
      }
    ],
    "import/first": "warn", // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/first.md
    "import/newline-after-import": "warn", // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/newline-after-import.md
    "import/no-self-import": "error", // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-self-import.md

    "@typescript-eslint/consistent-type-definitions": ["warn", "type"], // https://typescript-eslint.io/rules/consistent-type-definitions
    "@typescript-eslint/consistent-type-exports": "warn", // https://typescript-eslint.io/rules/consistent-type-exports
    "@typescript-eslint/consistent-type-imports": "warn", // https://typescript-eslint.io/rules/consistent-type-imports
    "default-param-last": "off", // https://eslint.org/docs/rules/default-param-last
    "@typescript-eslint/default-param-last": "warn", // https://typescript-eslint.io/rules/default-param-last
    "dot-notation": "off", // https://eslint.org/docs/rules/dot-notation
    "@typescript-eslint/dot-notation": "warn", // https://typescript-eslint.io/rules/dot-notation
    "@typescript-eslint/array-type": ["warn", { default: "array-simple" }], // https://typescript-eslint.io/rules/array-type
    // https://typescript-eslint.io/rules/member-ordering
    "@typescript-eslint/member-ordering": [
      "warn",
      {
        default: {
          // default order: https://typescript-eslint.io/rules/member-ordering#default-configuration
          memberTypes: [
            // Index signature
            "signature",

            // Fields
            "public-static-field",
            "protected-static-field",
            "private-static-field",

            "public-decorated-field",
            "protected-decorated-field",
            "private-decorated-field",

            "public-instance-field",
            "protected-instance-field",
            "private-instance-field",

            "public-abstract-field",
            "protected-abstract-field",
            "private-abstract-field",

            "public-field",
            "protected-field",
            "private-field",

            "static-field",
            "instance-field",
            "abstract-field",

            "decorated-field",

            "field",

            // Constructors
            "public-constructor",
            "protected-constructor",
            "private-constructor",

            "constructor",

            // Getters
            "public-static-get",
            "protected-static-get",
            "private-static-get",

            "public-decorated-get",
            "protected-decorated-get",
            "private-decorated-get",

            "public-instance-get",
            "protected-instance-get",
            "private-instance-get",

            "public-abstract-get",
            "protected-abstract-get",
            "private-abstract-get",

            "public-get",
            "protected-get",
            "private-get",

            "static-get",
            "instance-get",
            "abstract-get",

            "decorated-get",

            "get",

            // Setters
            "public-static-set",
            "protected-static-set",
            "private-static-set",

            "public-decorated-set",
            "protected-decorated-set",
            "private-decorated-set",

            "public-instance-set",
            "protected-instance-set",
            "private-instance-set",

            "public-abstract-set",
            "protected-abstract-set",
            "private-abstract-set",

            "public-set",
            "protected-set",
            "private-set",

            "static-set",
            "instance-set",
            "abstract-set",

            "decorated-set",

            "set",

            // Methods
            "public-static-method",
            "protected-static-method",
            "private-static-method",

            "public-decorated-method",
            "protected-decorated-method",
            "private-decorated-method",

            "public-instance-method",
            "protected-instance-method",
            "private-instance-method",

            "public-abstract-method",
            "protected-abstract-method",
            "private-abstract-method",

            "public-method",
            "protected-method",
            "private-method",

            "static-method",
            "instance-method",
            "abstract-method",

            "decorated-method",

            "method"
          ],
          order: "alphabetically-case-insensitive"
        }
      }
    ],
    "no-magic-numbers": "off", // https://eslint.org/docs/rules/no-magic-numbers
    // https://typescript-eslint.io/rules/no-magic-numbers
    "@typescript-eslint/no-magic-numbers": [
      "warn",
      {
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
        ignoreNumericLiteralTypes: true,
        ignoreReadonlyClassProperties: true,
        ignoreTypeIndexes: true,
        ignore: [0, 1, 2]
      }
    ],
    "@typescript-eslint/no-meaningless-void-operator": "warn", // https://typescript-eslint.io/rules/no-meaningless-void-operator
    "@typescript-eslint/sort-type-union-intersection-members": "warn", // https://typescript-eslint.io/rules/sort-type-union-intersection-members

    "@typescript-eslint/no-unused-vars": "off",
    // https://github.com/sweepline/eslint-plugin-unused-imports
    "unused-imports/no-unused-imports": "warn",
    "unused-imports/no-unused-vars": [
      "warn",
      { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" }
    ]
  }
};
