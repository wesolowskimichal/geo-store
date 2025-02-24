import tsPlugin from '@typescript-eslint/eslint-plugin';
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import a11yPlugin from 'eslint-plugin-jsx-a11y';
import tailwindcssPlugin from 'eslint-plugin-tailwindcss';
import unicornPlugin from 'eslint-plugin-unicorn';
import * as prettier from 'eslint-config-prettier';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

const { configs: jsConfigs } = js;
const { configs: reactConfigs } = reactPlugin;
const { configs: a11yConfigs } = a11yPlugin;

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'jsx-a11y': a11yPlugin,
      tailwindcss: tailwindcssPlugin,
      unicorn: unicornPlugin,
    },
    rules: {
      // 1) ESLint recommended
      ...jsConfigs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',

      // 3) React recommended
      ...reactConfigs.recommended.rules,

      // 4) JSX A11y recommended
      ...a11yConfigs.recommended.rules,

      // 5) Prettier overrides
      ...prettier.rules,

      // -- Custom tweaks --
      'react/jsx-filename-extension': [
        'error',
        { extensions: ['.jsx', '.tsx'] },
      ],
      'react/jsx-props-no-spreading': 'off',

      // Tailwind plugin
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'off',

      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // filenames
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
          },
        },
      ],
    },
  },
];
