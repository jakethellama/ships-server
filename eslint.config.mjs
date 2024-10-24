// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        "rules": {
            "no-console": "off",
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-unsafe-call": "warn",
            "@typescript-eslint/restrict-plus-operands": "warn",
            "indent": ["error", 4],
            "@typescript-eslint/prefer-for-of": "off",
            "no-unused-vars": "warn",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-unsafe-argument": "warn",
            "@typescript-eslint/no-unsafe-member-access": "warn",
            "no-plusplus": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-extraneous-class": "warn",
            "@typescript-eslint/ban-ts-comment": "off",
            "no-multiple-empty-lines": "error",
            "@typescript-eslint/no-floating-promises": "off",
            "semi": "error",
            // "arrow-body-style": ["error", "always"],
            "eqeqeq": "warn",
            "no-else-return": "off",
            "prefer-const": "off",
            "prefer-destructuring": "off",
            "camelcase": "warn",
            "consistent-return": "warn",
            "import/prefer-default-export": "off",
            "no-lonely-if": "off",
            "no-param-reassign": "warn",
            "no-restricted-syntax": "off",
            "no-use-before-define": "off",
            "import/extensions": "off",
            "max-len": "off",
            "class-methods-use-this": "off",
            "prefer-arrow-callback": "off",
            "default-case": "off"
        },
    }
);