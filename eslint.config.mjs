// Kept as .mjs (not .ts) because ESLint v9 flat-config requires native ESM
// and TypeScript support needs the extra `jiti` loader + a nested tsconfig
// project-reference. The rest of the codebase is strict TypeScript; this
// file is narrow, small, and purely declarative.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import prettierConfig from 'eslint-config-prettier/flat';

const tsPlugin = nextCoreWebVitals.find((c) => c.name === 'next/typescript')?.plugins?.[
  '@typescript-eslint'
];

const reactHooksPlugin = nextCoreWebVitals.find((c) => c.plugins?.['react-hooks'])?.plugins?.[
  'react-hooks'
];

const config = [
  ...nextCoreWebVitals,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      ...(tsPlugin ? { '@typescript-eslint': tsPlugin } : {}),
      ...(reactHooksPlugin ? { 'react-hooks': reactHooksPlugin } : {}),
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-loss-of-precision': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            {
              pattern: '@/{components,hooks,lib,utils,contexts,services,config,i18n}/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/test-utils',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
        },
      ],
      'react/jsx-no-target-blank': ['error', { allowReferrer: false }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Locale-aware navigation: plain next/link and the locale-sensitive
      // next/navigation hooks drop the /zh prefix. Use the wrappers from
      // @/i18n/navigation instead (docs/i18n/README.md §2.2).
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next/link',
              message: "Import { Link } from '@/i18n/navigation' to preserve the locale prefix.",
            },
            {
              name: 'next/navigation',
              importNames: ['useRouter', 'usePathname', 'redirect', 'permanentRedirect'],
              message:
                "Import locale-aware navigation from '@/i18n/navigation' (useSearchParams and notFound stay on next/navigation).",
            },
          ],
        },
      ],
    },
  },
  {
    // The i18n wrappers themselves and analytics (GA must report the real,
    // locale-prefixed URL) are the sanctioned users of the native APIs.
    files: ['i18n/**', 'app/analytics.tsx'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['**/__tests__/**'],
    rules: {
      '@next/next/no-img-element': 'off',
      'jsx-a11y/alt-text': 'off',
      // Tests render plain anchors on purpose (asChild wrappers, fixtures).
      // With the (app)/(landing) route groups the rule's page detection
      // misclassifies these fixture hrefs as app pages.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  prettierConfig,
  {
    ignores: [
      '.next/',
      // Local test-harness runtime state (logs, generated configs, dist dir).
      '.harness/',
      'node_modules/',
      'contracts/types/',
      '__mocks__/',
      'playwright-report/',
      'coverage/',
      'commitlint.config.mjs',
      // Claude/Cursor tooling state: worktrees here are duplicate source
      // trees, transcripts/hooks/skills are non-source artifacts. None of it
      // should be linted as production code.
      '.claude/',
    ],
  },
];

export default config;
