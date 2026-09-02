<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Cosmic Signature frontend — agent guide

Bilingual (en/zh) Next.js App Router frontend for Cosmic Signature, a procedural on-chain
art protocol on Arbitrum. One codebase serves two hosts:

- `app/[locale]/(landing)/` → cosmicsignature.com (marketing site, no wallet stack)
- `app/[locale]/(app)/` → app.cosmicsignature.com (the dApp)

Host selection lives in `proxy.ts` + `lib/hostRouting.ts`. `next dev` on localhost serves
the app host; to render the landing locally, send the host header:
`curl -H "Host: cosmicsignature.com" http://localhost:3000/`.

## Commands

Use npm — `packageManager` is pinned to npm and yarn refuses to run.

- `npm run dev` / `npm run build`
- `npm test` (jest) · `npm run test:e2e` (playwright)
- `npm run lint` · `npm run type-check`
- `npm run lexicon:scan` — banned-vocabulary gate, see next section
- `npm run i18n:parity` · `npm run terminology:check` — zh catalog and glossary gates

Pre-commit runs prettier, eslint, and tsc on staged files. Pre-push runs the lexicon
scan, lint, type-check, dependency audit, the full jest suite with coverage, and a
production build, so `git push` takes a minute or two.

## The lexicon (read this before writing any copy)

All user-visible text must avoid gambling, lottery, gaming, auction, investment, staking,
and charity vocabulary, in English and Chinese. CI enforces this with
`npm run lexicon:scan`, which checks string literals, JSX text, and declared identifiers
across `app/`, `components/`, `content/`, `messages/`, `public/`, and more. Use the coined
terms instead:

| Banned concept    | Use in English            | Use in Chinese  |
| ----------------- | ------------------------- | --------------- |
| bid               | Gesture                   | 落笔            |
| round             | Cycle / Performance Cycle | 周期 / 演绎周期 |
| Dutch auction     | Calibration Window        | 校准窗口        |
| prize             | Allocation                | 分配            |
| winner            | Recipient                 | 获配者          |
| raffle / draw     | Stellar Selection         | 星选            |
| staking           | Anchoring                 | 锚定            |
| yield             | Anchor Distribution       | 锚定派发        |
| withdraw / claim  | Retrieve                  | 取回            |
| mint              | Imprint                   | 铭刻            |
| DAO               | Cosmic Council            | 宇宙议会        |
| charity, donation | Public Goods              | 公共物品        |
| marketing         | Outreach Reserve          | 推广储备        |

The machine-enforced lists live in `scripts/lexicon-scan-core.ts`; the frozen Chinese
glossary with rationale and more mappings is `docs/i18n/glossary-zh.md`. The allow
pragmas (`// lexicon-allow-start` … `// lexicon-allow-end`, `// lexicon-allow-abi`,
`// lexicon-allow-backend-type`) are reserved for FAQ/legal denial copy ("this is not a
lottery"), ABI method names, and sealed backend wire-format fields. Do not use them to
sneak ordinary copy past the scanner.

## Bilingual content rules

Every user-visible string ships in both locales in the same change:

- UI strings: `messages/en/*.json` and `messages/zh/*.json`, identical key sets
- Page copy: `content/<area>/structure.ts` holds the locale-independent skeleton (ids, hrefs,
  icons, anchors) once; `text.en.ts` and `text.zh.ts` hold only copy, keyed by those ids and
  typed so a missing or invented id fails to compile. `content/about/` is small enough to
  keep plain `en.ts`/`zh.ts`.
- Legal and trust pages: per-locale copy objects `content/legal/*.en.ts` / `*.zh.ts` rendered
  by the shared `TermsContent`, `PrivacyContent`, and `TrustPageContent` components
- Routing is next-intl: `en` is unprefixed, `zh` lives under `/zh` (`i18n/routing.ts`)
- Never branch on `locale === 'zh'`. Per-locale values live in a `LocaleRecord<T>`
  (`i18n/locale.ts`) resolved with `pickByLocale`; cross-cutting conventions (Intl tag,
  `og:locale`, JSON-LD `inLanguage`, word spacing, ellipsis) come from `i18n/localeConfig.ts`.
  Adding a locale to `routing.locales` then turns every registry into a compile error until
  it has an entry (`docs/i18n/README.md` §10).

Translate the coined term, never the underlying banned concept. Follow
`docs/i18n/glossary-zh.md` exactly (one English term = one Chinese term, everywhere) and
`docs/i18n/style-guide-zh.md` for tone, dates, and CJK–Latin spacing.

## Copy is test-pinned

- Any percentage, hour/week/day figure, or CST amount in copy must be derivable from
  `content/protocol-facts.ts`. Enforced by `content/__tests__/copy-numeric-claims.test.ts`
  across FAQ, landing, learn, message catalogs, and the llms docs.
- Every internal header-nav route needs a server-rendered anchor in the app footer or on
  `/site-map`, because header dropdowns are client-only. Enforced by
  `app/[locale]/(app)/__tests__/crawl-paths.test.tsx`.
- `public/llms.txt` and `public/llms-full.txt` are AI-facing docs with their own guards
  (`public/__tests__/llms.test.ts`): required links must stay, and blanket claims like
  "formally verified Solidity contracts" are rejected.
- Trust claims ("Audited Contracts", "Formally Verified") stay off hero marquees; they
  belong on `/security` and `/audits` with sources. See
  `components/landing-v2/__tests__/Hero.test.tsx`.
- Some zh headings are pinned by e2e specs (`e2e/zh-*.spec.ts`); check before rewording
  page titles.

## Stack notes

- Tailwind CSS v4 + shadcn/ui + lucide-react. No Material UI.
- Typography utilities in `styles/typography.css`: `type-display-*`, `type-eyebrow`,
  `type-body-*`.
- The wallet stack (wagmi/RainbowKit) exists only in the `(app)` route group; keep the
  landing free of it.
- Every informational page has `generateMetadata` (titles and descriptions in
  `messages/{locale}/meta.json`) plus JsonLd breadcrumbs from `utils/jsonLd.ts`.
