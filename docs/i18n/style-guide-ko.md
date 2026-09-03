# Korean Style Guide — 문체 지침 (한국어)

How to make the Korean sound like it was written in Korean. Read
[glossary-ko.md](./glossary-ko.md) first — this guide assumes its terms. Machine gates
that back these rules: `npm run i18n:strict` (ICU syntax, placeholders, plural
categories), `npm run i18n:conventions` (`LOCALE_CONVENTIONS.ko`: particles glued to
placeholders, hedged particles, full-width punctuation, the dropped pronoun, the double
passive), `npm run lexicon:scan`, `npm run terminology:check`.

---

## 1. Transcreate, don't translate

The English copy is already a transcreation layer over the protocol mechanics. The
Korean must serve the same _intent_ with Korean sentence rhythm — verb last, topic first,
nothing that only exists because English needed it. Ask "how would a Korean museum
website or a good Korean fintech app say this?", then write that.

- Restructure freely: split or merge sentences, move the topic, drop English filler
  ("simply", "just", "actually") and English hedges ("Please note that").
- Keep every fact, number, link, and placeholder. Nothing is added, nothing is lost.
- Wordplay and idioms are re-created, not transliterated. `E<legacy>arn</legacy> Rewards`
  has no Korean equivalent; write the intended meaning and drop the tag (the catalog
  gate allows a dropped tag, never an invented one).
- The most common translationese (번역투) to hunt: 당신 for _you_, 것이다 chains, 에
  대한 / 에 있어서 for every _about_ and _in_, ~을 가지다 for _have_, 들 on every plural
  noun, 의 stacked three deep, 되어지다 double passives, 그것 / 이것 for _it_.

## 2. Register and voice

- **Address:** the reader is never named. Korean drops the subject; 당신, 귀하, 너, 여러분
  do not appear (the conventions gate rejects 당신 and 귀하). Where English says "your
  wallet", Korean says 지갑 or 내 지갑 (the possessive of the first person, as in 내 배분).
- **Sentence register:** 합쇼체 everywhere — statements end in **‑합니다 / ‑입니다**,
  questions in **‑합니까 / ‑입니까**, requests in **‑해 주세요** (never the stiff ‑하십시오,
  never the chatty 해요체 ‑해요 / ‑예요). One register across the whole site.
- **Tone:** calm, precise, art-institution. No hype, no exclamation marks in UI chrome,
  no emoji, no meme slang, no ㅋㅋ.
- **Buttons and CTAs:** noun phrases — 제스처 남기기 · 회수 · 지갑 연결 · Arbiscan에서 보기.
  The ‑하기 form for a primary action that names a verb (남기기, 연결하기), a bare noun
  for compact or table actions (회수, 복사, 닫기). Never a full sentence on a button.
- **Nav items, headings, table headers:** noun phrases — 현재 사이클 · 내 배분 · 제스처 수.
- **Status and empty states:** nominal endings — 연결됨 · 불러오는 중… · 데이터 없음 ·
  트랜잭션이 확인되었습니다 (a completed result may be a full sentence).
- **Errors:** say what happened and what to do, without blame — 데이터를 불러오지
  못했습니다. 잠시 후 다시 시도해 주세요.
- **Legal and risk copy:** 합쇼체 with 사용자 (the user) and 회사 / 프로토콜 as parties,
  the same denials the English makes, inside `lexicon-allow` pragmas where a banned word
  must be named.

Tone by surface:

| Surface                 | Voice                                                   |
| ----------------------- | ------------------------------------------------------- |
| Landing hero, OG images | evocative, short declaratives (‑합니다), no imperatives |
| dApp chrome, tables     | terse, nominal, consistent                              |
| Tooltips, FAQ, Learn    | explanatory 합쇼체, one idea per sentence               |
| Toasts                  | one clause; ‑되었습니다 for results, ‑는 중 for waits   |
| Legal                   | formal 합쇼체, complete sentences                       |

## 3. Grammar patterns

Korean has no cases, gender, or number, but it has **sound-dependent particles**: 을/를,
이/가, 은/는, 와/과, 으로/로 change with the final sound of the word before them. An
interpolated value has no known final sound, so **no such particle ever follows a
placeholder or a plural `#`** — the conventions gate rejects `{amount}을`, `{name}이`,
`#를`, and the hedges 을(를) / (으)로. Restructure instead:

| Avoid (particle on an unknown sound) | Write instead                                    |
| ------------------------------------ | ------------------------------------------------ |
| {amount} ETH을 회수합니다            | {amount} ETH 회수                                |
| {name}이 선정되었습니다              | 수령자: {name}                                   |
| {cycle}으로 이동                     | 사이클 {cycle}로 이동                            |
| 제스처 #를 남겼습니다                | 제스처 {count}회를 남겼습니다 → 제스처 {count}회 |

- **Counters** carry the number: {count}개 (things), {count}회 (times), {count}명 (people),
  {count}건 (records), {count}번째 (ordinal). A counter is not sound-dependent, so it may
  follow a placeholder directly.
- **Particles after Latin tokens** follow the token's Korean pronunciation:

  | Token                | Pronounced         | Particles               |
  | -------------------- | ------------------ | ----------------------- |
  | ETH                  | 이티에이치 (vowel) | ETH를 / ETH가 / ETH로   |
  | CST                  | 씨에스티 (vowel)   | CST를 / CST가 / CST로   |
  | NFT                  | 엔에프티 (vowel)   | NFT를 / NFT가 / NFT로   |
  | Cosmic Signature     | 시그니처 (vowel)   | Cosmic Signature를 / 가 |
  | RandomWalk           | 워크 (vowel)       | RandomWalk를 / 가       |
  | Protocol Guild       | 길드 (vowel)       | Protocol Guild를 / 가   |
  | Arbitrum             | 아비트럼 (ㅁ)      | Arbitrum을 / 이 / 으로  |
  | Arbiscan             | 아비스캔 (ㄴ)      | Arbiscan을 / 이 / 으로  |
  | Uniswap              | 유니스왑 (ㅂ)      | Uniswap을 / 이 / 으로   |
  | a number ending in 0 | 영 / 십 (ㅇ / ㅂ)  | write the counter first |

- **No plural marker.** 토큰, never 토큰들; the number or the context carries plurality.
- **Verb last, topic first.** 사이클이 마감되면 준비금이 배분됩니다 — not the English
  order with Korean words.
- **Passive:** prefer the active voice or the simple passive ‑됩니다; never the double
  passive ‑되어지다 (gate).
- **Nominal labels** use juxtaposition, not 의: 제스처 비용, 사이클 준비금, 앵커링 지급액.
- **Spacing (띄어쓰기):** compound terms are spaced as the glossary writes them (지갑
  연결, 보정 구간, 사이트맵 as one word); dependent nouns take a space (회수 가능, 할 수
  있습니다); Sino-Korean counters attach to digits (3개, 48시간, 5주, 1일); Latin units
  take a space (5 ETH, 1,000 CST); percent attaches (50%).

## 4. Mechanics: punctuation, spacing, typography

- **Punctuation is ASCII:** `. , ? ! : ;` — never the full-width 。，、！？：（） of Chinese
  and Japanese typesetting (gate). No space before punctuation, one space after.
- **Quotation marks:** “…” for quotations, ‘…’ for a term used as a term or for
  emphasis. Never 「」『』 (gate), never straight `"` in copy (JSON escaping aside).
- **Ranges:** the tilde — 2~4시간, 0~100. En dash only inside Latin material (O–M).
- **Dashes:** Korean prose rarely uses the em dash; prefer a colon, a comma, or a new
  sentence. Where a dash is unavoidable, use — (U+2014) with spaces.
- **Ellipsis:** the single character … (U+2026), no space before it: 불러오는 중…
- **Middle dot:** · (U+00B7) between short list items (일 · 시 · 분 · 초).
- **Percent:** no space before % (50%). This matches the on-screen formatters and the
  numeric-claims test that pins every percentage to `protocol-facts.ts`.
- **Decimals and thousands:** the dot and the comma, as in English and as
  `Intl.NumberFormat('ko-KR')` prints them — 0.0001 ETH, 1,000 CST, 24,000 CST. The
  numeric-claims regex reads the comma grouping.
- **Units:** Sino-Korean counters attach to the digit — 48시간, 5주, 1일, 3개; Latin units
  take a space — 5 ETH, 1,000 CST. Compact duration units attach too, with a space
  between tokens (1일 2시간 30분 45초, `formats.durationCompact`, `wordSpacing: true`).
- **Case:** Korean has none. Latin tokens keep their own case (ETH, NFT, Arbitrum); an
  English phrase kept in Latin is never uppercased for an eyebrow.
- **Line breaking:** `html:lang(ko)` sets `word-break: keep-all`, so Hangul never breaks
  inside a word. Write natural phrases and let the browser wrap at spaces; never insert
  manual breaks.
- **Hangul only:** never mix Hangul with Chinese characters (漢字) or Japanese script
  in copy; loanwords follow 외래어 표기법 (제스처, 컨트랙트, 트랜잭션, 프로토콜, 갤러리,
  이더리움).

## 5. Dates, times, numbers, units

Formatting is code, not copy (`i18n/localeConfig.ts` → `intlLocale: 'ko-KR'`,
`utils/format.ts`, `utils/time.ts`). What the code renders:

| Context                                | Rendering                                   |
| -------------------------------------- | ------------------------------------------- |
| Chart / table date                     | 2026. 1. 5.                                 |
| Timestamp with time                    | 1월 5일 12:34                               |
| Long date (legal, updated-at)          | 2026년 8월 24일                             |
| UTC stamp                              | 2026. 8. 28. 08:13 UTC                      |
| Relative time                          | 2시간 전 · 5일 전 · 방금                    |
| Compact duration                       | 1일 2시간 30분 45초                         |
| Countdown labels (`formats.countdown`) | 일 · 시 · 분 · 초                           |
| Grouped number                         | 1,000,000 (Intl, comma)                     |
| Token amount                           | 1.2345 ETH · 12.50 CST (formatter output)   |
| Week start                             | Sunday (`weekStartsMonday: false`, CLDR KR) |
| Clock                                  | 24-hour                                     |

In prose, write times as 48시간, 5주, 1일 — the counter attached to the digit — so the
numeric-claims guard can find them (시간, 주, 일). Dates in prose are 2026년 8월 24일;
the guard knows that a figure after 월 is a date, not a duration.

## 6. UI constraints

Korean runs shorter than English in characters but each Hangul glyph is as wide as
two Latin letters, so widths come out close to the English. Budgets:

- **Nav items:** ≤ 7 Hangul syllables (갤러리 · 통계 · 현재 사이클 · 작동 원리).
- **Buttons:** ≤ 6 syllables; never wrap to a second line at 320px. Prefer 회수 over
  지금 회수하기.
- **Table headers:** one or two words; move detail into the tooltip.
- **Eyebrows** (`type-eyebrow`): 2–4 syllables. The uppercase-and-tracking treatment is
  Latin; under `html:lang(ko)` letter-spacing is reset to 0.
- **Toasts:** one line at 360px.
- **Tooltips / descriptions:** no budget, but one idea per sentence.

If a label cannot fit, shorten the Korean — never abbreviate a glossary term (앵커링 is
never 앵커) and never fall back to English.

## 7. ICU messages in Korean

`Intl.PluralRules('ko')` defines a **single** category, `other`, and the catalog gate
fails a `plural` block that lacks it. Keep the plural block even so — `#` formats the
number with Korean grouping — and write the counter inside it:

```json
"gestureCount": "{count, plural, other {제스처 #개}}"
```

- Keep `=0 {…}` exact cases when the English has a special zero phrase (아직 제스처가
  없습니다).
- Every argument of the English message must appear in the Korean (a dropped `{value}`
  loses information); a tag (`<em>`, `<link>`) may be dropped but never invented.
- `select` messages keep every branch: `{kind, select, cst {CST 제스처} randomWalk
{RandomWalk NFT를 첨부한 ETH 제스처} other {ETH 제스처}}`.
- Ordinals: `{n}번째`; never `selectordinal` gymnastics.
- Rich text: `<em>` and `<strong>` wrap whole words, never half a word.
- No sound-dependent particle after a placeholder or `#` (§3).

## 8. Review: the two-pass rule

Every string passes two independent reads before it ships:

1. **Accuracy pass** (bilingual): every fact, number, placeholder, link, and glossary
   term matches the English and the glossary. Run `npm run i18n:check`.
2. **Blind fluency pass** (Korean only, English hidden): does it read as if written in
   Korean? Checklist:
   - no 번역투 (당신, 것이다 chains, 에 대한 for every _about_, ~을 가지다, 들 on plurals,
     stacked 의, 되어지다, 그것 / 이것 for _it_);
   - 합쇼체 throughout; no 해요체, no ‑하십시오, no honorific 님;
   - particles agree with the preceding sound, including after Latin tokens (§3);
   - spellings follow 외래어 표기법 (제스처, 컨트랙트, 트랜잭션, 갤러리, 이더리움);
   - spacing follows the glossary (사이트맵, 이용약관 as one word; 지갑 연결, 보정 구간
     as two);
   - ASCII punctuation, “ ” quotes, ~ ranges;
   - the string fits its surface (§6) at 320px.

Anything that fails pass 2 is rewritten, not patched.

## 9. Worked example — a full FAQ entry

**English**

> **Is this a lottery?**
> No. Cosmic Signature is a procedural art protocol. Gestures extend a timed Performance
> Cycle; when it finalizes, the protocol distributes its reserve across more than ten
> allocation tracks. The Stellar Selection uses protocol-level randomness to choose
> recipients among participants — it is not a game of chance and no ticket is sold.

**Korean** (denial copy — the banned words are named on purpose, inside pragmas)

> **이것은 복권인가요?**
> 아닙니다. Cosmic Signature는 절차적 아트 프로토콜입니다. 제스처는 정해진 시간 동안 이어지는
> 퍼포먼스 사이클을 연장하고, 사이클이 마감되면 프로토콜은 준비금을 10개가 넘는 배분 경로로
> 배분합니다. 별빛 선정은 프로토콜 수준의 무작위성으로 참여자 가운데 수령자를 정합니다. 이는
> 사행성 게임이 아니며, 어떤 티켓도 판매되지 않습니다.

Why it reads native: the topic (Cosmic Signature는) opens and the verb closes each
sentence; "timed" became a relative clause (정해진 시간 동안 이어지는) instead of an
adjective stack; 가운데 replaces a literal 중에서; the denial keeps the exact English
claims and nothing more; every glossary term is in its canonical form; no 당신, no 들, no
full-width punctuation.
