# Hong Kong Traditional Chinese Style Guide — 繁體中文（香港）文案風格指南

How to make the `zh-HK` copy read as written Hong Kong Chinese — the register of gov.hk, a
bank's app, or a quality newspaper's feature pages — rather than converted mainland text or
Taiwan text with different characters. Shared rules (voice, grammar, ICU, two-pass review)
live in [style-guide-zh.md](./style-guide-zh.md); this document records what is
**different** for Hong Kong. Terminology: [glossary-zh-HK.md](./glossary-zh-HK.md).

---

## 1. Written Chinese, Hong Kong vocabulary（書面語，香港用詞）

Hong Kong reads and writes standard written Chinese (書面語) and speaks Cantonese. UI copy,
explanations, and legal text are written Chinese: no Cantonese particles or function words
(嘅、係、喺、啲、咁、唔、冇、啦、喎). What makes the copy Hong Kong's is the vocabulary and
the characters:

1. **Vocabulary:** 網絡、軟件、用戶、智能合約、數碼、流動裝置、私隱、主頁、電郵、數據、
   資訊、登入、預設、設定、儲存、搜尋、載入、影片、選單、伺服器、介面、線上、即時、帳戶、
   裝置、聯絡、了解 (not 瞭解).
2. **Characters:** 裏 (這裏、裏面 — not 裡), 着 as the aspect particle (看着、帶着 — but
   著名、著作、顯著 keep 著), 台灣 (not 臺灣). Encode the standard Big5 characters (說、
   閱、戶、稅、溫、群、峰) — Hong Kong fonts (Noto Sans HK, PingFang HK) render the local
   glyph shapes; do not type the glyph-variant code points (説、閲、户、税、温、羣、峯), the
   conventions gate rejects them.
3. **Quotation marks:** 「……」 and nested 『……』.

`npm run i18n:derive -- --from zh --to zh-HK` gives a mechanically correct draft (the gates
pass on it); the copy stage rewrites it with the three questions of the Taiwan guide §1,
asked of a Hong Kong reader.

## 2. Register and voice（語域與語氣）

- **你, never 您.** Hong Kong formal writing uses 您 in customer-service copy; this brand's
  voice is a gallery curator and stays with 你 — or no pronoun at all (查看已錨定的 NFT).
- **Declarative, no hype;** no 立即/馬上 pushing, no 勁/超正 (colloquial), one 驚嘆號 per
  page at most.
- **Calm, actionable errors:** 未能載入統計數據，請稍後再試。
- **Buttons are verb phrases, 2–6 characters:** 落筆、取回、全部取回、連接錢包、收官、
  錨定、解錨、查看詳情、複製地址.
- The tone-by-surface table of the Simplified guide §2 applies; legal pages are formal
  written Chinese (本協議、本網站、不作任何陳述) with meaning identical to the English —
  the 私隱政策 and 風險披露 titles use the Hong Kong terms.

## 3. Grammar（句式）

All habits and forbidden patterns of the Simplified guide §3 apply. Hong Kong-specific:

- **Aspect:** 會 for regular mechanics; 便 / 就 for consequence (倒數歸零後便可收官 —
  便 is at home in Hong Kong written prose, 就 in lighter surfaces); 才 for conditions.
- **Measure words:** 枚 for NFTs, 筆 for gestures and transactions, 位 for participants,
  條 for tracks, 個 for cycles (第 12 個週期).
- **Status:** 已/未 + verb (已取回 / 未取回 / 已收官); 完成 is preferred over 搞掂 or any
  spoken form.
- **Amounts:** 港式 finance writing is comfortable with 派發、款項、餘額、結餘 — use them;
  never 回報 (a return on investment, banned) or 派息.

## 4. Mechanics（標點與排版）

1. **Full-width CJK punctuation:** ，。：；？！、（）《》.
2. **Corner brackets** 「……」 / 『……』; curly quotes are a defect.
3. **CJK–Latin spacing:** one space between CJK and Latin/digits (每枚 NFT、12 個週期、
   7% 的儲備), none against CJK punctuation.
4. **Ellipsis** …… in prose; single … on loading states (載入中…).
5. **Ranges:** 至 (380 至 700 納米 — Hong Kong says 納米, Taiwan 奈米).
6. **Never letter-space CJK.**

## 5. Dates, times, numbers, units（日期、時間、數字、單位）

| Item                     | English               | zh-HK                                                                  |
| ------------------------ | --------------------- | ---------------------------------------------------------------------- |
| Full date                | Jul 16, 2026          | 2026年7月16日                                                          |
| Short date (tables)      | Jan 01, 12:34         | 1月1日 12:34                                                           |
| Date with year (axis)    | Jan 1, 2026           | 2026/1/1                                                               |
| Time                     | 12:34:56              | 12:34:56 — 24-hour in data displays                                    |
| UTC marker               | Jan 1, 2026 14:00 UTC | 2026年1月1日 14:00（UTC）                                              |
| Duration (compact timer) | 1d 2h 30m 45s         | 1天2小時30分45秒                                                       |
| Duration (prose)         | 47 hours              | 47 小時                                                                |
| Relative                 | 3 hours ago           | 3 小時前                                                               |
| Week start (calendar UI) | Sunday                | 週日 — Hong Kong calendars start on Sunday (`weekStartsMonday: false`) |
| Number grouping          | 1,000,000             | 1,000,000 in data; prose may say 一百萬                                |
| Large numbers in prose   | 100,000 orbits        | 十萬條候選軌道                                                         |
| Ordinal cycle            | Cycle #12             | 第 12 個週期                                                           |

Hong Kong everyday usage favours the 12-hour clock (下午 2:05); data displays keep
24-hour time so timestamps line up across locales, and the compact timer omits CJK–Latin
spaces by design.

## 6. UI constraints（介面約束）

As the Simplified guide §6. The home link reads 主頁 (返回主頁), the site-map page 網站地圖,
the legal footer links 服務條款 / 私隱政策 / 風險披露. Data (token names, addresses, hashes)
is never translated.

## 7. ICU messages（ICU 寫法）

Identical to the Simplified guide §7: `other` only (`Intl.PluralRules('zh-HK')`),
counters inside the message, `select` for token types, balanced rich-text tags.

## 8. Review（審校）

The two-pass rule applies: accuracy side-by-side, then a blind fluency read of the
rendered `/zh-HK` page. Pass 2 additionally hunts:

- [ ] **Mainland leaks:** 信息、默認、設置、登錄、視頻、鏈接、加載、刷新、搜索、菜單、
      服務器、移動、在線、實時、賬戶、設備、聯繫、界面、倒計時、瞭解、首頁、隱私.
- [ ] **Taiwan leaks:** 網路、軟體、使用者、智慧合約、機率、數位、行動裝置、螢幕、裡、著 as
      a particle, 配發 (for Anchor Distribution), 公共財, 網站導覽, 隱私權, 揭露, 奈米.
- [ ] **Cantonese in UI copy:** 嘅、係、喺、啲、咁、唔、冇、搞掂.
- [ ] **Glyph-variant code points** (説、閲、户、税、温、羣、峯 …) — the conventions gate
      enforces this; pass 2 owns it in rendered context.
- [ ] The page has one voice; coined terms appear exactly as the glossary spells them.

Greps that help: `rg -n "網路|軟體|使用者|智慧合約|裡|著|隱私|首頁|信息|默認|設置|加載" messages/zh-HK content/**/*.zh-HK.ts`.

## 9. Worked example（完整示例）

English (FAQ): _"Every cycle opens with an ETH Calibration Window for the first gesture.
The first gesture starts the cycle's finalization countdown, currently about 24 hours by
default."_

Converted draft (rejected): 每個週期都以首筆落筆的 ETH 校準窗口開啟。首筆落筆會啟動週期收官
倒計時，當前默認約為 24 小時。

zh-HK copy: 每個週期都由首筆落筆的 ETH 校準窗口展開。第一筆落下，收官倒數便會啟動，目前預設
約為 24 小時。

What changed: 倒計時 → 倒數 and 默認 → 預設 (Hong Kong vocabulary); 當前 → 目前; the
second sentence uses 便會, the written-Chinese consequence marker Hong Kong prose favours,
and drops the English clause order.
