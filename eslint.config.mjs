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

/**
 * lucide-react glyphs that depict auction, lottery, prize or game imagery:
 * gavels, tickets, dice, gamepads, trophies, medals, crowns, swords, gift
 * boxes, piggy banks, coin hands, clovers and card suits. Matches every
 * export alias of a glyph (`Trophy`, `TrophyIcon`, `LucideTrophy`).
 * lib/__tests__/conceptIcons.test.ts reads both patterns from this file.
 */
const OFF_LEXICON_ICON_NAMES =
  '^(?:Lucide)?(?:Gavel|Ticket\\w*|Dices?|Dice[1-6]|Gamepad\\w*|Joystick|Trophy|Medal|Award|Crown|Swords?|Gift|PiggyBank|HandCoins|HandHeart|HeartHandshake|Clover|Spade|Club|Cherry)(?:Icon)?$';
/** The same glyphs imported from their own module (`lucide-react/dist/esm/icons/trophy`). */
const OFF_LEXICON_ICON_MODULES =
  '^lucide-react/.*/icons/(?:gavel|ticket[\\w-]*|dices?|dice-[1-6]|gamepad[\\w-]*|joystick|trophy|medal|award|crown|swords?|gift|piggy-bank|hand-coins|hand-heart|heart-handshake|clover|spade|club|cherry)(?:\\.[cm]?js)?$';

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
            // wagmi 3 renamed the account hooks; the old names are deprecated
            // aliases (AGENTS.md: heed deprecation notices).
            {
              name: 'wagmi',
              importNames: ['useAccount', 'useAccountEffect', 'useSwitchAccount'],
              message:
                'Deprecated in wagmi 3: use useConnection, useConnectionEffect or useSwitchConnection.',
            },
          ],
          // The lexicon keeps auction, lottery, prize and game vocabulary out
          // of the copy; these glyphs would bring the same imagery back.
          // Coined concepts have one icon each in lib/conceptIcons.ts. A name
          // pattern, not a list, so the `…Icon` and `Lucide…` aliases lucide
          // exports for every glyph cannot slip past, and a regex for the
          // per-icon module paths.
          patterns: [
            {
              group: ['lucide-react'],
              importNamePattern: OFF_LEXICON_ICON_NAMES,
              message:
                'Auction, lottery, prize and game imagery is off-lexicon (AGENTS.md). Use the concept icon from @/lib/conceptIcons.',
            },
            {
              regex: OFF_LEXICON_ICON_MODULES,
              message:
                'Auction, lottery, prize and game imagery is off-lexicon (AGENTS.md). Use the concept icon from @/lib/conceptIcons.',
            },
            // One external-link glyph (docs/design-system.md → Links).
            {
              group: ['lucide-react'],
              importNamePattern:
                '^(?:Lucide)?(?:ExternalLink|SquareArrowOutUpRight|SquareArrowUpRight)(?:Icon)?$',
              message:
                'An outbound link carries ArrowUpRight (size-3.5, text-subtle), as SiteLink draws it: one external-link icon.',
            },
          ],
        },
      ],
      // `{ z }` and the default export are Zod's materialized namespace, which
      // drags its ~50 locale tables (~40 KB gzip) into the shared client
      // chunk of every app page; `import * as z from 'zod'` lets Turbopack
      // tree-shake them.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "ImportDeclaration[source.value='zod'] > :matches(ImportSpecifier[imported.name='z'], ImportDefaultSpecifier)",
          message: "Use `import * as z from 'zod'` so unused Zod locales stay out of the bundle.",
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
      // Playwright recreates these directories while browser checks run.
      // Generated reports are not source and must not race with the linter.
      'test-results/',
      'blob-report/',
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
