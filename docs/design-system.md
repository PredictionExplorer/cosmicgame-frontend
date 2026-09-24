# Design system

The visual direction is **Black Plate, calibrated**. Every Signature hangs on its own
pure-black plate at its native 3456:2234 ratio, and the interface around it uses wall
labels, hairlines and tabular figures, so the art is the only saturated, luminous thing on
the page. Where participants make decisions, the same quiet frame becomes a calibrated
ledger. Each of the five palettes keeps its character through its atmosphere and its accent.

This document lists every token and utility the system provides. The values live in CSS.
Components use the tokens and never hard-code colours, radii or font sizes.

| File                    | Owns                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `styles/themes.css`     | Palette values and the derived colour tokens (text tiers, surfaces, rules, status, data series)      |
| `styles/tokens.css`     | Scales: radius, elevation, glass, art, spacing and layout, motion, focus, starfield; brand gradients |
| `styles/typography.css` | The `type-*` utilities                                                                               |
| `styles/global.css`     | Tailwind theme mapping, font stacks and per-script tokens, CJK rules, base styles, utilities         |
| `styles/focus-ring.css` | The keyboard focus indicator                                                                         |
| `lib/fonts.ts`          | The faces every page loads, plus the per-locale companion faces (`LOCALE_COMPANION_FONTS`)           |
| `lib/theme/config.ts`   | Palette ids, the pre-paint bootstrap and `THEME_CHROME` (browser toolbar colour per palette)         |
| `lib/typography.ts`     | A typed map of the `type-*` class names, for `cva()` recipes                                         |

The palettes and the preference lifecycle are described in [theme-system.md](theme-system.md),
and per-locale typography in [i18n/README.md §5](i18n/README.md#5-fonts).

## Colour

Palette tokens are HSL channel triplets (`233 33% 5%`). Use them as `hsl(var(--token))`,
`hsl(var(--token) / 0.5)`, or through the Tailwind utilities below. A few tokens hold a
complete colour; the table says which.

### Text: three tiers

| Token                 | Utility                 | Use                                                   | Contrast (all palettes)      |
| --------------------- | ----------------------- | ----------------------------------------------------- | ---------------------------- |
| `--foreground`        | `text-foreground`       | Body, headings, figures                               | 12:1 or more                 |
| `--muted-foreground`  | `text-muted-foreground` | Secondary copy, descriptions                          | 7.7:1 or more                |
| `--subtle-foreground` | `text-subtle`           | Labels, captions, counts, hints, units, icon controls | 5.1:1 or more, even on muted |

Pick a tier instead of dimming text with an opacity modifier (`text-white/40`,
`text-muted-foreground/60`). Opacity produced a different, usually failing, contrast in
every palette. The retired classes `text-muted-foreground/40`, `/50`, `/60` and
`text-white/40`, `/45` render in the subtle tier until their call sites move to
`text-subtle`. The shim sits in the utilities layer of `styles/global.css`, after
Tailwind's utilities and with the same specificity, so it replaces the base class while
state variants on the same element (`hover:text-primary`, `group-hover:`, `data-[…]:`)
still win.
`--muted-foreground-subtle` is an alias of `--subtle-foreground`, and so is the utility
`text-subtle-foreground`.

`text-accent` renders in `--secondary`, because `--accent` is a surface colour and drew
icons at about 1.3:1. `text-destructive` renders in `--critical`, because `--destructive`
is a fill for a white label. `bg-accent`, `bg-destructive` and the `-foreground` pairs keep
their meaning.

### Surfaces and rules

| Token              | Utility                                  | Use                                                                                |
| ------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| `--background`     | `bg-background`                          | The page                                                                           |
| `--surface-sunken` | `bg-surface-sunken`                      | Field fills, seed and formula wells (alias of `--surface-deep`)                    |
| `--surface`        | `bg-surface`                             | The one quiet group per view: a card, a panel (alias of `--card`)                  |
| `--surface-raised` | `bg-surface-raised`                      | Floating layers: popovers, menus, dialogs, sheets, the dock (alias of `--popover`) |
| `--rule`           | `border-rule`, `divide-rule`             | Structural edges, ledger header rules (alias of `--border`)                        |
| `--rule-faint`     | `border-rule-faint`, `divide-rule-faint` | Row dividers. A complete colour (a mix of border and card)                         |
| `--input`          | `border-input`                           | Every control boundary: 3:1 on background, card and popover                        |

Use at most one bordered level per region, and group content inside it with space, a
`--rule-faint` hairline or a sunken well. The surface ladder replaces white alpha fills
(`bg-white/[0.03]`, `border-white/10`), which turn the warm and teal palettes grey.

### Live state

| Token                               | Utility                                      | Use                                        |
| ----------------------------------- | -------------------------------------------- | ------------------------------------------ |
| `--positive`                        | `text-positive`, `bg-positive-surface`       | A value that is healthy or growing         |
| `--attention`                       | `text-attention`, `bg-attention-surface`     | Needs action soon                          |
| `--critical`                        | `text-critical`, `bg-critical-surface`       | Errors, failed actions                     |
| `--live`                            | `text-live`, `bg-live-surface`               | Changing right now (alias of positive)     |
| `--success`, `--warning`            | `text-success`, `text-warning`               | Aliases of positive and attention          |
| `--positive-surface` and the others | —                                            | 12% fills. Complete colours                |
| `--destructive`                     | `bg-destructive text-destructive-foreground` | Destructive button fill, white label 5.8:1 |

Status colour belongs on a value or a 6px dot, never on a static label, and always travels
with a word or an icon. Aurora's positive (leaf green) and Ember's attention (bright yellow)
are tuned away from those palettes' accents.

### Data series

`--data-1` to `--data-8` (`text-data-1`, `bg-data-3`, …) are fixed hues in every palette,
4.5:1 or more on every surface. Red is never a series. Named aliases:

| Token                                               | Series                                   |
| --------------------------------------------------- | ---------------------------------------- |
| `--track-signature`                                 | data-1 (violet)                          |
| `--track-stellar-eth`, `--track-stellar-nft`        | data-2 (sky; draw the NFT track hatched) |
| `--track-endurance`                                 | data-3 (gold)                            |
| `--track-chrono`                                    | data-4 (pink)                            |
| `--track-anchoring`                                 | data-5 (green)                           |
| `--track-public-goods`                              | data-6 (orange)                          |
| `--track-outreach`                                  | data-7 (lime)                            |
| `--track-compounding`                               | data-8 (neutral)                         |
| `--method-eth`, `--method-eth-rwlk`, `--method-cst` | data-1, data-2, data-3                   |

`--chart-1` to `--chart-5` are kept as aliases of `--data-1` to `--data-5`; new charts
name a data, track or method token instead. Where a class cannot reach (recharts `stroke`
and `fill`, inline styles), import the colour from `lib/theme/dataColors.ts`:
`GESTURE_METHOD_COLOR.eth` / `.ethRandomWalk` / `.cst`, or
`gestureMethodColor(gesture.GestureType)`.

### Art

| Token                             | Utility         | Value                                                     |
| --------------------------------- | --------------- | --------------------------------------------------------- |
| `--art-ratio`                     | `aspect-art`    | `3456 / 2234`                                             |
| `--art-ground`                    | `bg-art-ground` | Pure black                                                |
| `--art-edge`, `--art-edge-active` | —               | The plate's 1px inset edge, at rest and on hover or focus |

`art-plate` combines them: a black plate at the native ratio with the 2px print edge. Put
the image inside with `object-fit: contain`. Nothing overlays, crops, dims or tints the
artwork.

**Sizes.** The media server publishes a 640px thumbnail and the 3456px original only.
`signatureMedia` adds image-optimizer renditions at 1200 and 1920px between them
(`withOptimizedRenditions` in `lib/artRenditions`, built with next/image's
`getImageProps`), so a 720px plate at 2x or a phone at 3x fetches about 1.5× its slot
instead of the original. It is for media on a host in `images.remotePatterns` only; a
failed optimized file falls back along the plate's source chain.

### Browser chrome

`THEME_CHROME` (`lib/theme/config.ts`) holds each palette's `--background` as hex. The
pre-paint bootstrap writes it into `<meta name="theme-color">`, so the mobile toolbar
blends into the page from the first paint. A test checks the map against `themes.css`.

## Typography

Four roles, three families plus one mono:

- **Display**: Clash Display 500, only at 24px and above, and never bold. Onest replaces
  it for uk and vi. CJK glyphs come from the locale's Noto Sans cut.
- **Text**: Inter 400, 500 and 600, for body, labels, buttons and every heading of 24px or
  less.
- **Figures**: Inter with tabular, lining numerals. There is no slashed zero: the Inter
  subsets next/font serves from Google carry only the calt, ccmp, dnom, frac, locl, numr,
  pnum and tnum features, so `slashed-zero` would promise a glyph that never renders.
  Inter's narrow oval zero does not read as O; Clash's round one does, so a figure
  that could be misread ("01") is set in `type-figure-*`, never in Clash.
- **Identifiers**: JetBrains Mono, only for addresses, hashes, seeds and token numbers.

The type utilities never set a colour. Pair a label, caption or eyebrow with `text-subtle`
(or another tier) at the call site.

| Utility                        | Size           | Line | Weight | Face  | Use                                                                                                                                                                                     |
| ------------------------------ | -------------- | ---- | ------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type-display-xl`              | 40–72px        | 1    | 500    | Clash | Landing hero only: 40–64px across the column, 48–72px beside the plate from 64rem                                                                                                       |
| `type-display-lg`              | 44–72px        | 1.05 | 500    | Clash | Landing section H2s                                                                                                                                                                     |
| `type-display-md`              | 36–56px        | 1.1  | 500    | Clash | Long-form H1, detail title                                                                                                                                                              |
| `type-display-sm`              | 28–40px        | 1.15 | 500    | Clash | Every app and utility H1                                                                                                                                                                |
| `type-heading-1`               | 24–32px        | 1.2  | 500    | Clash | Large section headings                                                                                                                                                                  |
| `type-heading-2`               | 24px           | 1.25 | 500    | Clash | Section headings                                                                                                                                                                        |
| `type-section`                 | 24–28px        | 1.2  | 500    | Clash | Data-page section titles, long-form H2s                                                                                                                                                 |
| `type-heading-3`               | 18–20px        | 1.3  | 600    | Inter | Headings inside a panel or card                                                                                                                                                         |
| `type-title`                   | 16px           | 1.4  | 600    | Inter | Panel, card and dialog titles                                                                                                                                                           |
| `type-body-lg`                 | 18px           | 1.6  | 400    | Inter | Lead paragraphs                                                                                                                                                                         |
| `type-lede`                    | 18px, max 60ch | 1.55 | 400    | Inter | The one-sentence page lede under an H1                                                                                                                                                  |
| `type-prose`                   | 17px, max 66ch | 1.65 | 400    | Inter | Long-form prose (1.7 for uk and vi; 16px/1.85, 40em for CJK)                                                                                                                            |
| `type-body-md`                 | 16px           | 1.55 | 400    | Inter | Body                                                                                                                                                                                    |
| `type-body-sm`                 | 14px           | 1.5  | 400    | Inter | Dense body                                                                                                                                                                              |
| `type-label`                   | 13px           | 18px | 500    | Inter | Field, figure and ledger-header labels. Sentence case, no tracking                                                                                                                      |
| `type-eyebrow`                 | 12px           | 16px | 500    | Inter | Section and page kicker, once per section. Uppercase with 0.12em tracking (0.06em on phones), hyphenated rather than chopped in a narrow column; CJK: 13px with no case and no tracking |
| `type-caption`                 | 12px           | 1.45 | 400    | Inter | Captions, helper text, units. **The floor**. CJK: 13px/1.5, as Han, kana and Hangul need more pixels than Latin                                                                         |
| `type-figure-xl`               | 48–72px        | 1    | 400    | Inter | The single hero figure                                                                                                                                                                  |
| `type-figure-lg`               | 32px           | 1.1  | 500    | Inter | Figure strips                                                                                                                                                                           |
| `type-figure-md`               | 20px           | 1.3  | 500    | Inter | Inline readouts                                                                                                                                                                         |
| `type-figure-sm`               | 14px           | 1.4  | 500    | Inter | Ledger cells                                                                                                                                                                            |
| `type-figure-display`          | 40–56px        | 1    | 500    | Clash | A static hero figure that never ticks                                                                                                                                                   |
| `type-hash`                    | 13px           | 1.45 | 400    | Mono  | Addresses, hashes and seeds. May break anywhere                                                                                                                                         |
| `type-mono`                    | 13px           | 1.45 | 400    | Mono  | Token numbers and short ids. Never breaks                                                                                                                                               |
| `type-mono-md`, `type-mono-sm` | 14px, 12px     | —    | 500    | Mono  | Legacy. New code uses `type-hash` or `type-mono`                                                                                                                                        |

Nothing a reader needs renders below 12px. Put units in `type-caption text-subtle` and
join them to the number with U+00A0.

### Per-script tokens

`styles/global.css` sets these on `<html>`. Every display utility reads them, and so should
any module that sets display type:

| Token                      | Latin  | uk, vi | zh, ja, ko | Meaning                                                                             |
| -------------------------- | ------ | ------ | ---------- | ----------------------------------------------------------------------------------- |
| `--display-weight`         | 500    | 500    | 600        | Display and heading weight                                                          |
| `--display-weight-strong`  | 600    | 600    | 600        | The cap for bold display text                                                       |
| `--display-tracking-scale` | 1      | 0.45   | 0          | Multiplier on each tier's tracking: `calc(-0.03em * var(--display-tracking-scale))` |
| `--display-word-spacing`   | 0.06em | 0      | 0.06em     | Opens Clash's narrow word space (it also sets Latin runs in CJK headings)           |

**The `font-display` guard.** Until call sites move to `type-title`, `type-heading-3` or a
display tier, `font-display` caps `font-bold` at 600, relaxes `tracking-tight` and applies
the word spacing, so small Clash headings no longer read as one word.

### Font stacks

| Variable               | Stack                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `--body-font-stack`    | Inter, then `--cjk-font-stack`. Chinese locales start with a punctuation alias                       |
| `--display-font-stack` | Clash Display, then `--cjk-font-stack`. uk and vi use Onest then Inter                               |
| `--mono-font-stack`    | JetBrains Mono, then platform monos, then `--cjk-font-stack` (`font-mono`, `type-hash`, `type-mono`) |
| `--cjk-font-stack`     | Platform CJK faces by default. Each CJK locale puts its own Noto Sans cut first                      |

The faces every page loads (Clash Display, Inter's latin slice, JetBrains Mono without a
preload) are declared in `lib/fonts.ts`. Each locale's companion face (the Noto Sans CJK
cuts, Onest) loads only on that locale's pages, through `CompanionFontFaces`
(`components/theme/companion-fonts/`). To add a face, add a descriptor, a module and a
loader entry. `lib/__tests__/fonts-policy.test.ts` checks that the three agree.

None of the next/font calls declares a `fallback`. next/font appends that list to the
family variable, and a generic family (`sans-serif`, `system-ui`, `monospace`) resolves
per script from `lang`: ahead of `--cjk-font-stack` it caught every CJK glyph, and the
locale's Noto cut never set body text. Each stack ends in its own generic family, after
the CJK faces.

### Script rules

- **CJK**: display at 600 with no tracking. Headings use line-height 1.25 and balanced
  wrapping. Eyebrows and tracking utilities drop their Latin tracking.
- **Chinese**: headings use `word-break: keep-all`, so a balanced heading turns its line
  at punctuation (十余条轨道， / 让周期储备循轨而行。) instead of inside a word; a clause too long
  for the line still wraps through `overflow-wrap: anywhere`. That overflow break ignores
  the line-start rules, so display copy follows the BudouX model: a clause longer than
  about nine characters carries authored break points (`\u200B`, `PHRASE_BREAK` in
  `lib/phrases.ts`) between its phrases (都有一部分\u200B流向\u200B以太坊\u200B核心贡献者。),
  and the heading renders through `<PhrasedText>` (`components/ui/phrased-text.tsx`),
  which glues each closing mark to the character before it and each opening mark to the
  one after, so no line starts with 。 or ， even at an overflow. The zero-width space
  stays in the text: unlike `<wbr>` it adds no pause to Chrome's accessible name. The
  e2e site QA fails on any heading line that starts with a closing mark. Placeholders are
  set in the CJK stack.
- **Japanese**: headings, ledes, body copy (`type-body-md`, `type-body-sm`), labels,
  eyebrows, captions, buttons, tabs, summaries and definition lists use
  `word-break: auto-phrase`, and the document uses `line-break: strict`.
- **Korean**: `keep-all` everywhere, monospace included, so a counter always stays with
  its digit. Display headings take `! , . : ?` from the platform Korean face through a
  punctuation-only alias ahead of Clash, whose square period sat heavy after Hangul;
  where no Korean face is installed under the listed names (Android, Linux), the alias
  falls back to a 2 KB cut of those five marks from Noto Sans KR
  (`public/fonts/noto-sans-kr/`).
- **Vietnamese**: `type-display-xl` and `-lg` open their leading (1.12 and 1.15) so
  stacked diacritics on consecutive lines never touch.
- **Paragraphs**: `p`, `li`, `dd`, `figcaption` and `blockquote` use `text-wrap: pretty`.
- **Language islands**: an element whose own `lang` differs from the page's, such as a
  language-menu endonym, takes its own language's CJK cut.
- **Chinese punctuation**: `…` and `—` (and `“”` in zh) come from the platform's regional
  CJK face, where one is installed.

### Links

A link inside running text must not rely on hue alone.

- `link`: primary colour with a 1px underline at 45% that strengthens on hover. For inline
  links.
- `link-quiet`: underline on hover and focus only. For link lists and navigation that
  already read as links by position.
- Unstyled `<a>` elements inside `p`, `li`, `dd`, `figcaption`, `blockquote` and `td` get
  the `link` style automatically.
- `link-entity`: a link to a record (a cycle, a token, a profile) set as a value on a
  record page or in a ledger. The text keeps its colour, with a hairline underline in the
  rule colour at rest that turns solid on hover and focus. `<AddressChip variant="plain">`
  uses it for addresses.

### Touch targets

On coarse pointers every control a finger aims at is at least 44×44px and every text
link laid out as a box at least 24×24px (WCAG 2.5.5 and 2.5.8), measured on the
element's real box by `e2e/mobile-tap-targets.mobile.spec.ts`. Grow the real box; draw
a pseudo-element pad only where nothing else can reach the size.

| Tool                                                     | Where                                        | What it does                                                                                                                                                                                                         |
| -------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `touch-hit-area`                                         | `styles/global.css`                          | Padding grows the border box to 44px and an equal negative margin hands the space back, on inline and block boxes alike, so nothing moves. The focus ring moves in by the inline pad. Never on a word in a sentence. |
| `touch-link-target`                                      | `styles/global.css`                          | A 24px floor (min-block-size, min-inline-size) that inline links ignore, which is WCAG's inline exception. `link` and `link-quiet` include it.                                                                       |
| `ExplainedTerm` / `Term` `placement`                     | `components/ui/explain-popover`              | `auto` measures the trigger (`sitsInSentence`): a word in a sentence keeps its line; a standalone label, role or heading takes `touch-hit-area`. `sentence` and `standalone` override the measurement.               |
| `InfoTooltip`                                            | `components/ui/info-tooltip`                 | The absolutely positioned button is 24px on fine pointers and itself 44px on coarse ones, its ring drawn 10px inside so it hugs the icon.                                                                            |
| `Button`, `TabsTrigger`                                  | `components/ui/button`, `components/ui/tabs` | 44×44 below `sm`, width included, so an icon-only toolbar button or a one-word segment ("All") qualifies.                                                                                                            |
| `TOUCH_TARGET_EXTENDED_CLASS`                            | `lib/touch-target`                           | The ::after pad for icon controls smaller than `touch-hit-area` can lift (a 16px copy glyph), on coarse pointers. Pair with `data-touch-target="extended"`.                                                          |
| `TOUCH_TARGET_ICON_CLASS`, `…_HEIGHT_…`, `…_TEXT_LINK_…` | `lib/touch-target`                           | Width-scoped (below `sm`) size helpers for controls that can grow in the layout.                                                                                                                                     |

The audit exempts an inline `<a>` and an inline explained word only when it measures
the element inside a sentence. Two targets must not overlap: a sortable table header
with help puts 20px between its label and the ⓘ on coarse pointers, so the help's
44px box clears the sort button. An `IntersectionObserver` that must ignore the sticky
header takes `headerRootMargin()` (`lib/headerOffset`), which reads `--header-height`
(56px on phones, 72px from `sm`) instead of a hard-coded 72px.

## Shape, depth and layout

**Radius.** There are four values. `rounded-sm` and `rounded-md` resolve to `control`, and
`rounded-lg` through `rounded-3xl` resolve to `surface`, so existing call sites already
land on the scale.

| Token              | Utility           | Value | Use                                                  |
| ------------------ | ----------------- | ----- | ---------------------------------------------------- |
| `--radius-edge`    | `rounded-edge`    | 2px   | Art plates, tags and badges                          |
| `--radius-control` | `rounded-control` | 8px   | Buttons, fields, menus, tabs (`--radius` aliases it) |
| `--radius-surface` | `rounded-surface` | 12px  | Cards, dialogs, sheets, link cards                   |
| `--radius-pill`    | `rounded-pill`    | full  | The live status pill, segmented control track        |

`--radius-field` and `--radius-button` alias `control`, and `--radius-card` and
`--radius-hero` alias `surface`.

**Elevation.** `--elevation-float` (`shadow-float`) is for things that actually float:
popovers, dialogs, sheets and the dock. Page content gets no shadow and no glow.
`--elevation-1` to `--elevation-4` remain for existing call sites.

**Glass.** `--glass-fill` and `--glass-blur`, through the `glass` utility, are only for the
sticky header, the mobile dock, sheets and menus. Visitors who prefer reduced transparency
get the opaque page colour.

**Layout rhythm.** `--gutter` (16–80px) is the one content edge. `site-container` is
`min(100% - 2 × gutter, 80rem)` on both hosts, and `PageShell` draws the same edge
(a max-width plus gutter padding, so `max-w-none px-0` still opens a full-bleed page):
a page's H1 starts on the header's edge at every width, which
`e2e/content-edge.desktop.spec.ts` checks at 820, 1280, 1366 and 1600px. The header is
`--header-height` tall (56px below `sm`, where each of its controls is a 44px target, and 72px
from `sm`), and everything pinned under it (`--sticky-offset`, sticky sub-navigation, the
maintenance banner, page tops) derives from that one value. The other tokens are `--section-gap`
(landing and long-form sections), `--block-gap` (data-page blocks), `--stack-gap`,
`--row-h` (48px ledger rows), `--row-h-dense` (44px), `--measure-prose` (66ch) and
`--measure-lede` (60ch).

**Motion.** `duration-instant` (80ms), `duration-fast` (150ms), `duration-base` (240ms),
`duration-slow` (400ms), `duration-page` (560ms) and `duration-settle` (900ms, a changed
live value washing back to foreground). The easings are `ease-out-expo` and
`ease-gallery`. There are no springs: `--ease-spring` is an alias of `ease-out-expo`. A
live dot fades in and out over 2.4s and never grows.

**Overlay motion.** Dialogs, sheets, menus, popovers, tooltips and the explanation card
enter and leave through `animate-in` / `animate-out` with the modifiers `fade-in-*`,
`fade-out-*`, `zoom-in-*` (`zoom-in-[0.98]` too), `zoom-out-*`, `slide-in-from-{side}-*`,
`slide-out-to-{side}-*` and the whole-panel `slide-in-from-{side}` / `slide-out-to-{side}`
(the tailwindcss-animate names, defined in `styles/global.css` with no dependency). They
read `duration-*` and `ease-*`, default to `duration-fast` with `ease-out-expo` in and
`ease-out-soft` out, and run only under `prefers-reduced-motion: no-preference`: a
reduced-motion visitor sees overlays appear and go at once.

## Focus

Keyboard focus is a 2px solid outline in the palette's `--ring` colour, offset 2px from the
element (`styles/focus-ring.css`). It survives `shadow-*` utilities and forced-colors mode,
where it becomes a `Highlight` outline that no utility can remove. Menu and option items,
and focusable children of an `overflow-hidden` container, draw the ring just inside
themselves.

- `focus-ring-inset`: draw the ring inside the element.
- `focus-ring-within`: ring a container while something inside it has keyboard focus.
- `focus-ring-none`: the component draws its own indicator.

The ring's colour, width and offset are set at rest, so on focus only the outline style
changes; under `transition-all` the outline switches at once instead of growing from 0px.
Two cases the automatic rules cannot see:

- A link that absolutely positioned siblings paint over (a vignette, a hue strip, a
  badge): put `focus-ring-within` on the container and `focus-ring-none` on the link, as
  the gallery's featured plate does.
- Segments of a rounded bar: round the end segments with `first:rounded-l-full` and
  `last:rounded-r-full` instead of clipping the bar with `overflow-hidden`, and give
  dimmed segments `focus-visible:opacity-100`, since opacity fades an element's outline
  too.

A bare `outline-none` no longer removes the keyboard indicator. Do not add
`focus-visible:outline-none focus-visible:ring-*`; the shared outline already covers the
element.

## Backdrop

`AmbientBackdrop` (`components/ui/ambient-backdrop.tsx`) is static CSS: the palette's
atmosphere gradient at its `--atmosphere-strength`, scaled by the variant.

| Variant               | Strength                 | Use                                                                    |
| --------------------- | ------------------------ | ---------------------------------------------------------------------- |
| `hero`                | 100%, plus the starfield | Landing hero, app home                                                 |
| `subtle`, `signature` | 40%                      | Data and long-form pages (`signature` is kept for existing call sites) |
| `none`                | 0                        | Lights down: detail pages, the fullscreen viewer                       |

The starfield (`--starfield`, the `starfield` utility) is about 40 static points in the
palette's foreground colour. It is masked to the gutters outside the content column
(`--starfield-column`, 100rem by default: the app home's control desk), so it never sits
behind text. There is no canvas and no motion.

## Tables

Every ledger is a `<DataTable>` (`@/components/ui/data-table`). It sits on the
`ResponsiveTable*` primitives in `components/ui/responsive-table.tsx`, and
`styles/tables.css` owns the layout. Static, server-rendered tables such as the white
paper's use `<Table>` from `components/ui/table.tsx`, which draws the same `.cs-table`.
Name a static table after the heading it sits under (`labelledBy="<heading id>"`); its
scroll container, like DataTable's, becomes a focusable, named region only while the
table is wider than its column.

**Column kinds.** A column declares what it holds, and the kind sets its alignment,
wrapping, figures, renderer and first sort direction. Alignment reaches the header and
its cells as one `data-align`, so the two cannot disagree.

| Kind                                     | Align  | Renders with                          |
| ---------------------------------------- | ------ | ------------------------------------- |
| `text`, `link`                           | start  | text, or a same-tab `Link`            |
| `address`                                | start  | `<AddressChip variant="plain">`       |
| `datetime`                               | start  | `<DateTime>`, linked to its tx proof  |
| `amount`, `count`, `percent`, `duration` | end    | the wave-1 formatters, tabular        |
| `status`                                 | center | a status icon (the only centred kind) |

`cell` replaces the renderer while the kind keeps the alignment. `value` is what sorts,
and blank values sort last in both directions. Give `align` only to an unusual column.

**Headers.** A header says what its column holds in a few sentence-case words
("Anchored now", "Distributed (ETH)"), and the same words label the value in a phone
record: give `label` only when the header is not a string or sits under a group. Keep
`help` for a derived figure whose header cannot say how it is computed ("ETH received",
"Largest Signature Allocation"); a column that names an address or a plain count needs
none. Consecutive columns that share a word or a unit take a `group` heading, a row
above that spans them ("ETH by track" over Signature Allocation, Chrono-Warrior, …), so
each sub-header stays on one or two lines; give each grouped column a `label` that reads
alone ("Chrono-Warrior (ETH)") for its phone record.

**Width.** With `width="auto"` (the default) a short ledger, four columns or fewer, stops
at one reading width, 56rem, so a row is not a 1,200px scan from its address to its
figure and short ledgers stacked on a page share a right edge. `width="fill"` runs the
full width (a moderation list whose message takes what is left). A page that stacks
short and wide ledgers sets one width for all of them with `<DataTableWidth value="fill">`
(the anchoring tabs); a table's own `width` still wins. Only the table stops at the
reading width: its empty and error states take the section's full width, so they stay
centred on it.

**Amounts.** An amount column prints the table precision (ETH 4 digits, CST 2), zero
included ("0.0000" under "0.1562"). Dust too small for it reads as a bound ("<0.0001")
in the subtle tier, with the exact value on hover.

**Free text.** A message in a cell goes through `ClampedText`
(`components/tables/ClampedText`): two lines from `sm` with a "Show all" disclosure,
the whole text in a phone record, and `overflow-wrap: anywhere`, so a run with no
spaces never widens its column. Never hide the rest of a value behind a hover tooltip.

**Phones.** Below 40em each row becomes a record in a stacked list: records are divided
by one `--rule`, with no box, fill or rule inside them. The label (the column header in
sentence case, 13px, `text-subtle`) sits at the start and the 14px value at the end, and
anything inside a value wraps between words rather than push the record past the
screen. `stack` puts long text under its label. Blank cells and `priority: 'secondary'`
columns drop out, so no empty labelled line is left behind. The connected wallet's
record carries its 2px accent rule down the start edge.

The records keep table semantics: every part of `ResponsiveTable` and the static `Table`
states its role (`table`, `rowgroup`, `row`, `columnheader`, `cell`), because WebKit drops
the implicit roles of a table restyled with `display: block`, and the drawn label has
empty alternative text (`content: attr(data-label) / ''`), so a screen reader hears the
column header once rather than twice. A table built from raw `<tr>`/`<td>` inside these
primitives states the same roles.

A table stays a real table on phones (`layout="compact"`) only when every column a phone
shows is a compact kind (`address`, `link`, `amount`, `count`, `percent`, `status`) and
there are at most three: `phoneLayoutFor` decides it from the columns. A date, a
duration or free text needs a record line's width, so any table holding one reads as
records. Because a panel's padding or a locale's longer words can still push three
short columns past a 320px screen, an automatic compact table that turns out wider than
its column on a phone becomes records before it paints (`useCompactFit`). Pass `layout`
only to pin a choice; a pinned layout is never overridden. Compact cells keep a 0.25rem
inset at both ends so a focused link's outline (2px, 2px out) stays inside the scroll
container.

**States.** `loading` draws skeleton rows at the real row height. `error` with `onRetry`
shows an `ErrorState` with a retry button, and an empty list shows an `EmptyState`
(`emptyTitle`, `emptyDescription`, `emptyAction`). Their titles sit one level under the
table's `title` (an `h2` title gives an `h3` state), or at `headingLevel` when the table
has no title, so the outline never skips a level. A table never shows a bare "No data"
line.

**Pages.** 20 rows a page, or 10 on a phone. `TablePagination` shows Previous and Next
with the range ("1–20 of 1,140") and hides itself when everything fits on one page. The
visible range is not a live region, because a live table's total changes on its own; a
screen reader hears the new range once, after the reader pages. "Go to page" commits on
Enter or when the field is left, never per keystroke.

**Sorting.** A header click cycles its column through the kind's first direction, the
other direction, and back to the table's own order (`initialSort`). When the table's
own order already sorts that column, a click turns it around, so every click changes
something. A sorted header's arrow sits in the label's line of text, so a wrapping label
keeps it beside the words. An unsorted sortable header shows a faint two-way arrow in
its padding on hover and keyboard focus, so nothing moves. A ledger that arrives in an
order (newest first, most anchored first) declares it with `initialSort`, so its header
shows the arrow and the reader knows the order.

**Links.** `getRowHref` makes the first column's value (or `rowLinkColumn`'s) a real
same-tab link, and a click anywhere else on the row follows it too. `getRowLabel` adds
the words a screen reader hears after the link's visible text ("Sep 24, 07:31:51" then
"Gesture #1143", the number the destination shows); it never replaces them, so the name
always starts with what a voice user sees (WCAG 2.5.3). Leave it out when the visible
text already names the destination ("Cycle 12"). `TableLink` covers other internal links
in a cell and `TxProofLink` covers explorer proof (a new tab, announced). Addresses go
through the `address` kind, never a hand-built explorer URL. A cycle number reads
"Cycle 12", never a bare "12", and takes its destination from `useCycleHref`
(`components/tables/useCycleHref`): the live cycle leads to /current-cycle, a finalized
one to its allocation record. A dense ledger whose every row carries several links
passes `links="quiet"`: they keep their ink and underline only on hover and focus.

**Notes.** `notice` is a line under the title that shows in every state, loading and
error included (a read-only notice), so it never moves the table when rows arrive.
`caption` puts a note beside the row range, after the time zone ("Muted amounts are
allocations of less than 0.01 CST"); keep it to one line of `type-caption`.

**One frame.** A table inside a panel or section uses the section's frame. Pass
`variant="framed"` to `ResponsiveTableContainer` only for a table that stands alone.

**The connected wallet.** `isCurrentRow` marks the wallet's row with a 2px accent rule
and a "You" tag, and the row keeps its ranked place. A line above the table gives the
position ("#3 of 37") and a "Show my row" button that jumps to its page.
`currentRowSummary` adds figures to that line. Never append "(You)" to the address
text.

## Copy

Catalogs carry the text exactly as it renders; nothing transforms case. In English:

- **Sentence case** for headings, labels, buttons, tabs and table headers: "Make a
  gesture", "Number of gestures", "Gesture type".
- **Common nouns stay lower case** after the start of a sentence: gesture, cycle,
  allocation, recipient. "a new gesture", "ETH and CST gestures", "Cycle 12" (a
  numbered cycle is a name, like "Chapter 12").
- **Named quantities, reserves, windows and roles keep their capitals**: Gesture Cost,
  Gesture Chat, Cycle Finalization Time, Cycle Reserve, Calibration Window, Signature
  Allocation, Stellar Selection, Endurance Champion, Chrono-Warrior, the Last Gesture
  (the role: "You hold the Last Gesture"), the Final CST Gesture.
- **Random Walk NFT** is two words in every locale; `RandomWalk` is only the contract's
  name (`contracts.entries.*.name`, `formats.address.known.randomWalk`).

`i18n/__tests__/english-copy.test.ts` enforces the last two rules; its allowlist holds
the strings a parallel change still owned, and may only shrink.

## Retired patterns

`styles/__tests__/token-usage.test.ts` counts these in `app/` and `components/`, and the
counts may only fall. When a change removes some, lower the baseline in the same change.

| Instead of                                                | Use                                                                   |
| --------------------------------------------------------- | --------------------------------------------------------------------- |
| `text-muted-foreground/60`, `text-white/45` (60% or less) | `text-subtle`                                                         |
| `text-[9px]`, `text-[10px]`, `text-[11px]`                | `type-caption`, `type-label`                                          |
| `bg-white/[0.03]`, `border-white/10`                      | `bg-surface-sunken`, `bg-surface`, `border-rule`, `border-rule-faint` |
| `focus-visible:outline-none focus-visible:ring-2`         | The shared outline, `focus-ring-inset`, `focus-ring-within`           |
| `font-display text-lg font-bold`                          | `type-title` or `type-heading-3`; a display tier from 24px            |
| `text-emerald-*`, `text-amber-*` on static labels         | `text-subtle` for the label, a status token on the value              |
| Hand-rolled uppercase labels with `tracking-[0.2em]`      | `type-label`, or `type-eyebrow` once per section                      |
| Clash or mono for amounts and durations                   | `type-figure-*`                                                       |
| `rounded-[var(--radius-card)]`                            | `rounded-surface`                                                     |
| Gavel, ticket, trophy, crown, sword, gift, dice icons     | The concept's icon from `lib/conceptIcons` (ESLint enforces it)       |
| `capitalize` on a button label                            | The label written in sentence case in the catalog                     |
| A hand-built pill (`rounded-full px-2 text-[10px]`)       | `Badge` with a `tone`                                                 |
| An ⓘ after every label                                    | `Term` or `ExplainedTerm` on the word; one `InfoTooltip` per section  |
| A one-line "Loading…" panel                               | The skeleton of the layout it replaces                                |
| `max-w-7xl px-5 lg:px-12` on a section                    | `Container` (`site-container`)                                        |
| An `::after` touch pad on a word or label                 | `touch-hit-area` (the real box), or `ExplainedTerm`'s own placement   |

## Component inventory

The primitives every page composes from, one per job. Import from `components/ui`
(or `lib/conceptIcons` for icons). When a page needs something this list does not
cover, extend the primitive with a variant or an optional prop; do not build a
parallel one. (The old `components/styled` wrappers are gone; each had a row below.)

### Actions

| Primitive        | Import                 | Use                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`         | `components/ui/button` | Every action that is not a link in running text. `variant`: `default` (solid primary), `commit` (the signature gradient, the one action a view exists for: make a gesture, imprint, retrieve, finalize; at most one per view), `secondary`, `outline`, `ghost`, `quiet`, `link`, `destructive`. `size`: `sm`, `default`, `lg`, `xl` (56px commit in the dock and forms), `icon`. `loading` keeps the label and keyboard focus beside a spinner: the button is `aria-busy` and `aria-disabled` and ignores presses, never natively `disabled` (native `disabled` is for real unavailability). `aria-pressed` shows a held toggle. |
| `buttonVariants` | `components/ui/button` | The same recipe on a `Link` (`className={buttonVariants({ variant: 'outline' })}`), or use `<Button asChild>`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

Labels are authored in sentence case in every catalog and render as written; the
button never transforms case. Every variant eases colour, border, shadow, filter and
transform together and answers a press (an instant darken and a 2% settle when motion
is allowed). Touch targets reach 44px below `sm`.

### Tags, states and explanations

| Primitive           | Import                          | Use                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Badge`             | `components/ui/badge`           | A short tag or state beside a value. `tone`: `neutral` (hairline rule, the default), `accent`, `positive`, `attention`, `critical`, `live`. `size`: `sm` (12px) or `md` (13px). `mono` for token numbers, `dot` for a 6px state mark (it breathes only for `live`), `icon`, `shape="pill"` only for the live Cycle state, `overline` for a rare uppercase status (the `type-eyebrow` face, uncased in CJK by its own rule). At most two per wall label. `variant` is deprecated. |
| `Term`              | `components/ui/term`            | A coined word that explains itself from the glossary: `<Term id="calibrationWindow" />`, `<Term id="stellarSelection">Stellar Selections</Term>`. Dotted underline, short definition on hover, the long one pinned by click, tap, Enter or Space (and announced), one tab stop. The trigger is an inline `<span role="button">`, so a long term wraps with its sentence. The page must declare `'glossary'` in `<PageMessages>`.                                                 |
| `ExplainedTerm`     | `components/ui/explain-popover` | The same trigger for a word outside the glossary: `<ExplainedTerm definition="…">ERC-20</ExplainedTerm>` (`details`, `title` optional). `announce="moreInformation"` names a figure label "More information about {label}" (the /contracts figure rows use it).                                                                                                                                                                                                                  |
| `InfoTooltip`       | `components/ui/info-tooltip`    | One ⓘ per section or group, and where a decision depends on the explanation. Pass `label` at every new call site (the button is named "More information about {label}"; without it, just "More information"). A 16px icon under a 24px button that is itself 44px on coarse pointers (no pseudo-element pad); `className` still positions and colours the icon.                                                                                                                  |
| `ExplainPopover`    | `components/ui/explain-popover` | The hover-and-pin card behind all three, for a custom trigger. The definition is the trigger's description through `aria-describedby` (a `hidden` copy beside it), and pinning announces `details` through a polite live region.                                                                                                                                                                                                                                                 |
| `GLOSSARY_TERM_IDS` | `lib/glossary`                  | The 18 glossary ids and `GlossaryTermId`, server-safe: map over them in a server component with `getTranslations('glossary')`. `gesture`, `cycle`, `cycleFinalizationTime`, `calibrationWindow`, `cycleReserve`, `signatureAllocation`, `finalCstGesture`, `enduranceChampion`, `chronoWarrior`, `stellarSelection`, `anchoring`, `anchorDistribution`, `retrieve`, `imprint`, `publicGoods`, `outreachReserve`, `cosmicCouncil`, `cst`.                                         |

`messages/<locale>/glossary.json` is the single source of the coined vocabulary's
definitions (`terms.<id>.term`, `.short`, `.long`) in all 8 locales, aligned with
`docs/i18n/glossary-*.md` and the FAQ. It is a page namespace, not chrome: a page that
renders `<Term>` lists `'glossary'` in its `<PageMessages namespaces>`, and the i18n
scoping test fails until it does. Point new explanations of a coined term at it rather
than writing another definition.

### Concept icons

`lib/conceptIcons.ts` gives each coined concept one lucide glyph, used everywhere that
concept appears: Gesture `PenLine`, Performance Cycle `Orbit`, Cycle Finalization Time
`Timer`, Calibration Window `Gauge`, Cycle Reserve `Vault`, Compounding Cycle Reserve
`RotateCcw`, allocation `Layers`, recipient `UserCheck`, Signature Allocation
`Signature`, Final CST Gesture `Flag`, Endurance Champion `Hourglass`, Chrono-Warrior
`History`, Stellar Selection `Shuffle`, Anchoring `Anchor`, Anchor Distribution `Split`,
Retrieve `ArrowDownToLine`, Imprint `Stamp`, Public Goods `Sprout`, Outreach Reserve
`Megaphone`, Cosmic Council `Landmark`, ETH contribution `ArrowUpFromLine`, attached
assets `Paperclip`, CST as a token `Coins`.

Import the named export in JSX (`import { GestureIcon } from '@/lib/conceptIcons'`) so a
page bundles only its glyphs; `CONCEPT_ICONS` is for data-driven maps. Two concepts that
sit side by side never share a glyph. ESLint rejects the auction, lottery, prize and game
glyphs (gavel, tickets, dice, gamepads, trophies, medals, crowns, swords, gifts, piggy
banks, hand-coins, heart-handshakes, clovers, card suits) under every lucide alias
(`Trophy`, `TrophyIcon`, `LucideTrophy`) and from their per-icon module paths
(`OFF_LEXICON_ICON_NAMES` and `OFF_LEXICON_ICON_MODULES` in `eslint.config.mjs`).

### Sections

| Primitive       | Import                         | Use                                                                                                                                                                                                                                                                                                                           |
| --------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SectionHeader` | `components/ui/section-header` | The section-heading tier. `as` (`h2` default, `h3`, `h4`) fits the outline; `size` `page` (`type-section`) or `panel` (`type-heading-3`); `eyebrow`, `description`, one `info`, right-aligned `actions`, `headingId` for `aria-labelledby`. Server-safe.                                                                      |
| `PhrasedText`   | `components/ui/phrased-text`   | Display copy that may be Chinese: `<h2><PhrasedText>{copy.heading}</PhrasedText></h2>`. Glues each closing mark to its character (and an opening mark to the next) with an inline nowrap span, so no line starts with 。 or ，; the copy's authored `\u200B` break points stay in the text. Other scripts render as they are. |

### Layout and surfaces

| Primitive    | Import                      | Use                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Container`  | `components/ui/container`   | The content edge. `size="site"` (the default: `site-container`, the header's and footer's edge), `wide` (90rem, the app-home desk only), `reading` (one prose measure). Legacy fixed sizes remain, deprecated. Never hand-roll `max-w-7xl px-*` on a section.                                                                                                                        |
| `PageShell`  | `components/ui/page-shell`  | The page's `<main>` and backdrop.                                                                                                                                                                                                                                                                                                                                                    |
| `Surface`    | `components/ui/surface`     | `plain`, `quiet` (a fill, no border: the one control group), `outlined` (the default: one hairline on a faint surface), `raised` (floating layers). Old variants are aliases on the token ladder. At most one bordered level per region.                                                                                                                                             |
| `ScrollRail` | `components/ui/scroll-rail` | One row that scrolls sideways with edge fades only while there is more that way, keeping the current item (`data-state="active"`, `aria-current="page"`, `aria-selected`) in view. For tabs, sub-navigation and chip rows. A row with nothing focusable in it (steps, figures) makes its track focusable while it overflows, a region named by `label`, so the arrow keys scroll it. |

### Navigation within a page

| Primitive                                 | Import               | Use                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Tabs`                                    | `components/ui/tabs` | `TabsList variant`: `segmented` (the default: views of one thing, a sunken track with no border; the selected segment is raised with a hairline edge and draws no primary rule, so it never competes with an underline row above it), `underline` (page sub-navigation), `pills` (short sets and filters); `scroll` puts the row on a `ScrollRail`, at least the rail's width so an underline row's rule spans the column. Pick the variant rather than reshaping a list with classes. Radix keeps arrow keys, Home, End and one tab stop. |
| `tabsListVariants`, `tabsTriggerVariants` | `components/ui/tabs` | The same look for link-based sub-navigation: mark the current link `aria-current="page"`.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

### Forms

| Primitive                          | Import                                      | Use                                                                                                                                                                                                          |
| ---------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Input`, `MessageTextarea`         | `components/ui/input`, `…/message-textarea` | A sunken field with the 3:1 `--input` edge and 16px text below `sm` (iOS does not zoom). Shared recipe: `fieldSurface` in `components/ui/item-highlight`.                                                    |
| `SearchField`                      | `components/ui/search-field`                | The one search input: the icon above the fill, a clear button (`clearLabel`), an optional ⌘K / Ctrl K `shortcutKey`, `size` `md` or `lg`. Pair with `<Button type="submit">` when the search runs on submit. |
| `Select`                           | `components/ui/select`                      | The field surface for the trigger; options mark `data-highlighted` with a primary fill and a 2px bar (6.5:1 or more in every palette), so keyboard focus is always visible.                                  |
| `DropdownMenu`                     | `components/ui/dropdown-menu`               | Menus share the same highlighted row (`itemHighlight`) and floating surface (`floatingSurface`).                                                                                                             |
| `Checkbox`, `RadioGroup`, `Switch` | `components/ui/…`                           | A 2px-cornered box (it reads as a checkbox, not a radio), a round radio, a switch; all on the shared focus outline.                                                                                          |

### Loading, empty and error

| Primitive      | Import                         | Use                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skeletons      | `components/ui/skeleton`       | Placeholders in the shape and at the height of what they replace: `SkeletonTable` (ledger rows plus the phone card layout), `SkeletonDetailRows`, `SkeletonStatGrid`, `SkeletonStatCard`, `SkeletonPageHeader`, `SkeletonArtPlate`, `SkeletonChart`, `SkeletonNFTCard`, `SkeletonText`. Each announces once; pass `announce={false}` inside a skeleton that already does. |
| Page skeletons | `components/ui/page-skeletons` | Route-level `loading.tsx` bodies for record pages: `RecordDetailSkeleton`, `LedgerPageSkeleton`, `NftDetailSkeleton`, `ProfileSkeleton`, `CycleAllocationSkeleton`, `SkeletonSectionCard`.                                                                                                                                                                                |
| `EmptyState`   | `components/ui/empty-state`    | Nothing here yet, and what would fill it. `variant` `page`, `panel` (the default) or `inline`; `headingLevel` 2–4.                                                                                                                                                                                                                                                        |
| `ErrorState`   | `components/ui/error-state`    | Something could not be read or done, with a retry. Same variants; status colour on the icon tile only.                                                                                                                                                                                                                                                                    |
| `UnknownValue` | `components/ui/unknown-value`  | A figure that could not be read: a dash with a screen-reader label, never `0`.                                                                                                                                                                                                                                                                                            |

### Overlays

| Primitive                 | Import                                        | Use                                                                                                                                                                                                                                                                          |
| ------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Dialog`, `Sheet`         | `components/ui/dialog`, `components/ui/sheet` | On the raised surface with the float shadow (dialogs at the surface radius). The close control renders first in the DOM, so focus order matches the corner it paints in; `OVERLAY_CLOSE_CLASS` is its shared look (44px on phones, 24px from `sm`). Titles are `type-title`. |
| `DropdownMenu`, `Popover` | `components/ui/…`                             | Floating surface and highlight from `item-highlight`. A menu reads only its items: wire explanatory text in with `aria-describedby` (the palette menu does), never as stray paragraphs.                                                                                      |

### Data and identifiers (wave 1)

`Amount`, `DateTime`, `Duration`, `AddressChip`, `LiveStatus`, `TxStatus`,
`ResponsiveTable` and `Pagination` are documented with the formatting layer and the
transaction kit; see `docs/` and each module's header. Three rules to know:

- **Dates.** Every date is in the reader's zone. A table states it once
  (`<TimeZoneNote>`); a date that stands alone, a record page or a header figure, prints
  it with `<DateTime showZone>` ("Sep 22, 2026, 23:04:45 UTC-5"), which sets the zone like
  a unit (subtle, proportional figures) inside the locale's own template ("9月22日
  23:04（UTC-5）"); `formatZonedDateTimeParts` gives the same three parts to other markup.
  Only the compact style pads a one-digit day ("Jan 05") so a column lines up; the full
  style writes it as is.
- **Signed amounts.** `formatAmount` with any `signDisplay` prints the true minus sign
  (U+2212), level with the "+" beside it.
- **Class merging.** `cn()` knows the `type-*` tiers: a later tier replaces an earlier
  one and a primitive's default size, weight, leading and tracking, so a caller's
  `type-heading-3` wins over `text-lg font-semibold`. A later `text-sm` still overrides a
  tier's size, and a face (`font-mono`) is left to the cascade.

## Tests

- `styles/__tests__/palette-contrast.test.ts` parses `themes.css` and checks every text,
  control, status and data token against WCAG 2.2 AA on background, card, popover and muted,
  in all five palettes.
- `styles/__tests__/token-usage.test.ts` is the ratchet on retired patterns.
- `styles/__tests__/focus-ring.test.ts` checks the outline recipe, the at-rest ring, the
  `transition-all` rule and the forced-colors fallback.
- `styles/__tests__/global-css.test.ts` checks the site-wide guarantees: the dimmed-text
  shim (compiled through Tailwind, to prove its layer, order and specificity), the display
  guard, the 12px floor, the CJK eyebrow reset, figure faces and numerals, display tokens,
  the content edge, the touch utilities and the overlay motion (compiled, so the
  reduced-motion condition is proven).
- `e2e/mobile-tap-targets.mobile.spec.ts` measures every control's real box on a phone;
  `e2e/content-edge.desktop.spec.ts` checks the H1 against the header's edge.
- `styles/__tests__/tables-css.test.ts` pins the ledger layout: shared alignment, tabular
  figures, phone records, dropped blank and secondary lines, the scroll cue and print.
- `components/ui/data-table/__tests__/` covers column kinds, sorting, paging, states and
  the phone layouts.
- `lib/theme/__tests__/dataColors.test.ts` ties the chart colours to the method tokens.
- `lib/__tests__/fonts-policy.test.ts`, `lib/__tests__/fonts.test.ts` and
  `lib/__tests__/display-font-coverage.test.ts` cover font delivery and script coverage.
- `lib/theme/__tests__/config.test.ts` pins `THEME_CHROME` to the palettes.
- `lib/__tests__/conceptIcons.test.ts` keeps one distinct, lexicon-safe glyph per concept and
  checks the ESLint name and module patterns against lucide's real exports.
- `components/ui/__tests__/term.test.tsx` checks the glossary in all 8 locales (every term
  with a term, short and long definition) and the Term interaction: an inline trigger,
  Enter and Space, the hidden description and the announced details.
- `components/ui/__tests__/page-skeletons.test.tsx` checks that every dynamic record route
  has a `loading.tsx`.
