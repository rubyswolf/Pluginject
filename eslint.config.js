import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
   baseDirectory: __dirname,
});

const eslintConfig = [
   {
      ignores: [
         "node_modules/**",
         "dist/**",
         "build/**",
         "public/**",
         ".vite/**",
         ".next/**",
      ],
   },
   ...compat.extends(
      "plugin:react/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended"
   ),
   {
      files: ["**/*.ts", "**/*.tsx"],
      languageOptions: {
         parser: "@typescript-eslint/parser",
         parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            ecmaFeatures: {
               jsx: true,
            },
         },
      },
      plugins: {
         "@typescript-eslint": "@typescript-eslint/eslint-plugin",
         react: "eslint-plugin-react",
         prettier: "eslint-plugin-prettier",
      },
      rules: {
         "@typescript-eslint/no-explicit-any": "off",
         quotes: ["warn", "double"],
         semi: ["warn", "always"],
         "no-unexpected-multiline": "error",
         "no-extra-semi": "error",
         "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
         "prettier/prettier": [
            "error",
            {
               semi: true,
               singleQuote: false,
               tabWidth: 3,
               trailingComma: "es5",
               printWidth: 80,
            },
         ],
      },
      settings: {
         react: {
            version: "detect",
         },
      },
   },
];

export default eslintConfig;
