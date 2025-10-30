// eslint.config.js (Flat config for ESLint v9)
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tseslint from 'typescript-eslint'

export default [
  // Ignore build artifacts
  { ignores: ['dist', 'node_modules', 'coverage'] },

  // ✅ FIRST: handle .vue with vue-eslint-parser
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        // Use TS parser only for <script lang="ts">
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
    },
    // Use the Vue recommended rules (includes template parsing)
    ...vue.configs['flat/recommended'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  // Then JS base + TS rules for .ts files
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
    },
    // (Optional) permissive TS rules if you want to allow any:
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      'no-empty': 'off',
      // 'no-unused-expressions': 'off',
      'no-console': 'off',
    },
  },

  // Test files: allow vitest globals
  {
    files: ['**/*.{spec,test}.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
]
