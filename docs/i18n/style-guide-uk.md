# Ukrainian Style Guide — Стилістичні правила (українська)

How to make the Ukrainian sound like it was written in Ukrainian. Read
[glossary-uk.md](./glossary-uk.md) first — this guide assumes its terms. Machine gates
that back these rules: `npm run i18n:strict` (ICU syntax, placeholders, plural
categories), `npm run lexicon:scan`, `npm run terminology:check`.

---

## 1. Transcreate, don't translate

The English copy is already a transcreation layer over the protocol mechanics. The
Ukrainian must serve the same _intent_ with Ukrainian sentence rhythm — not mirror the
English word order. Ask "how would a Ukrainian art institution or a good fintech app say
this?", then write that.

- Restructure freely: split or merge sentences, move the verb, drop English filler
  ("simply", "just", "actually").
- Keep every fact, number, link, and placeholder. Nothing is added, nothing is lost.
- Wordplay and idioms are re-created, not transliterated. `E<legacy>arn</legacy> Rewards`
  has no Ukrainian equivalent; write the intended meaning and drop the tag (the
  catalog gate allows a dropped tag, never an invented one).

## 2. Register and voice

- **Address:** formal **ви**, always lowercase (modern Ukrainian UX convention). Never
  ти, never the capitalized Ви of business letters.
- **Tone:** calm, precise, art-institution. No hype, no exclamation marks in UI chrome,
  no emoji, no meme slang.
- **Buttons and CTAs:** infinitive verbs — Зробити жест · Забрати · Під’єднати гаманець ·
  Переглянути на Arbiscan. Never nouns for actions (not «Підключення»).
- **Nav items, headings, table headers:** nominative nouns in sentence case — Поточний
  цикл · Мої розподіли · Кількість жестів.
- **Status and empty states:** short, factual, present tense — Немає даних · Завантаження…
  · Транзакцію підтверджено.
- **Errors:** say what happened and what to do, without blame — Не вдалося завантажити
  дані. Спробуйте пізніше.
- **Legal and risk copy:** neutral, complete sentences, the same denials the English
  makes, inside `lexicon-allow` pragmas where a banned word must be named.

Tone by surface:

| Surface                 | Voice                                                    |
| ----------------------- | -------------------------------------------------------- |
| Landing hero, OG images | evocative, short, imperative-free statements             |
| dApp chrome, tables     | terse, nominal, consistent                               |
| Tooltips, FAQ, Learn    | explanatory, second person plural, one idea per sentence |
| Toasts                  | one clause, past tense for results, present for waits    |
| Legal                   | formal register, no contractions of meaning              |

## 3. Grammar patterns

Ukrainian has seven cases and three genders; interpolated values have none. Design every
ICU message so that **every placeholder sits in the nominative** and needs no agreement:

| Avoid (needs a case the value cannot take) | Write instead                          |
| ------------------------------------------ | -------------------------------------- |
| Розподіл {name}-а                          | Розподіл: {name}                       |
| у {cycle}-му циклі                         | Цикл {cycle}                           |
| надіслано {address}-у                      | Отримувач: {address}                   |
| {count} жестів (fixed form)                | {count, plural, …} with all categories |

- **Numbers with nouns** always go through ICU plural (see §7). Never hardcode a single
  form after a placeholder.
- **Latin abbreviations** (ETH, CST, NFT, ERC-20) are indeclinable: у CST, за ETH, з
  двома NFT. Compounds take a hyphen: ETH-жест, CST-жест, NFT-колекція, ончейн-мистецтво.
- **Adjective + Latin noun:** agree with the implied Ukrainian noun — закріплені NFT
  (токени → plural), перший ETH-жест (masculine, from жест).
- **Ordinal numbers** in prose are spelled with a hyphenated ending only where the
  English does (4-го порядку); UI labels prefer cardinal: Цикл 12.
- **Participants have no known gender.** Prefer constructions that avoid past-tense
  gender agreement with the user: «Жест зроблено» rather than «Ви зробили» when the
  sentence is about the result; when addressing the reader directly, ви + plural
  agreement is always correct (ви зробили).
- **Negation:** use the natural double negative (Ніхто не може змінити…) — it is
  correct Ukrainian, not an error.
- Prefer verbs over verbal-noun chains: «коли цикл завершується» rather than «у момент
  завершення циклу», unless the label is a noun phrase by design.

## 4. Mechanics: punctuation, spacing, typography

- **Apostrophe:** always the typographic ’ (U+2019): п’ять, ім’я, під’єднати, об’єкт,
  зв’язок. Never the ASCII `'` — it is also the ICU escape character.
- **Quotation marks:** «…» (guillemets); nested quotes use „…“. Never straight `"` in
  copy (JSON escaping aside).
- **Dash:** em dash — (U+2014) with spaces on both sides for clauses; en dash – for
  ranges (0–100, 2–4 години). Hyphen only inside words.
- **Ellipsis:** the single character … (U+2026), no space before it: Завантаження…
- **No space** before `: ; ? ! , .`; one space after.
- **Percent:** no space before % (50%). This matches the on-screen formatters and the
  numeric-claims test that pins every percentage to `protocol-facts.ts`.
- **Decimals in token amounts:** keep the dot the formatters print (0.0001 ETH, 1.5 CST)
  so prose matches the UI and the numeric-claims regex. Ukrainian comma decimals appear
  only where `Intl.NumberFormat('uk-UA')` produces them (tables, grouped numbers).
- **Thousands** in prose: a no-break space (U+00A0), which is also what Intl produces —
  1 000 CST, 24 000 CST, 1 000 000. Never the English comma (1,000 reads as a decimal
  in Ukrainian). The numeric-claims test accepts both separators, so the guard still
  pins the amount to `protocol-facts.ts`.
- **Units:** number, space, unit — 48 годин, 5 ETH, 1 000 CST. Compact duration units
  glue to the number (1д 2год 30хв, `formats.durationCompact`).
- **Capitalization:** sentence case everywhere. Only the first word of a heading or
  label is capitalized: Поточний цикл, Мої розподіли. Proper names keep their capitals:
  Космічна Рада, Сигнатура (the artwork), Воїн часу, Чемпіон витривалості. Coined common
  nouns stay lowercase mid-sentence (жест, розподіл, зоряний відбір, закріплення).
- **Cyrillic–Latin mixing:** never mix scripts inside one word (no Latin «a» in a
  Ukrainian word); `scripts/terminology/uk.ts` variants are Cyrillic-only.
- **Ґ, Є, І, Ї** are letters, not decorations: ґрунт, є, їх — use them where the word
  demands them.

## 5. Dates, times, numbers, units

Formatting is code, not copy (`i18n/localeConfig.ts` → `intlLocale: 'uk-UA'`,
`utils/format.ts`, `utils/time.ts`). What the code renders:

| Context                                | Rendering                                   |
| -------------------------------------- | ------------------------------------------- |
| Chart / table date                     | 05.01.2026                                  |
| Timestamp with time                    | 5 січ., 12:34 (Intl short month, day first) |
| Long date (legal, updated-at)          | 24 серпня 2026 р.                           |
| UTC stamp                              | 28.08.2026 08:13 UTC                        |
| Relative time                          | 2 години тому · 5 днів тому · щойно         |
| Compact duration                       | 1д 2год 30хв 45с                            |
| Countdown labels (`formats.countdown`) | ДН · ГОД · ХВ · С                           |
| Grouped number                         | 1 000 000 (Intl, no-break space)            |
| Token amount                           | 1.2345 ETH · 12.50 CST (formatter output)   |
| Week start                             | Monday (`weekStartsMonday: true`)           |

In prose, write times as «48 годин», «2 тижні», «1 день» — always through the plural
forms in §7 so the numeric-claims guard can find them (годин[аиу], тиж…, дн…).

## 6. UI constraints

Ukrainian runs roughly 15–30% longer than English. Budgets:

- **Nav items:** ≤ 16 characters (Галерея · Статистика · Поточний цикл · Як це працює).
- **Buttons:** two words where the English has two; never wrap to a second line at
  320px. Prefer Забрати over Забрати кошти зараз.
- **Table headers:** one or two words; move detail into the tooltip.
- **Eyebrows** (`type-eyebrow`, uppercase, tracked): short — 2–3 words; uppercase
  Cyrillic with 0.28em tracking is wide.
- **Toasts:** one line at 360px.
- **Tooltips / descriptions:** no budget, but one idea per sentence.

If a label cannot fit, shorten the Ukrainian — never abbreviate a glossary term
(закріпл. is not a word) and never fall back to English.

## 7. ICU messages in Ukrainian

Ukrainian has **four** CLDR plural categories, and the catalog gate fails any `plural`
block that lacks one of them:

| Category | Numbers                          | Example             |
| -------- | -------------------------------- | ------------------- |
| one      | 1, 21, 31, … (ends in 1, not 11) | 1 жест, 21 жест     |
| few      | 2–4, 22–24, … (not 12–14)        | 2 жести, 23 жести   |
| many     | 0, 5–20, 25–30, 100, …           | 5 жестів, 11 жестів |
| other    | fractions                        | 1,5 жесту           |

```json
"gestureCount": "{count, plural, one {# жест} few {# жести} many {# жестів} other {# жесту}}"
```

- `#` renders the number; keep `=0 {…}` exact cases when the English has a special
  zero phrase.
- Every argument of the English message must appear in the Ukrainian (a dropped
  `{value}` loses information); a tag (`<em>`, `<link>`) may be dropped but never invented.
- `select` messages keep every branch: `{kind, select, cst {CST-жест} randomWalk
{ETH-жест з RandomWalk} other {ETH-жест}}`.
- Common nouns and their forms (one / few / many):
  жест / жести / жестів · цикл / цикли / циклів · учасник / учасники / учасників ·
  токен / токени / токенів · розподіл / розподіли / розподілів · отримувач / отримувачі /
  отримувачів · запис / записи / записів · день / дні / днів · година / години / годин ·
  хвилина / хвилини / хвилин · секунда / секунди / секунд · тиждень / тижні / тижнів ·
  NFT / NFT / NFT (indeclinable — still write all four branches).
- Rich text: `<em>` and `<strong>` wrap whole words, never half a word.

## 8. Review: the two-pass rule

Every string passes two independent reads before it ships:

1. **Accuracy pass** (bilingual): every fact, number, placeholder, link, and glossary
   term matches the English and the glossary. Run `npm run i18n:check`.
2. **Blind fluency pass** (Ukrainian only, English hidden): does it read as if written
   in Ukrainian? Checklist:
   - no calques (перформити, фіналізувати, алокація, локейшн);
   - no Russian-influenced forms (здача, зняти кошти, на протязі → протягом, приймати
     участь → брати участь, самий кращий → найкращий);
   - the 2019 orthography (проєкт, етер is _not_ used — Ethereum stays Latin);
   - apostrophes and quotes are typographic;
   - plural forms correct for 1 / 2 / 5 / 21;
   - sentence case; no exclamation marks in chrome;
   - the string fits its surface (§6) at 320px.

Anything that fails pass 2 is rewritten, not patched.

## 9. Worked example — a full FAQ entry

**English**

> **Is this a lottery?**
> No. Cosmic Signature is a procedural art protocol. Gestures extend a timed Performance
> Cycle; when it finalizes, the protocol distributes its reserve across more than ten
> allocation tracks. The Stellar Selection uses protocol-level randomness to choose
> recipients among participants — it is not a game of chance and no ticket is sold.

**Ukrainian** (denial copy — the banned words are named on purpose, inside pragmas)

> **Це лотерея?**
> Ні. Cosmic Signature — це процедурний протокол мистецтва. Жести подовжують
> перформанс-цикл із обмеженим часом; коли він завершується, протокол розподіляє
> резерв за понад десятьма напрямами. Зоряний відбір використовує випадковість на рівні
> протоколу, щоб визначити отримувачів серед учасників, — це не азартна гра, і жодних
> квитків тут не продають.

Why it reads native: the em dash carries the definition; «подовжують … цикл із
обмеженим часом» replaces the English adjective stack; the denial keeps the exact
English claims and nothing more; every glossary term is in its canonical form.
