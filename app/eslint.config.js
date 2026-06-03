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
      'no-restricted-syntax': [
        'error',
        {
          selector: "ImportDeclaration[source.value='lucide-react']:has(ImportNamespaceSpecifier)",
          message:
            "Wildcard imports of 'lucide-react' (e.g. `import * as Icons from 'lucide-react'`) bloat the bundle by ~587 KB. Use named imports instead. The only authorised wildcard import of 'lucide-react' is in src/components/DynamicIcon.tsx, which resolves icon names dynamically at runtime.",
        },
      ],
    },
  },
  {
    files: ['src/components/DynamicIcon.tsx'],
    rules: { 'no-restricted-syntax': 'off' },
  },
])
