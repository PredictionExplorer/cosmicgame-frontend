# Taiwan Traditional Chinese Style Guide — 繁體中文（台灣）文案風格指南

How to make the `zh-TW` copy read as if it had been written in Taipei, not converted from
Beijing. The voice, grammar rules, ICU conventions, and two-pass review are shared with the
Simplified guide ([style-guide-zh.md](./style-guide-zh.md)) and are not repeated in full;
this document records what is **different** for Taiwan and what a reviewer hunts for.
Terminology: [glossary-zh-TW.md](./glossary-zh-TW.md).

---

## 1. Conversion is the draft, never the copy（轉換只是草稿）

`npm run i18n:derive -- --from zh --to zh-TW` produces the first draft: OpenCC's Taiwan
phrase conversion plus the glossary's substitutions. That draft is mechanically correct
(the four `npm run i18n:check` gates pass on it) and still sounds converted. The copy
stage rewrites it with three questions:

1. **Would a Taiwan reader say this word?** 使用者 not 用戶, 網路 not 網絡, 資訊 not 信息,
   預設 not 默認, 設定 not 設置, 載入 not 加載, 影片 not 視頻, 選單 not 菜單, 智慧合約 not
   智能合約, 機率 not 概率, 行動裝置 not 移動裝置, 了解 not 瞭解 (OpenCC's standard form
   is not the everyday one).
2. **Would they phrase it this way?** Taiwan prose leans on 就、才、比較、蠻 and shorter
   clauses; it uses 的 more freely than mainland technical writing but still not in
   chains; it prefers 這樣 / 這麼 over 如此 in explanatory copy.
3. **Does it still carry the art register?** The coined terms (落筆、演繹週期、星選、錨定、
   銘刻、獲配者) are untouchable; everything around them can be recast.

## 2. Register and voice（語域與語氣）

- **你, never 您.** Taiwan UI often defaults to 您; this brand does not — the voice is a
  gallery curator, not a bank. Drop the pronoun when context allows: 查看已錨定的 NFT.
- **Declarative, no hype:** no 立即/馬上 urgency, no 超、超級, at most one 驚嘆號 per page.
- **Calm, actionable errors:** 未能載入統計資料，請稍後再試。 Never blame the reader.
- **Buttons are verb phrases, 2–6 characters:** 落筆、取回、全部取回、連接錢包、收官、
  錨定、解錨、查看詳細資料、複製地址.
- The tone-by-surface table of the Simplified guide §2 applies unchanged; legal pages are
  formal written Chinese (本協議、本網站、不作任何陳述) with meaning identical to the
  English.

## 3. Grammar（句式）

All required habits and forbidden translationese patterns of the Simplified guide §3
apply (topic–comment order, 把/將, 有/無 empty states, 已/未 status columns; no
的-chains, no 被 where the notional passive works, no 一個 articles, no 進行/做出 verbs,
no pronoun spam, no 當……時 monotony). Taiwan-specific:

- **Aspect and modality:** 會 for regular mechanics (每筆落筆都會延長倒數), 就 for
  consequence (倒數歸零後就能收官), 才 for conditions (連接錢包後才能落筆).
- **Measure words:** 枚 for NFTs, 筆 for gestures and transactions, 位 for participants,
  條 for tracks and rules, 個 for cycles (第 12 個週期), 場 is never used (event flavor).
- **Particles:** 的 stays out of labels (落筆次數, not 落筆的次數); 了 marks completed
  outcomes in toasts (已提交 / 已完成 — the 已 form is preferred over 了).

## 4. Mechanics（標點與排版）

1. **Full-width CJK punctuation** everywhere: ，。：；？！、（）《》.
2. **Quotation marks are corner brackets:** 「……」 for the first level, 『……』 nested.
   Curly quotes “ ” are a defect (the conventions gate fails on them).
3. **Characters:** 裡 (not 裏), 著 in every sense (not 着), 台灣 / 平台 (not 臺), 週期
   (not 周期), 為 (not 爲). Encode standard Big5 forms (說、閱、戶、稅); Taiwan fonts draw
   the shapes.
4. **CJK–Latin spacing (盤古之白):** one space between CJK and Latin/digits — 每枚 NFT、
   12 個週期、在 Arbitrum 上、7% 的儲備 — none against CJK punctuation.
5. **Ellipsis** …… in prose; a single … is allowed on loading states (載入中…).
6. **Ranges:** 至 or ～ (380 至 700 奈米 — note 奈米, the Taiwan word for nanometre;
   Hong Kong and the mainland say 納米).
7. **Never letter-space CJK**; centred punctuation is a property of the Taiwan fonts,
   not something to fake with spaces.

## 5. Dates, times, numbers, units（日期、時間、數字、單位）

| Item                     | English               | zh-TW                                                               |
| ------------------------ | --------------------- | ------------------------------------------------------------------- |
| Full date                | Jul 16, 2026          | 2026年7月16日                                                       |
| Short date (tables)      | Jan 01, 12:34         | 1月1日 12:34                                                        |
| Date with year (axis)    | Jan 1, 2026           | 2026/1/1                                                            |
| Time                     | 12:34:56              | 12:34:56 — 24-hour in data displays (see note)                      |
| UTC marker               | Jan 1, 2026 14:00 UTC | 2026年1月1日 14:00（UTC）                                           |
| Duration (compact timer) | 1d 2h 30m 45s         | 1天2小時30分45秒                                                    |
| Duration (prose)         | 47 hours              | 47 小時                                                             |
| Relative                 | 3 hours ago           | 3 小時前                                                            |
| Week start (calendar UI) | Sunday                | 週日 — Taiwan calendars start on Sunday (`weekStartsMonday: false`) |
| Number grouping          | 1,000,000             | 1,000,000 in data; prose may say 一百萬                             |
| Large numbers in prose   | 100,000 orbits        | 十萬條候選軌道                                                      |
| Ordinal cycle            | Cycle #12             | 第 12 個週期                                                        |
| Nanometre                | 380–700 nm            | 380 至 700 奈米                                                     |

Taiwan everyday usage favours the 12-hour clock (下午 2:05); the site keeps 24-hour
time in every data display so timestamps line up across locales and columns, and the
compact timer form omits CJK–Latin spaces by design.

## 6. UI constraints（介面約束）

As the Simplified guide §6: headers 2–6 characters, tooltips end with 。, labels carry no
terminal punctuation, aria-labels describe the action (複製合約地址), SEO titles keep the
`·` separator (畫廊 · Cosmic Signature), data (token names, addresses, hashes) is never
translated. The site-map page is titled 網站導覽; the home link reads 首頁.

## 7. ICU messages（ICU 寫法）

Identical to the Simplified guide §7: Chinese has no plural inflection, so every plural
block carries `other` only (`Intl.PluralRules('zh-TW')`), counters live inside the
message (已錨定 {count} 枚 NFT), `select` distinguishes token types, rich-text tags stay
balanced.

## 8. Review（審校）

The two-pass rule of the Simplified guide §8 applies: accuracy side-by-side, then a
blind fluency read of the rendered `/zh-TW` page. Pass 2 additionally hunts:

- [ ] **Mainland leaks:** 網絡、軟件、信息、用戶、默認、設置、登錄、視頻、鏈接、加載、刷新、
      搜索、菜單、服務器、概率、數碼、移動、在線、實時、賬戶、設備、屏幕、聯繫、界面、
      倒計時、瞭解.
- [ ] **Hong Kong leaks:** 裏、着、私隱、主頁、電郵、流動、派發 (for Anchor Distribution),
      公共物品, 網站地圖.
- [ ] **OpenCC artefacts:** 校準視窗、連線錢包、程式化、臺灣、質量 meaning quality
      (品質; 質量 is _mass_).
- [ ] **Quotation marks and characters** per §4 (the conventions gate enforces the
      mechanical part; pass 2 owns it in rendered context).
- [ ] The page has one voice; the coined terms appear exactly as the glossary spells them.

Greps that help: `rg -n "網絡|軟件|信息|用戶|默認|設置|登錄|視頻|鏈接|加載|裏|着|私隱|主頁" messages/zh-TW content/**/*.zh-TW.ts`.

## 9. Worked example（完整示例）

English (FAQ): _"Every cycle opens with an ETH Calibration Window for the first gesture.
The first gesture starts the cycle's finalization countdown, currently about 24 hours by
default."_

Converted draft (rejected): 每個週期都以首筆落筆的 ETH 校準視窗開啟。首筆落筆會啟動週期收官
倒計時，當前默認約為 24 小時。

zh-TW copy: 每個週期都從首筆落筆的 ETH 校準窗口開始。第一筆落下，收官倒數就啟動了，目前預設
大約 24 小時。

What changed: 校準視窗 → 校準窗口 (glossary); 倒計時 → 倒數 and 默認 → 預設 (Taiwan
vocabulary); 當前 → 目前 (Taiwan word); the second sentence gains 就……了 and drops the
English clause order; 約為 → 大約 (spoken register the FAQ surface wants).
