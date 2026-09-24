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
- **Figures**: Inter with tabular, lining numerals and a slashed zero.
- **Identifiers**: JetBrains Mono, only for addresses, hashes, seeds and token numbers.

The type utilities never set a colour. Pair a label, caption or eyebrow with `text-subtle`
(or another tier) at the call site.

| Utility                        | Size           | Line | Weight | Face  | Use                                                                                                                                                                                     |
| ------------------------------ | -------------- | ---- | ------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type-display-xl`              | 56–92px        | 1    | 500    | Clash | Landing hero only                                                                                                                                                                       |
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
| `type-caption`                 | 12px           | 1.45 | 400    | Inter | Captions, helper text, units. **The floor**                                                                                                                                             |
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
- **Japanese**: headings, ledes, labels, captions, buttons, tabs, summaries and definition
  lists use `word-break: auto-phrase`, and the document uses `line-break: strict`.
- **Korean**: `keep-all` everywhere, monospace included, so a counter always stays with
  its digit.
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
`min(100% - 2 × gutter, 80rem)` on both hosts. The other tokens are `--section-gap`
(landing and long-form sections), `--block-gap` (data-page blocks), `--stack-gap`,
`--row-h` (48px ledger rows), `--row-h-dense` (44px), `--measure-prose` (66ch) and
`--measure-lede` (60ch).

**Motion.** `duration-instant` (80ms), `duration-fast` (150ms), `duration-base` (240ms),
`duration-slow` (400ms), `duration-page` (560ms) and `duration-settle` (900ms, a changed
live value washing back to foreground). The easings are `ease-out-expo` and
`ease-gallery`. There are no springs: `--ease-spring` is an alias of `ease-out-expo`. A
live dot fades in and out over 2.4s and never grows.

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

**Phones.** Below 40em each row becomes a record in a stacked list: records are divided
by one `--rule`, with no box, fill or rule inside them. The label (the column header in
sentence case, 13px, `text-subtle`) sits at the start and the 14px value at the end, and
anything inside a value wraps between words rather than push the record past the
screen. `stack` puts long text under its label. Blank cells and `priority: 'secondary'`
columns drop out, so no empty labelled line is left behind. The connected wallet's
record carries its 2px accent rule down the start edge.

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
keeps it beside the words.

**Links.** `getRowHref` makes the first column's value (or `rowLinkColumn`'s) a real
same-tab link, and a click anywhere else on the row follows it too. `TableLink` covers
other internal links in a cell and `TxProofLink` covers explorer proof (a new tab,
announced). Addresses go through the `address` kind, never a hand-built explorer URL.

**One frame.** A table inside a panel or section uses the section's frame. Pass
`variant="framed"` to `ResponsiveTableContainer` only for a table that stands alone.

**The connected wallet.** `isCurrentRow` marks the wallet's row with a 2px accent rule
and a "You" tag, and the row keeps its ranked place. A line above the table gives the
position ("#3 of 37") and a "Show my row" button that jumps to its page.
`currentRowSummary` adds figures to that line. Never append "(You)" to the address
text.

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

## Tests

- `styles/__tests__/palette-contrast.test.ts` parses `themes.css` and checks every text,
  control, status and data token against WCAG 2.2 AA on background, card, popover and muted,
  in all five palettes.
- `styles/__tests__/token-usage.test.ts` is the ratchet on retired patterns.
- `styles/__tests__/focus-ring.test.ts` checks the outline recipe, the at-rest ring, the
  `transition-all` rule and the forced-colors fallback.
- `styles/__tests__/global-css.test.ts` checks the site-wide guarantees: the dimmed-text
  shim (compiled through Tailwind, to prove its layer, order and specificity), the display
  guard, the 12px floor, the CJK eyebrow reset, figure faces and numerals, display tokens
  and the content edge.
- `styles/__tests__/tables-css.test.ts` pins the ledger layout: shared alignment, tabular
  figures, phone records, dropped blank and secondary lines, the scroll cue and print.
- `components/ui/data-table/__tests__/` covers column kinds, sorting, paging, states and
  the phone layouts.
- `lib/theme/__tests__/dataColors.test.ts` ties the chart colours to the method tokens.
- `lib/__tests__/fonts-policy.test.ts`, `lib/__tests__/fonts.test.ts` and
  `lib/__tests__/display-font-coverage.test.ts` cover font delivery and script coverage.
- `lib/theme/__tests__/config.test.ts` pins `THEME_CHROME` to the palettes.
