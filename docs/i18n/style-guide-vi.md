# Vietnamese Style Guide (Tiếng Việt)

Rules for making the Vietnamese read as if originally written in Vietnamese.
Literal translation is a defect. Terminology lives in
[glossary-vi.md](./glossary-vi.md); this guide covers everything else.
Conventions a regular expression can check are encoded in
`LOCALE_CONVENTIONS['vi']` (`scripts/i18n-conventions-core.ts`).

## 1. Transcreate, don't translate

## 2. Register and voice

Decide the register (formality level, how the reader is addressed, imperative forms for
buttons) once, here, and use it everywhere.

## 3. Grammar patterns

Sentence structure, agreement, how interpolated values (`{amount} ETH`, `{count}`)
sit in a sentence without breaking grammar.

## 4. Mechanics: punctuation, spacing, typography

Quotation marks, dashes, ellipsis, spacing around Latin tokens and numbers, capitalization.

## 5. Dates, times, numbers, units

Digit grouping, decimal mark, 12/24-hour time, date order, duration units
(`messages/vi/formats.json`), and which units stay in English (ETH, CST).

## 6. UI constraints

Length budgets for buttons, nav items, table headers, and tooltips; how to shorten.

## 7. ICU messages in Vietnamese

The plural categories `Intl.PluralRules('vi')` defines (every one must appear in
each plural block), ordinals, and the placeholder rules.

## 8. Review: the two-pass rule

Pass 1 checks against the English (glossary, facts, placeholders). Pass 2 reads the
Vietnamese **without the English open** and edits anything that sounds translated.

## 9. Worked example — a full FAQ entry
