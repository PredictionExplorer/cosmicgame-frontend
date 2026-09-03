# Japanese Style Guide — 文体ガイド（日本語）

How to make the Japanese sound like it was written in Japanese. Read
[glossary-ja.md](./glossary-ja.md) first — this guide assumes its terms. Machine gates
that back these rules: `npm run i18n:strict` (ICU syntax, placeholders, plural
categories), `npm run i18n:conventions` (`LOCALE_CONVENTIONS.ja`: half-width katakana,
full-width alphanumerics, spaces around Latin tokens, ASCII sentence punctuation, the
dropped pronoun, dropped long vowels, Chinese-only characters), `npm run lexicon:scan`,
`npm run terminology:check`.

---

## 1. Transcreate, don't translate

The English copy is already a transcreation layer over the protocol mechanics. The
Japanese must serve the same _intent_ with Japanese sentence rhythm — topic first, verb
last, nothing that only exists because English needed it. Ask "how would a Japanese museum
website or a good Japanese fintech app say this?", then write that.

- Restructure freely: split or merge sentences, move the topic, drop English filler
  ("simply", "just", "actually") and English hedges ("Please note that").
- Keep every fact, number, link, and placeholder. Nothing is added, nothing is lost.
- Wordplay and idioms are re-created, not transliterated. `E<legacy>arn</legacy> Rewards`
  has no Japanese equivalent; write the intended meaning and drop the tag (the catalog
  gate allows a dropped tag, never an invented one).
- The most common translationese (翻訳調) to hunt: あなた for _you_, ～することができます
  for _can_ (write ～できます), ～を持っています for _have_, ～たち on plural nouns, の
  stacked three deep, ～される chains where the active voice is natural, それ / これ for
  _it_, and a comma after every English clause boundary.
- Japanese never pastes Chinese: a Simplified or Traditional-only character (们, 這, 麼,
  您) in a catalog means a Chinese string slipped in. The conventions gate rejects them.

## 2. Register and voice

- **Address:** the reader is never named. Japanese drops the subject; あなた, 貴方, 貴殿,
  お客様 do not appear (the conventions gate rejects the pronouns). Where English says
  "your wallet", Japanese says ウォレット or 自分のウォレット; "My allocations" is 自分の配分.
- **Sentence register:** です・ます体 everywhere — statements end in **‑ます / ‑です**,
  questions in **‑ますか / ‑ですか** or a noun phrase with **？** (FAQ, quiz), requests in
  **‑してください** (never the stiff ‑なさい, never the chatty ‑だよ / ‑だね, never the
  formal-letter ‑いたします in chrome). Honorific verbs (ご確認ください, お試しください) are
  fine for a direct request to the reader; the protocol and third parties get plain
  polite forms. One register across the whole site.
- **Tone:** calm, precise, art-institution. No hype, no exclamation marks in UI chrome,
  no emoji, no meme slang, no （笑）.
- **Buttons and CTAs:** the dictionary form for a primary action (一筆を入れる · 受け取る ·
  ウォレットを接続), a bare noun for compact or table actions (受け取り · コピー · 閉じる).
  Never a full sentence on a button, never ‑してください on a button.
- **Nav items, headings, table headers:** noun phrases — 現在のサイクル · 自分の配分 · 筆数.
- **Status and empty states:** nominal endings — 接続済み · 読み込み中… · データなし ·
  トランザクションが確認されました (a completed result may be a full sentence).
- **Errors:** say what happened and what to do, without blame — データを読み込めませんでした。
  しばらくしてからもう一度お試しください。
- **Legal and risk copy:** です・ます体 with ユーザー (or 利用者) and 当プロトコル as parties,
  the same denials the English makes, inside `lexicon-allow` pragmas where a banned word
  must be named.

Tone by surface:

| Surface                 | Voice                                                     |
| ----------------------- | --------------------------------------------------------- |
| Landing hero, OG images | evocative, short declaratives (‑ます), no imperatives     |
| dApp chrome, tables     | terse, nominal, consistent                                |
| Tooltips, FAQ, Learn    | explanatory です・ます体, one idea per sentence           |
| Toasts                  | one line: result + next step                              |
| Legal                   | formal です・ます体, defined parties, no marketing warmth |

## 3. Grammar patterns

- **Topic before detail.** サイクルが確定すると、シグネチャーが刻印されます — not
  シグネチャーが刻印されるのはサイクルが確定したときです.
- **Interpolated values are nouns with a counter.** Japanese counts with counters, and
  the counter attaches to the digit: `{count}件`, `{count}枚`, `{count}回`, `{days}日`,
  `{hours}時間`. Never `{count}個の一筆` where `{count}筆` or `一筆{count}件` reads better.
  A placeholder never sits between a noun and its particle.
- **No plural agreement.** `Intl.PluralRules('ja')` defines only `other`, so every plural
  block is `{count, plural, other {#件}}` — the block stays so `#` formats the number.
  Never たち, never 複数の for a count.
- **Placeholders keep their grammar slot.** `{amount} ETH` stays a Latin unit phrase;
  `{amount} ETHで一筆` attaches the particle to the unit with no space (§4).
- **Passive vs. active.** Protocol events are natural passives (配分が積み立てられます,
  シグネチャーが刻印されます); what the reader does is active (一筆を入れます, 受け取ります).
  Avoid the double passive (～させられる) and the potential-passive stack (～されることが
  できます → ～できます).
- **Conditionals.** ～すると for protocol consequences, ～する場合 for legal conditions,
  ～すれば for advice.
- **Negation and denial copy.** ではありません for categorical denials (宝くじではありません),
  ～ません for verbs.

## 4. Mechanics: punctuation, spacing, typography

- **Scripts:** kanji for Sino-Japanese words, hiragana for grammar, katakana for
  loanwords. Full-width katakana only (半角カナ is rejected). ASCII digits and Latin
  letters only (全角英数字 are rejected).
- **Punctuation is full-width after Japanese text:** 。、？！（）「」『』：. ASCII `.`, `,`,
  `?`, `!` after a Japanese character are rejected; digits and Latin tokens keep their
  ASCII marks (1.5 ETH, Cosmic Signature, Inc.). Question marks in headings are
  full-width (Cosmic Signatureとは？). Full-width parentheses around Latin inside
  Japanese: 2026年8月28日 08:13（UTC）.
- **Quotation marks:** 「」 for quotes and UI labels named in prose (「受け取る」を押します),
  『』 for titles inside quotes. Never straight or curly ASCII quotes around Japanese.
- **Ellipsis:** the single character … (never `...`, never ・・・). Status strings end in it
  with no space: 読み込み中….
- **No spaces.** Japanese does not space words, and it does not space Latin tokens or
  digits either: 48時間, Cosmic Signatureは, ETH一筆, {count}件, 2026年9月2日, サイクル12.
  Latin phrases keep their own internal spaces (Cosmic Signature NFT, 1,000 CST) and an
  identifier may keep its `#` (一筆 #42). Never a space after 。 or 、. The conventions gate
  rejects a half-width space between Japanese text and a Latin letter, digit, or
  placeholder brace. The ideographic space U+3000 is rejected everywhere.
- **Nakaguro:** ・ separates two katakana loanwords in a compound (パフォーマンス・サイクル,
  プロシージャル・オンチェーンアート・プロトコル) and lists inside a phrase; it is never an
  ellipsis and never decorates a heading.
- **Long vowels:** loanwords keep the prolonged-sound mark — ユーザー, サーバー, ブラウザー,
  コンピューター, パラメーター, シグネチャー, フォルダー. Dropped vowels are rejected by the
  conventions gate. Months are か月 (never ヶ月 / ヵ月 / 個月).
- **Capitalization and case:** none in Japanese; Latin brand names keep their own
  casing. The site disables Title-Case button transforms for every non-English document.
- **Line breaking:** the CSS sets `line-break: strict` for `html:lang(ja)` (no line
  starts with a small kana or ー) and `word-break: auto-phrase` on display headings where
  the browser supports it; copy does not need manual breaks. Headings should still be
  written so that a break between any two phrases reads naturally.
- **Emphasis:** Japanese does not italicize. `t.rich` emphasis tags render as weight, so
  copy may keep them; never add ＊ or 【】 for emphasis.

## 5. Dates, times, numbers, units

- **Digits:** ASCII, grouped with commas, decimal point: 1,234.56. Never full-width
  digits, never 万 grouping in UI (12,345 not 1万2,345) — ETH and CST figures are
  international.
- **Dates:** 2026年9月2日 (long form, `Intl` for ja-JP); 9月2日 22:44 for timestamps
  (month and day with no zero padding, one space before the 24-hour clock); 2026/09/02
  for compact calendar labels; 2026年8月28日 08:13（UTC） for data stamps. Calendar weeks
  start on Sunday (CLDR JP).
- **Times:** 24-hour clock, HH:mm. Never 午後10時 in UI.
- **Durations:** the counter attaches to the digit and units run together with no
  separators: 48時間, 1日2時間30分45秒, 5週間, 7日間 (`formats.json` durationCompact:
  日 / 時間 / 分 / 秒; `wordSpacing: false`). Protocol facts are interpolated from
  `protocol-facts.ts`, never restated; narrative durations that are not protocol facts
  are written in words (十時間, 二日) so the numeric-claims guard never mistakes them for a
  pinned figure.
- **Relative time:** 2時間前, 3か月前, 1年前 (no space, か月 for months), たった今 for the
  just-now case. `utils/time.ts` renders these itself because CLDR's ja pattern inserts a
  space ("2 時間前") the style forbids.
- **Units that stay in English:** ETH, CST, NFT, ERC-20 — with their normal ASCII space
  from the number (0.25 ETH, 1,000 CST) and no space to the Japanese that follows
  (0.25 ETHで一筆).
- **Percentages:** 25% (ASCII %, no space), never 25パーセント in UI.
- **Ordinals and ranks:** 第3位, 3位, 3回目.
- **Counters by noun:** 一筆 → 筆 (筆数) or 件; NFT / artworks → 枚 or 点 (作品3点); tokens
  as a quantity → 枚 for CST counts in prose, a bare figure with the ticker in UI (1,000
  CST); participants → 人 (or 名 in formal copy); cycles → サイクル12 (no counter) or 回.

## 6. UI constraints

Japanese is denser than English but katakana loanwords are long. Length budgets:

| Surface          | Budget                                             | Technique                                  |
| ---------------- | -------------------------------------------------- | ------------------------------------------ |
| Nav item         | 2–6 characters                                     | ギャラリー · 統計 · 仕組み · ヘルプ        |
| Button           | ≤ 8 characters                                     | 受け取る · ウォレットを接続 · 一筆を入れる |
| Table header     | ≤ 6 characters                                     | 筆数 · 金額 · 受領者 · サイクル            |
| Badge / chip     | ≤ 5 characters                                     | 接続済み · 確定済み · 係留中               |
| Tooltip          | ≤ 2 sentences                                      | mechanics first, then the consequence      |
| Toast            | 1 line                                             | result + next step                         |
| Meta title       | ≤ 30 full-width characters before the brand suffix |                                            |
| Meta description | 60–90 full-width characters                        | Google JP truncates at about 90            |

Shortening order: drop the honorific prefix (ご確認 → 確認), drop the object (配分を受け取る
→ 受け取る), use the glossary short form (パフォーマンス・サイクル → サイクル), then the bare
noun (受け取り). Never drop a counter or a unit, never abbreviate a loanword mid-word.

## 7. ICU messages in Japanese

- `Intl.PluralRules('ja')` defines only `other`, for cardinals and ordinals alike. Every
  plural block carries exactly `other` — `npm run i18n:strict` fails on a missing category
  and on an invented one (`one` is not a Japanese category).
- `#` inside the `other` branch formats the number; put the counter right after it:
  `{count, plural, other {#件の一筆}}`, `{days, plural, other {#日}}`.
- Every placeholder from the English appears exactly once in the Japanese (placeholder
  parity is gated). Reorder freely to suit Japanese word order; never invent a new one.
- `select` blocks keep the same option keys as the English.
- Rich-text tags (`<b>`, `<link>`) wrap the same span of meaning as the English; a tag
  may be dropped when the emphasis has no Japanese equivalent, never added.

## 8. Review: the two-pass rule

**Pass 1 (against the English):** glossary term for every coinage, every number and
placeholder present, links and units intact, plural blocks well-formed, no banned word
outside denial copy, no full-width alphanumerics or half-width kana, no spaces around
Latin tokens. Machine gates cover most of this; the reviewer covers meaning.

**Pass 2 (blind — the English is closed):** read the Japanese as a Japanese reader who
has never seen the site. Mark anything that:

- names the reader (あなた) or sounds like a translated instruction manual
  (～することができます, ～を行ってください where ～してください is natural);
- stacks の or される;
- uses a loanword where a native word is the everyday term (アロケーション for 配分);
- mixes registers (a だ・である sentence, a chatty ね / よ);
- puts a space between Japanese and a Latin token or a digit;
- reads as a game, a lottery, or an investment (any word from glossary §5, any
  certainty-of-gain phrasing);
- breaks awkwardly at a heading width (test at 320 px).

Fix, then re-run `npm run i18n:check`.

## 9. Worked example — a full FAQ entry

**English**

> **Is Cosmic Signature a lottery?**
> No. A Cosmic Signature Performance Cycle is a public, on-chain art performance: every
> gesture is a recorded act, every allocation is defined in advance by the protocol, and
> the Signature is imprinted deterministically from the recorded gestures. Nothing is
> drawn from a hat.

**Japanese (shipped)**

> **Cosmic Signatureは宝くじですか？**
> いいえ。Cosmic Signatureのパフォーマンス・サイクルは、公開されたオンチェーンのアート・パフォーマンス
> です。すべての一筆は記録された行為であり、すべての配分はプロトコルによって事前に定められ、
> シグネチャーは記録された一筆から決定論的に刻印されます。帽子から引くものは何もありません。

Notes: 宝くじ appears only because this is denial copy (inside a `lexicon-allow` pragma in
the module); the question is a full-width ？ with no space before it; いいえ。 opens the
answer as a complete sentence; 一筆 / 配分 / シグネチャー / 刻印 are the glossary terms; the
final idiom is re-created, not transliterated; no space separates Cosmic Signature from the
particle は.
