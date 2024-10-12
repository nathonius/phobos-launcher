// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import UnusedImportsPlugin from "eslint-plugin-unused-imports";
import PrettierConfig from "eslint-config-prettier";
import * as ImportPlugin from "eslint-plugin-import";

export default tseslint.config(
  {
    ignores: [
      "node_modules/",
      "main.js",
      "esbuild.config.mjs",
      "eslint.config.mjs",
      "jest.config.mjs",
      "tailwind.config.js",
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "unused-imports": UnusedImportsPlugin,
      import: ImportPlugin,
    },
    rules: {
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-redundant-type-constituents": "warn",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-this-alias": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      "@typescript-eslint/no-floating-promises": "off",

      // replaced by 'unused-imports/no-unused-vars'
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "import/order": "error",
      "import/no-duplicates": "error",
    },
  },
  // @ts-ignore
  PrettierConfig
);
