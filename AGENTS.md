<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Cosmic Signature frontend — agent guide

Multilingual (en / zh / zh-TW / zh-HK / uk / ko / ja / vi) Next.js App Router frontend for Cosmic
Signature, a procedural on-chain art protocol on Arbitrum. One codebase serves two hosts:

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
- `npm run lexicon:scan` — banned-vocabulary gate (every locale), see next section
- `npm run i18n:parity` — per-locale catalog report; `npm run i18n:strict` — the CI gate
  (key parity, ICU syntax, placeholder parity, plural categories, untranslated catalogs)
- `npm run i18n:conventions` — copy-conventions gate: Chinese script rules (no Simplified
  characters in Traditional copy or vice versa, regional character choices, 「」 vs “”) and
  per-locale disallowed patterns (Korean particles glued to placeholders, full-width
  punctuation, dropped pronoun)
- `npm run terminology:check` — glossary drift gate for every translated locale
- `npm run i18n:check` — strict + conventions + terminology + lexicon in one go (pre-push runs this)
- `npm run i18n:scaffold -- --locale xx` — every per-locale file for a new language
  (catalogs, copy modules, gate stub, e2e suites, doc templates), then the compiler lists
  the registries; `npm run i18n:derive -- --from zh --to zh-TW` — mechanical draft of a
  sibling-script locale (never shipped as-is); `npm run og:fonts` — rebuild every OG font
  subset
- `npm run test:e2e:locales` — every locale's smoke/QA suites
- `npm run deps:audit` — dependency gate: production advisories at any severity,
  high/critical anywhere, lockfile integrity, time-boxed exceptions

Pre-commit runs prettier, eslint, and tsc on staged files. Pre-push runs the i18n gates,
lint, type-check, dependency audit, the full jest suite with coverage, and a production
build, so `git push` takes a minute or two.

## Dependencies

There is no list of accepted advisories. When `deps:audit` fails, fix in this order and stop
at the first step that works: `npm update <package>` (the patched release is usually inside
the consumer's declared range) → bump the consumer → pin in `overrides` only when the consumer
pins the vulnerable version itself, with a row in README → Development → Dependencies →
`audit-exceptions.json` as a last resort (id, package, reason, expiry ≤ 90 days; ≤ 30 for
production scope). npm's default peer semantics apply; never add `legacy-peer-deps` or
`--force`. A peer mismatch gets a targeted override that repeats the root spec (the
RainbowKit → wagmi entry is the template).

## The lexicon (read this before writing any copy)

All user-visible text must avoid gambling, lottery, gaming, auction, investment, staking,
and charity vocabulary, in every language. CI enforces this with
`npm run lexicon:scan`, which checks string literals, JSX text, and declared identifiers
across `app/`, `components/`, `content/`, `messages/`, `public/`, and more, applying the
English list plus one banned register per translated locale. Use the coined terms
instead:

| Banned concept    | Use in English            | zh (Simplified) | zh-TW (Taiwan)  | zh-HK (Hong Kong) | Use in Ukrainian           | Use in Korean            | Use in Japanese                     | Use in Vietnamese          |
| ----------------- | ------------------------- | --------------- | --------------- | ----------------- | -------------------------- | ------------------------ | ----------------------------------- | -------------------------- |
| bid               | Gesture                   | 落笔            | 落筆            | 落筆              | жест                       | 제스처                   | 一筆                                | nét bút                    |
| round             | Cycle / Performance Cycle | 周期 / 演绎周期 | 週期 / 演繹週期 | 週期 / 演繹週期   | цикл / перформанс-цикл     | 사이클 / 퍼포먼스 사이클 | サイクル / パフォーマンス・サイクル | chu kỳ / chu kỳ trình diễn |
| Dutch auction     | Calibration Window        | 校准窗口        | 校準窗口        | 校準窗口          | вікно калібрування         | 보정 구간                | 調律期間                            | cửa sổ hiệu chỉnh          |
| prize             | Allocation                | 分配            | 分配            | 分配              | розподіл                   | 배분                     | 配分                                | phân bổ                    |
| winner            | Recipient                 | 获配者          | 獲配者          | 獲配者            | отримувач                  | 수령자                   | 受領者                              | người nhận                 |
| raffle / draw     | Stellar Selection         | 星选            | 星選            | 星選              | зоряний відбір             | 별빛 선정                | 星選                                | Tinh tuyển                 |
| staking           | Anchoring                 | 锚定            | 錨定            | 錨定              | закріплення                | 앵커링                   | 係留                                | neo giữ                    |
| yield             | Anchor Distribution       | 锚定派发        | 錨定配發        | 錨定派發          | надходження за закріплення | 앵커링 지급              | 係留配分                            | phân phối neo giữ          |
| withdraw / claim  | Retrieve                  | 取回            | 取回            | 取回              | забрати                    | 회수                     | 受け取る                            | nhận về                    |
| mint              | Imprint                   | 铭刻            | 銘刻            | 銘刻              | закарбувати                | 각인                     | 刻印                                | khắc                       |
| DAO               | Cosmic Council            | 宇宙议会        | 宇宙議會        | 宇宙議會          | Космічна Рада              | 우주 평의회              | 宇宙評議会                          | Hội đồng Vũ trụ            |
| charity, donation | Public Goods              | 公共物品        | 公共財          | 公共物品          | суспільні блага            | 공공재                   | 公共財                              | Hàng hóa công              |
| marketing         | Outreach Reserve          | 推广储备        | 推廣儲備        | 推廣儲備          | резерв просування          | 홍보 준비금              | 広報準備金                          | Dự trữ truyền thông        |

The three Chinese locales are separate locales, not character conversions of one another:
each has its own vocabulary (Taiwan 網路/軟體/使用者/隱私權政策, Hong Kong
網絡/軟件/用戶/私隱政策), character choices (Taiwan 裡/著/台, Hong Kong 裏/着 with standard
Big5 code points), quotation marks (「」 in both Traditional locales, “” in Simplified), and
banned register (Taiwan 博弈/競標/報酬, Hong Kong 六合彩/派彩/回報). `npm run
i18n:conventions` enforces the script and character rules; the terminology packs in
`scripts/terminology/zh-TW.ts` and `zh-HK.ts` enforce the vocabulary.

Korean is written in 합쇼체 (-합니다) with the reader never named (no 당신), ASCII
punctuation, counters attached to digits (48시간, 3개), and no sound-dependent particle
(을/를, 이/가, 은/는, 와/과, (으)로) directly after an ICU placeholder — `npm run
i18n:conventions` rejects those, `docs/i18n/style-guide-ko.md` explains how to restructure,
and the Korean banned register (경매, 당첨, 추첨, 도박, 투자, 수익, 스테이킹, 예치, 민팅, 기부,
마케팅, 라운드 …) is matched as substrings, so innocent words that contain one are avoided
(배경 not 백그라운드, 횟수 not 회수 for counts).

Japanese is written in です・ます体 with the reader never named (no あなた), full-width
punctuation after Japanese text (。、？！「」（）), ASCII digits and Latin letters, and no
space between Japanese text and a Latin token, digit, or ICU placeholder (48時間, Cosmic
Signatureは, {count}件) — `npm run i18n:conventions` rejects spaces, half-width kana,
full-width alphanumerics, dropped long vowels (ユーザ for ユーザー), and Chinese-only
characters; `docs/i18n/style-guide-ja.md` explains the rules. The Japanese banned register
(オークション, 入札, 当選, 抽選, 宝くじ, ギャンブル, 投資, 利益, 収益, ステーキング, ミント, 寄付,
マーケティング, ラウンド …) is matched as substrings, so innocent words that contain one are
avoided (背景 not バックグラウンド, 関係者 not ステークホルダー, 損害 not 不利益). Chinese and
Japanese share Han characters with different meanings, so a locale's banned register is
never applied to another language of the same `scriptFamily` (`i18n/localeConfig.ts`,
`checkAppliesTo` in `scripts/locale-files.ts`).

Vietnamese is written in a spaced Latin alphabet with stacked diacritics, addresses the
reader as bạn (never quý khách / quý vị), uses ASCII punctuation attached to the word,
“ ” quotes, a single … for the ellipsis, dot-grouped thousands (1.000 CST), and digit-space-
unit durations (48 giờ, 5 tuần) — `npm run i18n:conventions` rejects East Asian characters,
full-width marks, a space before a sentence mark, three-dot ellipses, and the
customer-service address, and every catalog must be in Normalization Form C (decomposed
diacritics break the whole-word gates); `docs/i18n/style-guide-vi.md` explains the rules.
The Vietnamese banned register (đấu giá, đặt cược, xổ số, trúng thưởng, thắng, đầu tư, lợi
nhuận, đặt cọc, đúc, rút tiền, quyên góp, ủng hộ, tiếp thị, vòng đấu …) is matched as whole
words under Unicode boundaries (never the ASCII `\b` matcher, which breaks at every
diacritic), so a bare syllable that an innocent compound contains is never banned and its
compounds are listed instead (thưởng thức "to appreciate" stays legal, giải thưởng does
not). Clash Display lacks most Vietnamese letters, so Vietnamese headings share the Onest
display companion with Ukrainian.

The machine-enforced lists live in `scripts/lexicon-scan-core.ts` (`DEFAULT_BANNED_TERMS`
plus `LEXICON_PROFILES`, one per translated locale); the frozen glossaries with rationale
and more mappings are `docs/i18n/glossary-zh.md`, `glossary-zh-TW.md`, `glossary-zh-HK.md`,
`glossary-uk.md`, `glossary-ko.md`, and `glossary-ja.md`. The allow pragmas (`// lexicon-allow-start` … `// lexicon-allow-end`,
`// lexicon-allow-abi`, `// lexicon-allow-backend-type`) are reserved for FAQ/legal denial
copy ("this is not a lottery"), ABI method names, and sealed backend wire-format fields;
JSON catalogs, which cannot carry pragmas, use `\uXXXX` escapes for the same denial copy.
Do not use either to sneak ordinary copy past the scanner.

## Multilingual content rules

Every user-visible string ships in every locale in the same change:

- UI strings: `messages/<locale>/*.json` for every locale in `routing.locales`, identical
  key sets. ICU plural blocks carry every category the locale's `Intl.PluralRules`
  defines (`one/other` for en, `other` for zh, ko, and ja, `one/few/many/other` for uk) — the
  `i18n:strict` gate and `i18n/__tests__/catalog-integrity.test.ts` check this, along
  with placeholder parity and ICU syntax.
- Page copy: `content/<area>/structure.ts` holds the locale-independent skeleton (ids, hrefs,
  icons, anchors) once; `text.<locale>.ts` modules hold only copy, keyed by those ids and
  typed so a missing or invented id fails to compile. `content/about/` is small enough to
  keep plain `<locale>.ts`.
- Legal and trust pages: per-locale copy objects `content/legal/*.<locale>.ts` rendered by
  the shared `TermsContent`, `PrivacyContent`, and `TrustPageContent` components
- Routing is next-intl: `en` is unprefixed, every other locale lives under its prefix
  (`/zh`, `/zh-TW`, `/zh-HK`, `/uk`, `/ko`, `/ja`, `/vi`) on both hosts (`i18n/routing.ts`). Locale codes are
  canonical BCP 47 tags: the bare language code is the CLDR default variant, further
  variants carry their region; `LOCALE_ALIASES` lists extra tags a locale serves.
- Never branch on a locale literal (`locale === 'zh'`) and never truncate a locale to its
  language (`zh-TW` is not `zh`). Per-locale values live in a `LocaleRecord<T>`
  (`i18n/locale.ts`) resolved with `pickByLocale`, whose `normalizeLocale` resolves exact
  codes, aliases, then the best same-language variant; cross-cutting conventions (Intl
  tag, `og:locale`, JSON-LD `inLanguage`, text direction, word spacing, ellipsis) come
  from `i18n/localeConfig.ts`. Adding a locale to `routing.locales` then turns every
  registry into a compile error until it has an entry (`docs/i18n/README.md` §10 is the
  checklist). In CSS, target a language with `html:lang(zh)` (matches every variant) and
  a variant with `html:lang(zh-TW)`; never `html[lang='zh']`.
- Tests derive locale expectations from `routing.locales` / `TRANSLATED_LOCALES`
  (`test-utils/i18n.ts` builds hreflang maps); pin language-specific strings only where
  the assertion is about that language.

Translate the coined term, never the underlying banned concept. Follow the locale's
glossary exactly (one English term = one target term, everywhere) and its style guide for
tone, grammar, dates, and typography: `docs/i18n/glossary-zh.md` + `style-guide-zh.md`,
`docs/i18n/glossary-uk.md` + `style-guide-uk.md`, `docs/i18n/glossary-ko.md` + `style-guide-ko.md`,
`docs/i18n/glossary-ja.md` + `style-guide-ja.md`.

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
- Translated headings and chrome strings are pinned by e2e specs (`e2e/zh-*.spec.ts`,
  `e2e/locale-fixtures.ts` for every translated locale); check before rewording page
  titles or nav labels.

## Stack notes

- Tailwind CSS v4 + shadcn/ui + lucide-react. No Material UI.
- Typography utilities in `styles/typography.css`: `type-display-*`, `type-eyebrow`,
  `type-body-*`. The display face is `--display-font-stack` (Clash Display, then the
  `--cjk-font-stack` for CJK glyphs — Noto Sans SC by default, swapped to the TC / HK / KR
  cut by `html:lang(zh-TW)` / `html:lang(zh-HK)` / `html:lang(ko)` / `html:lang(ja)` because each region
  has its own glyph standard; `html:lang(uk)` / `html:lang(vi)` swap the whole display
  stack to Onest because Clash has no Cyrillic and few Vietnamese letters). Each locale's
  companion face is declared in `LOCALE_COMPANION_FONTS` (`lib/fonts.ts`), and
  `lib/__tests__/display-font-coverage.test.ts` derives from the copy itself which
  alphabetic locales need one; see `docs/i18n/README.md` §5.
- The wallet stack (wagmi/RainbowKit) exists only in the `(app)` route group; keep the
  landing free of it.
- Every informational page has `generateMetadata` (titles and descriptions in
  `messages/{locale}/meta.json`) plus JsonLd breadcrumbs from `utils/jsonLd.ts`.
