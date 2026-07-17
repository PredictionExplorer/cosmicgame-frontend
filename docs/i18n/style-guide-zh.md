# Simplified Chinese Style Guide — 简体中文文案风格指南

The bar for this project is explicit: **the Chinese site must read as if it were written
in Chinese first.** A user in Shanghai should never sense an English sentence behind the
text. "Accurate but stiff" is a defect and gets sent back in review.

This guide defines how we get there. It works together with
[glossary-zh.md](./glossary-zh.md) (which fixes _what_ words to use — this file fixes
_how to write around them_) and the workflow in [README.md §8](./README.md).

---

## 1. Transcreate, don't translate（重写，而非翻译）

The unit of translation is the **message**, not the sentence. Read the English, close it,
and write what a skilled Chinese copywriter would have written on that screen. Specifically:

- **Re-order freely.** English leads with clauses; natural Chinese states topic first,
  then comment. Time and condition come first (先说时间条件，再说结论).
- **Split and merge sentences.** English marketing stacks clauses with em-dashes;
  Chinese prefers shorter sentences in sequence (流水句).
- **Drop what Chinese doesn't need.** Plural markers, articles, most possessive pronouns
  ("your allocations" → 分配 in context — see §3), and copulas that 是 would over-formalize.
- **Add what Chinese does need.** Measure words (一**枚** NFT、一**份**分配、一**条**轨道、
  一**位**参与者), aspect particles (了、已), and connectives that smooth the flow.

**Worked example — landing hero subhead.**

> EN: "Every Gesture Shapes the Signature. Make a gesture during a Performance Cycle, and
> every gesture shapes the cycle's final Signature."

- ✗ Literal: 每个手势塑造签名。在演绎周期中做一个手势，每个手势都塑造周期的最终签名。
  (translationese: 每个 X 都…, "做一个手势" is a calque, repetitive)
- ✓ Transcreated: 每一笔，都在塑造签名。在演绎周期中落笔，你的每一笔都将融入这一周期
  最终的签名。

**Worked example — tooltip.**

> EN: "Number of indexed gestures made in the active Performance Cycle so far."

- ✗ Literal: 到目前为止在活跃的演绎周期中做出的已索引手势的数量。(的-chain pileup)
- ✓ Natural: 当前周期内已索引的落笔次数。

**Worked example — toast.**

> EN: "Transaction was cancelled in your wallet."

- ✗ Literal: 交易在您的钱包中被取消了。(passive + unnecessary possessive)
- ✓ Natural: 已在钱包中取消交易。

## 2. Register and voice（语域与语气）

- **你, never 您.** One choice, applied everywhere with zero exceptions — including legal
  pages. The brand voice is a confident gallery curator: warm, precise, slightly
  literary; 您 would make it read like a bank. Better yet, drop the pronoun entirely
  whenever context allows (Chinese does this naturally): "View your anchored NFTs" →
  查看已锚定的 NFT.
- **Declarative confidence, no hype.** The English voice avoids exclamation and
  superlatives; so do we. No 立即/马上 urgency-pushing, no 火爆/劲爆, at most one
  exclamation mark per page and ideally zero.
- **Calm, non-blaming errors.** Error text states what happened and the way forward:
  未能加载统计数据，请稍后重试。 Never 你输入的地址是错误的 (blames), never bare 错误！
- **Buttons are verb phrases, 2–6 characters:** 落笔、取回、全部取回、连接钱包、收官、
  锚定、解锚、查看详情、复制地址.

### Tone by surface

| Surface                            | Tone                                    | Notes                                                                                                                                                                                 |
| ---------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Landing / Learn / About            | Literary-precise, elevated but concrete | The 每一笔，都在塑造签名 register; short sentences; rhythm matters — read aloud                                                                                                       |
| dApp UI (labels, tables, tooltips) | Terse, technical, zero ornament         | Tooltips are one full sentence with 。; labels are noun phrases without 。                                                                                                            |
| How It Works / FAQ                 | Explanatory, patient, second person 你  | Prefer 会/将 for mechanics; analogies allowed if they survive the banned-list                                                                                                         |
| Toasts / errors                    | Short, factual, actionable              | Lead with outcome: 已提交 / 未能…                                                                                                                                                     |
| Legal (Terms/Privacy/Risk)         | Formal written Chinese (书面语)         | 本协议、本网站、不作任何陈述; still 你 for "the user" where addressed directly; **meaning must match the English exactly — this is the one surface where fidelity outranks elegance** |
| FAQ denial copy                    | Blunt and unhedged                      | 不是。Cosmic Signature 不是彩票…… — the denial must be unmistakable (and wrapped in lexicon-allow pragmas)                                                                            |

## 3. Grammar patterns: required and forbidden（句式规范）

**Required habits:**

- **Topic–comment order:** 周期收官后，协议将储备分配至十余条轨道。
- **把/将 for handling objects:** 将 NFT 锚定至协议 (not 锚定你的 NFT 到协议).
- **Existential 有/无 for empty states:** 暂无数据、暂无已锚定的 NFT.
- **已/未 + verb for status columns:** 已取回 / 未取回 / 已索引 / 已收官.
- **Numbers with measure words** on every count (§1).

**Forbidden translationese (automatic review flags):**

| Pattern                                                    | Example (bad)                  | Fix                                       |
| ---------------------------------------------------------- | ------------------------------ | ----------------------------------------- |
| 的-chains (≥3 in a row)                                    | 已索引的落笔的数量的统计       | Recast: 已索引落笔次数                    |
| Passive 被 where zh uses active/notional passive           | 分配被发放给获配者             | 分配已发放给获配者 / 获配者已收到分配     |
| "一个/一种" mirroring _a/an_                               | 这是一个程序化协议             | 这是程序化协议                            |
| Pronoun spam mirroring _your/its_                          | 你的钱包中的你的代币           | 钱包中的代币                              |
| "进行/做出 + noun" for simple verbs                        | 对交易进行确认、做出一个手势   | 确认交易、落笔                            |
| Clause order copied from EN (result before condition)      | 你可以收官，当周期到期时       | 周期到期后，你即可收官                    |
| 当……时 opening every conditional                           | 当周期收官时，当你连接钱包时…… | Vary: ……后 / ……即 / 一旦……                |
| "请注意，" opening every caveat                            | 请注意，每枚 NFT 仅可锚定一次  | 每枚 NFT 仅可锚定一次，解锚后不可再次锚定 |
| Untranslated EN sentence rhythm (comma splices everywhere) | ——                             | Split into short sentences                |

**Rhetorical fragments:** the English uses staccato fragments ("No houses. No dealers.
Just the protocol." / "No AI. No training data. Just deterministic physics."). Chinese
handles this beautifully — keep the rhythm, don't pad into full sentences:
没有庄家，没有中介，只有协议本身。 / 没有 AI，没有训练数据，只有确定性的物理。
(Note these particular lines live inside denial-adjacent copy; 庄家 requires a
lexicon-allow pragma per the glossary.)

## 4. Mechanics: punctuation, spacing, typography（标点与排版）

These are hard rules; QA checks them per page.

1. **Full-width CJK punctuation** in all Chinese text: ，。：；？！、（）《》"" .
   Half-width `,.:;?!()` inside Chinese sentences is a defect.
   - The enumeration comma 、 joins list items: ETH、CST 与 NFT。
   - Quotation marks: use "……" (standard mainland convention), not 「……」.
2. **One space between CJK and Latin/digits** (盘古之白): 每枚 NFT、12 个周期、
   在 Arbitrum 上、7% 的储备. **Exceptions — no space:** before/after CJK punctuation
   (锚定：ETH 派发), inside percent+CJK counts where the Latin token abuts punctuation,
   and full-width brackets already provide separation.
3. **No space between number and %**: 7%（not 7 %）. Between number and unit word:
   space for Latin units (0.05 ETH、1,000 CST), none for CJK units (3天 in compact
   timers — see §5).
4. **Ellipsis** is …… (six dots, two chars) in prose; a trailing UI ellipsis on
   loading states may use the single … glyph: 加载中…
5. **Ranges and dashes:** use 至 or ～ for ranges (380 至 700 纳米); em-dash pairs
   translate to ——, but prefer restructuring; the interpunct in "Cosmic Signature ·
   Gallery"-style titles stays · (see §6 SEO).
6. **Never letter-space CJK** and never apply the Latin display face's tracking to
   Chinese headings (README §5 handles this in CSS).
7. **Line-breaking:** rely on the browser (`lang="zh"` enables correct rules); do not
   insert manual line breaks inside Chinese sentences. For headlines where an awkward
   break is likely, prefer shorter headlines over `<br/>`.
8. **Numbers stay Arabic** (12 个周期, not 十二个周期) except in set phrases and
   idiomatic small counts in prose (十余条分配轨道 is better than 10 余条). 第 N 个周期
   uses Arabic N.

## 5. Dates, times, numbers, units（日期、时间、数字、单位）

Implemented via locale-aware formatters (README §4); translators must use these forms in
prose too:

| Item                       | English                  | Chinese                                                                  |
| -------------------------- | ------------------------ | ------------------------------------------------------------------------ |
| Full date                  | Jul 16, 2026             | 2026年7月16日                                                            |
| Short date (tables/charts) | Jan 01, 12:34            | 1月1日 12:34                                                             |
| Date with year (axis)      | Jan 1, 2026              | 2026/1/1 (axis ticks may use numeric form for width)                     |
| Time                       | 12:34:56                 | 12:34:56 (unchanged)                                                     |
| UTC marker                 | Jan 1, 2026 14:00 UTC    | 2026年1月1日 14:00（UTC）                                                |
| Duration (compact timer)   | 1d 2h 30m 45s            | 1天2小时30分45秒                                                         |
| Duration (prose)           | 47 hours                 | 47 小时                                                                  |
| Relative                   | 3 hours ago              | 3 小时前                                                                 |
| Number grouping            | 1,000,000                | 1,000,000 (keep Western grouping; do **not** use 万/亿 in data displays) |
| 万/亿 in prose             | 100,000 candidate orbits | Prose may say 十万条候选轨道; data tables keep 100,000                   |
| Percent                    | 7%                       | 7%                                                                       |
| ETH/CST amounts            | 0.0500 ETH               | 0.0500 ETH (unit stays Latin, space kept)                                |
| Wallet addresses           | 0x1234....abcd           | unchanged                                                                |
| Ordinal cycle              | Cycle #12                | 第 12 个周期                                                             |

Compact duration (1天2小时30分45秒) intentionally omits CJK–Latin spaces — it is a
single timer token and spacing would shatter it; this is the sanctioned exception to §4.2.

## 6. UI constraints（界面约束）

- **Chinese runs ~30–50% shorter.** That's usually a gift, but check the opposite
  problem: 2-character buttons (落笔) can look lost in a wide button — the component
  library's min-widths handle this; flag cases that look wrong in QA rather than padding
  text with filler.
- **Table headers:** prefer 2–6 characters (落笔次数、最大 ETH 落笔、获配总额). If the
  English header needs a qualifier, move the qualifier into the column tooltip.
- **Truncation:** CJK truncates mid-word visually; prefer full short labels over
  truncated long ones. Any label that ellipsizes at 320 px wide gets rewritten shorter.
- **Tooltips end with 。; labels and buttons carry no terminal punctuation.**
- **aria-labels are translated** like any string, and describe the action, not the icon:
  aria-label="复制合约地址" (not "复制图标").
- **SEO titles:** keep the `·` separator pattern — 画廊 · Cosmic Signature. Meta
  descriptions: aim ≤ 78 full-width characters (~156 half-width equivalent); front-load
  the value proposition since CJK SERPs truncate hard.
- **Don't translate inside data:** token names, NFT names given by owners, addresses,
  tx hashes, and API-sourced strings render verbatim.

## 7. ICU messages in Chinese（ICU 写法）

- **Plurals collapse.** English `{count, plural, one {# gesture} other {# gestures}}`
  becomes zh `{count} 次落笔` — no plural block. Keep the variable, drop the branching.
- **Counters live in the message,** not concatenated in code: `"anchoredCount": "已锚定
{count} 枚 NFT"`.
- **`select` for gender does not arise;** `select` for token type does:
  `{tokenType, select, eth {ETH 落笔} cst {CST 落笔} other {落笔}}`.
- **Rich text:** `t.rich('faq.answer', { link: (chunks) => <Link…>{chunks}</Link> })` —
  translators see `<link>协议文档</link>` in the JSON and keep the tags balanced.
- **Interpolation order is free:** Chinese frequently needs `{amount}` and `{unit}` in a
  different position than English — that's exactly why full-message ICU is mandatory and
  string concatenation is banned (README §3.1).

## 8. Review: the two-pass rule（双审制）

Every string passes two distinct human reviews before it ships (the R stage of the
workflow):

**Pass 1 — Accuracy (对照审校).** Bilingual reviewer, side-by-side. Checks: meaning
preserved, glossary terms exact, interpolations intact, no banned terms outside
allow-pragmas, legal meaning identical on legal surfaces.

**Pass 2 — Fluency (盲读润色).** Native-fluency editor reads **only the Chinese**, in
context (on the rendered `/zh` page, not in the JSON), and rewrites anything that sounds
translated. This pass has authority to restructure freely as long as glossary terms and
facts survive. If the editor stumbles, rereads a sentence, or can guess the English
underneath — it gets rewritten.

**Fluency checklist (what pass 2 hunts):**

- [ ] Read the page aloud once; any sentence you'd never say, rewrite.
- [ ] No §3 forbidden patterns (的-chains, 被-passives, 一个-articles, 进行-verbs,
      pronoun spam, 当……时 monotony).
- [ ] Sentence rhythm varies; no paragraph of five same-length sentences.
- [ ] Terminology: one concept, one term, entire page (grep the catalogs if unsure).
- [ ] Punctuation/spacing per §4 (mechanical, but pass 2 owns it in rendered context).
- [ ] Tone matches the surface table in §2.
- [ ] The page as a whole has a voice — if it reads like five translators, unify it.

**Verification loop for agent/tooling passes:** a practical self-check for any
non-native writer (including AI drafting) — back-translate your Chinese to English
mentally; if the back-translation reproduces the English source's _clause order_, you
probably translated too literally. Then run the §3 pattern greps
(`的.*的.*的`, `被(?!允许)`, `进行`, `做出`, `一个`, `当.*时`) over the diff and justify
every hit.

## 9. Worked example — full FAQ entry（完整示例）

> **EN Q:** "Is this a lottery, casino, or gambling product?"
> **EN A:** "No. Cosmic Signature is a procedural on-chain art protocol. Participants
> make gestures during a Performance Cycle; the protocol distributes allocations across
> more than ten tracks when the cycle finalizes. There is no house, no dealer, no bet.
> Allocations recognize endurance, timing, and participation. The one random allocation
> track, Stellar Selection, is a protocol-level procedural distribution."

Translation (denial copy — banned terms sanctioned here, wrapped in lexicon-allow):

> **问：这是彩票、赌场或赌博产品吗？**
> **答：**不是。Cosmic Signature 是程序化链上艺术协议。参与者在演绎周期中落笔；周期
> 收官后，协议将储备分配至十余条轨道。这里没有庄家，没有荷官，也没有赌注。分配所
> 表彰的是坚守、时机与参与。唯一带有随机性的分配轨道——星选——是协议层面的程序化
> 分配。

What makes it natural: the blunt 不是。 opener; topic–comment order (周期收官后，协议将……);
the 没有……没有……也没有…… tricolon mirroring the English rhythm without copying its
syntax; 所表彰的是 turning "recognize" into idiomatic emphasis; the em-dash apposition
for Stellar Selection instead of an English-style relative clause.
