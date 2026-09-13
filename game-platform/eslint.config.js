import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // main instructions.md documents snake_case for local variables as this
    // project's convention, but nothing enforced it — this is a warn-level
    // nudge, not a build gate. Scoped to the "platform" — prisoner and
    // roulette are game modules that are off-limits for this refactor, so
    // they're excluded rather than flagged for violations nobody asked to fix.
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/modules/prisoner/**', 'src/modules/roulette/**'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'variable',
          format: ['snake_case', 'camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          // Exported service/hook functions are camelCase, but plenty of
          // private internal helpers (format_label, sanitize_settings, this
          // file's own session_reducer, ...) are snake_case throughout the
          // platform code — that's this codebase's real pattern, not a slip.
          selector: 'function',
          format: ['camelCase', 'PascalCase', 'snake_case'],
        },
        {
          // PascalCase covers the `{ icon: Icon }`-style prop rename used to
          // pass a component reference as a parameter (e.g. ConfirmActionModal).
          selector: 'parameter',
          format: ['snake_case', 'camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],
    },
  },
])
