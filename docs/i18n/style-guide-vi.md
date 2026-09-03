# Vietnamese Style Guide — Hướng dẫn văn phong (Tiếng Việt)

How to make the Vietnamese sound like it was written in Vietnamese. Read
[glossary-vi.md](./glossary-vi.md) first — this guide assumes its terms. Machine gates that
back these rules: `npm run i18n:strict` (ICU syntax, placeholders, plural categories),
`npm run i18n:conventions` (`LOCALE_CONVENTIONS.vi`: East Asian characters and full-width
marks, a space before a sentence mark, three dots as an ellipsis, the customer-service
address _quý khách_ / _quý vị_; plus the universal Normalization Form C check),
`npm run lexicon:scan`, `npm run terminology:check`.

---

## 1. Transcreate, don't translate

The English copy is already a transcreation layer over the protocol mechanics. The
Vietnamese must serve the same _intent_ with Vietnamese sentence rhythm — short clauses,
the topic first, classifiers where a Vietnamese reader expects them, nothing that only
exists because English needed it. Ask "how would a Vietnamese museum website or a good
Vietnamese fintech app say this?", then write that.

- Restructure freely: split or merge sentences, move the topic, drop English filler
  ("simply", "just", "actually") and English hedges ("Please note that").
- Keep every fact, number, link, and placeholder. Nothing is added, nothing is lost.
- Wordplay and idioms are re-created, not transliterated. `E<legacy>arn</legacy> Rewards`
  has no Vietnamese equivalent; write the intended meaning and drop the tag (the catalog
  gate allows a dropped tag, never an invented one).
- The most common translationese (văn dịch) to hunt: _của bạn_ after every noun (Vietnamese
  drops the possessive when the owner is obvious: "Kết nối ví", not "Kết nối ví của bạn"),
  _được_ chains where the active voice is natural, _một_ before every noun (English _a/an_
  has no equivalent), _các_ / _những_ on every plural (Vietnamese marks plural only when the
  count matters), _nó_ for _it_ (name the thing or drop it), _sự_ / _việc_ nominalizations
  stacked where a verb reads better, and a comma after every English clause boundary.
- Vietnamese never pastes Chinese, Japanese, or Korean: a Han character, kana, or Hangul in
  a catalog means another locale's string slipped in. The conventions gate rejects them,
  along with full-width punctuation.

## 2. Register and voice

- **Address:** the reader is **bạn** — the neutral second person of Vietnamese software
  (Google, Apple, and Microsoft Vietnamese all use it). Never _quý khách_ / _quý vị_
  (customer-service and formal-letter register; the conventions gate rejects them), never
  _anh/chị_ (assumes age and gender), never _mày_ / _cậu_ (intimate). Drop the pronoun
  where the sentence works without it: "Kết nối ví để tiếp tục", not "Bạn hãy kết nối ví
  của bạn để tiếp tục". "My allocations" is **phân bổ của tôi** — _tôi_ is the reader
  speaking about their own things in a label, and it is the only place _tôi_ appears.
- **The protocol speaks in the third person:** giao thức, Cosmic Signature, hợp đồng —
  never _chúng tôi_ in product chrome. Legal copy (Terms, Privacy) does say **chúng tôi**
  for the operator, as Vietnamese legal documents do.
- **Sentence register:** plain declaratives everywhere. Requests use **hãy** sparingly or a
  bare verb ("Kết nối ví", "Thử lại"); **vui lòng** only where English says _please_ and
  the surface is polite prose (toasts, errors), never on a button. No _ạ_, no _nhé_, no
  _nha_ — the chatty particles belong to chat, not chrome.
- **Tone:** calm, precise, art-institution. No hype, no exclamation marks in UI chrome,
  no emoji, no meme slang, no _cực_, _siêu_, _hot_.
- **Buttons and CTAs:** a bare verb phrase for a primary action (Đặt nét bút · Nhận về ·
  Kết nối ví), a bare noun for compact or table actions (Sao chép · Đóng · Chi tiết).
  Never a full sentence on a button, never _vui lòng_ on a button.
- **Nav items, headings, table headers:** noun phrases — Chu kỳ hiện tại · Phân bổ của tôi ·
  Số nét bút.
- **Status and empty states:** nominal endings — Đã kết nối · Đang tải… · Không có dữ liệu ·
  Giao dịch đã được xác nhận (a completed result may be a full sentence).
- **Errors:** say what happened and what to do, without blame — "Không tải được dữ liệu.
  Vui lòng thử lại sau."
- **Legal and risk copy:** formal prose with **người dùng** and **chúng tôi** / **giao
  thức** as parties, the same denials the English makes, inside `lexicon-allow` pragmas
  where a banned word must be named.

Tone by surface:

| Surface                 | Voice                                              |
| ----------------------- | -------------------------------------------------- |
| Landing hero, OG images | evocative, short declaratives, no imperatives      |
| dApp chrome, tables     | terse, nominal, consistent                         |
| Tooltips, FAQ, Learn    | explanatory prose, one idea per sentence           |
| Toasts                  | one line: result + next step                       |
| Legal                   | formal prose, defined parties, no marketing warmth |

## 3. Grammar patterns

- **Topic before detail.** "Khi chu kỳ hoàn tất, Signature được khắc" — not "Signature
  được khắc khi chu kỳ hoàn tất" unless the imprinting is the topic.
- **Modifiers follow the noun.** phân bổ Signature, nét bút ETH, chu kỳ hiện tại, NFT
  đang neo giữ. English pre-modifier stacks unwind from the head noun outward: "Anchor
  Distribution breakdown" → chi tiết phân phối neo giữ.
- **No inflection, no agreement.** Verbs never change; tense and aspect come from _đã_
  (completed), _đang_ (ongoing), _sẽ_ (future), or from context alone. A status label
  uses the aspect marker (Đã khắc, Đang tải…); running prose usually needs none.
- **Plural.** Vietnamese does not mark it. Write **3 nét bút**, **12 chu kỳ**, **các
  phân bổ** only when a bare noun would read as singular and the plurality matters. Never
  _những_ before a number.
- **Classifiers.** A noun after a number normally takes its classifier: **3 tác phẩm**,
  **2 giao dịch**; coinages that are themselves count nouns take none (**3 nét bút**,
  **5 chu kỳ**); Latin tokens take none (**3 NFT**, **10 CST**).
- **Passive.** _được_ (favorable or neutral) and _bị_ (adverse) are real verbs, not a
  reflex: "Signature được khắc" (imprinted — good), "giao dịch bị hoàn nguyên" (reverted —
  bad). Prefer the active voice where the agent is known.
- **Possession.** _của_ only when ownership is the point: "phân bổ của bạn" when contrasted
  with others', "ví" alone when the reader's is obvious.
- **Negation and questions.** _không_ before the verb; questions end in _không?_ or
  _gì?_ / _nào?_ / _đâu?_; the FAQ headline form is a noun phrase or a full question with a
  question mark, never a bare English fragment.
- **Ordinals.** _thứ_ + number (thứ 3, thứ 12); the exceptions _thứ nhất_ and _thứ nhì_ /
  _thứ hai_ apply to the first two. Cycle numbers are labels, not ordinals: **chu kỳ 12**.

## 4. Mechanics: punctuation, spacing, typography

- **Punctuation is ASCII** — `, . ; : ? !` — attached to the preceding word, one space
  after. No space before a sentence mark (the conventions gate rejects "nét bút ."). No
  full-width marks, no corner brackets, no ideographic space (rejected).
- **Quotation marks:** curly double quotes **“ ”** for quoted words and titles; single ‘ ’
  only inside a double-quoted span. Never straight `"` in copy (code and contract names in
  `<code>` spans excepted), never « ».
- **Dashes:** an en dash **–** with spaces for an aside or a range in prose (2 – 3 ngày is
  written with spaces in Vietnamese practice, or as 2–3 ngày when compact); a hyphen `-`
  only inside compounds and identifiers.
- **Ellipsis:** the single character **…** (rejected: three dots next to Vietnamese text).
- **Latin tokens** (ETH, CST, NFT, Arbitrum, Cosmic Signature) sit in the sentence with an
  ordinary space on each side; they never take a hyphen or a classifier: "nét bút ETH",
  "3 NFT", "trên Arbitrum".
- **Capitalization:** sentence case for headings, buttons, labels, and table headers
  ("Chu kỳ hiện tại", not "Chu Kỳ Hiện Tại"). Proper-name coinages keep their capitals
  mid-sentence: Tinh tuyển, Hội đồng Vũ trụ, Quán quân Bền bỉ, Chiến binh Thời gian, Hàng
  hóa công, Kho Hàng hóa công, Dự trữ truyền thông, Dự trữ tích lũy, Signature. Common-noun
  coinages are lowercase mid-sentence: nét bút, chu kỳ, phân bổ, neo giữ, nhận về, khắc,
  cửa sổ hiệu chỉnh, phân phối neo giữ. `LocaleConfig.lowercaseMidSentence` is on for
  Vietnamese, so an interpolated Title-Case phrase is lowercased automatically.
- **Diacritics are letters, not decoration.** Every tone mark and every vowel mark is
  written (hoàn tất, not hoan tat); the text is stored in **Normalization Form C**
  (precomposed ế, ợ, ữ — the universal conventions check rejects decomposed sequences).
  Place the tone mark on the vowel the modern orthography puts it on (hòa, thủy, khỏe —
  not hoà, thuỷ, khoẻ).
- **Never** East Asian characters, half-width kana, or full-width alphanumerics — a sign
  another locale's string was pasted in.

## 5. Dates, times, numbers, units

Formatting utilities take a locale and look up `LOCALE_CONFIG.vi` (`intlLocale: 'vi-VN'`);
the rules below are for copy written by hand in catalogs and modules.

- **Numbers:** the thousands separator is the dot and the decimal separator the comma —
  **1.000 CST**, **0,5 ETH**, **12.345,67**. Percentages attach: **10%**. Never the English
  comma grouping next to Vietnamese text (the llms guard rejects `1,000 CST` beside
  Vietnamese copy); an ICU `{value, number}` placeholder formats itself.
- **Tickers after the figure, with a space:** 1 ETH, 250 CST, 3 NFT.
- **Durations:** digit, space, unit — **48 giờ**, **5 tuần**, **1 ngày**, **7 ngày**, **30
  phút**, **10 giây**. No plural, no classifier. The numeric-claims test holds 48 giờ / 5
  tuần / 1 ngày figures to `protocolFacts`; narrative durations that are not protocol
  facts are spelled in words (mười giờ, hai ngày).
- **Dates:** numeric **DD/MM/YYYY** (28/08/2026) in tables and stamps; the long form is
  what `Intl` renders for vi-VN ("28 tháng 8, 2026"); a month in prose is **tháng 8 năm
  2026**. Days of the week: thứ Hai … Chủ nhật. The week starts on Monday
  (`weekStartsMonday: true`).
- **Times:** 24-hour clock, **08:13**, UTC written as "08:13 UTC". Relative time comes
  from `Intl.RelativeTimeFormat` ("2 giờ trước", "3 tháng trước"); "just now" is **vừa
  xong**.
- **Units and symbols:** °, %, and ‰ attach to the digit; ETH gas units stay Latin (gwei).
- **Addresses and hashes:** never wrapped in quotes, never localized, shortened with the
  shared utility (0x1234…abcd).

## 6. UI constraints

- Vietnamese runs about 15–25% longer than English. Buttons: two or three words (Nhận về ·
  Kết nối ví · Đặt nét bút). Nav items: one noun phrase of at most three words (Phòng trưng
  bày · Cách hoạt động · Câu hỏi thường gặp is the long exception, fixed by the glossary).
- Table headers: two words where English has one, abbreviated only where Vietnamese itself
  abbreviates (SL for số lượng is acceptable in a dense numeric table; nothing else).
- Stacked diacritics need vertical room: never set Vietnamese in a line-height below 1.3,
  and never in Clash Display, which lacks the letters (headings switch to Onest through
  `html:lang(vi)` in `styles/global.css`).
- Tooltips: one or two sentences, no heading.
- Chips and badges: one or two words (Đã khắc · Đang neo giữ · Tinh tuyển).

## 7. ICU messages in Vietnamese

- **Plurals:** the Vietnamese cardinal plural has one category, so every `plural` block is
  `{count, plural, other {# nét bút}}` — no `one` branch (the strict gate rejects a category
  the locale does not define). Ordinals (`selectordinal`) have **one** and **other**: `thứ
#` for both in practice, but both branches must be present.
- **Placeholders** may sit anywhere the sentence needs them; Vietnamese has no case or
  agreement, so nothing has to be restructured around them: "Chu kỳ {number} sẽ mở sau
  {duration}."
- **Select** blocks (gender, status) map the English keys one to one; Vietnamese needs no
  gendered forms.
- **Rich-text tags** (`<link>`, `<b>`, `<code>`) wrap the same span of meaning as the
  English; a tag may be dropped when the wordplay it marked has no Vietnamese equivalent,
  never invented.
- **Numbers in placeholders** format through `Intl` (vi-VN separators) — never hand-write
  a separator next to a `{value, number}` placeholder.

## 8. Review: the two-pass rule

1. **Fidelity pass** (English open): every fact, number, link, placeholder, and tag
   survives; every coined term matches the glossary; nothing banned slipped in
   (`npm run i18n:check`).
2. **Fluency pass** (English hidden): read the page as a Vietnamese reader who has never
   seen the English. Anything that reads as translated — a stranded _của bạn_, a _được_
   chain, a Title-Case heading, a comma splice, an English word order — is rewritten.
   The test: would a Vietnamese fintech app or museum site publish this sentence as is?

## 9. Worked example — a full FAQ entry

**English**

> **Is Cosmic Signature a lottery?**
> No. Cosmic Signature is an art protocol. Each Performance Cycle produces one Signature,
> and the cycle's reserves are allocated by published rules: the final Gesture receives
> the Signature Allocation, anchored NFTs share the Anchor Distribution, and the Stellar
> Selection distributes a fixed share to participants at random.

**Vietnamese (fidelity + fluency)**

> **Cosmic Signature có phải là xổ số không?**
> Không. Cosmic Signature là một giao thức nghệ thuật. Mỗi chu kỳ trình diễn tạo ra một
> Signature, và dự trữ của chu kỳ được phân bổ theo các quy tắc đã công bố: nét bút cuối
> cùng nhận phân bổ Signature, các NFT đang neo giữ chia sẻ phân phối neo giữ, và Tinh
> tuyển phân phối một phần cố định cho những người tham gia được chọn ngẫu nhiên.

Notes: the banned word _xổ số_ appears only in the denial question and sits inside a
`lexicon-allow` pragma (TS) or as `\uXXXX` escapes (JSON); every coinage is the glossary
form; the reader is never named; _ngẫu nhiên_ ("at random") carries the mechanic without
any luck vocabulary.
