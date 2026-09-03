# Hong Kong Traditional Chinese Glossary — 術語表（繁體中文・香港）

The **single source of truth** for how Cosmic Signature's coined vocabulary is rendered in
Traditional Chinese for Hong Kong (`zh-HK`). One English term = one Chinese term, everywhere.
Machine-enforced by `scripts/terminology/zh-HK.ts` (drift), `ZH_HANT_BANNED_TERMS` +
`ZH_HK_BANNED_TERMS` in `scripts/lexicon-scan-core.ts` (banned register), and
`scripts/i18n-conventions-core.ts` (script, character forms, quotation marks).

`zh-HK` is **written Hong Kong Chinese**: standard written Chinese with Hong Kong's own IT,
finance, and civic vocabulary (網絡、軟件、用戶、智能合約、私隱、數碼、流動裝置、主頁), the
Hong Kong character choices (裏、着、台灣), and corner-bracket quotation marks. It is
neither a Cantonese transcription (no 嘅/係/喺/啲 in UI copy) nor Taiwan usage (no 網路、
軟體、使用者). Where Hong Kong and Taiwan differ, the Taiwan rendering is listed so a
reviewer can spot a leak in either direction ([glossary-zh-TW.md](./glossary-zh-TW.md)).
Rationale for the coinages and the term-formation rules are shared with
[glossary-zh.md](./glossary-zh.md).

> Status: **frozen with the zh-HK launch**. Amendments follow §6 and update every existing
> usage in the same PR.

---

## 1. Term formation rules（造詞規則）

As in [glossary-zh.md §1](./glossary-zh.md#1-term-formation-rules造词规则), plus:

1. Prefer the word a Hong Kong reader meets on gov.hk, HSBC, MTR, and Apple HK: 用戶 not
   使用者, 網絡 not 網路, 軟件 not 軟體, 私隱 not 隱私, 數碼 not 數位, 流動 not 行動,
   主頁 not 首頁, 電郵 not 電子郵件.
2. Encode the **standard Big5 characters** (說、閱、戶、稅、溫、群、峰) and let Hong Kong
   fonts draw the regional glyph shapes. OpenCC's Hong Kong tables emit glyph-variant code
   points (説、閲、户、税、温、羣、峯) that mainstream Hong Kong text does not type; the
   derive script normalizes them and the conventions gate rejects them.
3. The two character CHOICES that genuinely differ are kept: **裏** (not 裡) and **着** as
   the aspect particle (看着、帶着), with 著 for 著名、著作、顯著.
4. Coined terms keep the art register: 落筆、演繹週期、星選、錨定、銘刻. Two coinages
   diverge from Taiwan because the natural word differs: **錨定派發** (Taiwan 錨定配發) and
   **公共物品** (Taiwan 公共財).

## 2. Core coinages（核心術語定案）

| English (lexicon)          | zh-HK                 | zh-TW differs? | Notes                                                                                    |
| -------------------------- | --------------------- | -------------- | ---------------------------------------------------------------------------------------- |
| Gesture (原 bid)           | 落筆 · 一筆 / 這一筆  |                | Make a Gesture → 落筆; ETH gesture → ETH 落筆; gesture count → 落筆次數; live → 即時落筆 |
| Gesture Cost               | 落筆價格              |                |                                                                                          |
| Final Gesture              | 收官之筆              |                |                                                                                          |
| Performance Cycle (round)  | 演繹週期 · 週期       |                | 週 with the 辵 radical; 週期 #N                                                          |
| Finalize / Finalization    | 收官                  |                | familiar from Hong Kong sports and business writing (收官之戰)                           |
| Finalization countdown     | 收官倒數              |                | 倒數 (新年倒數); 倒計時 reads mainland                                                   |
| Calibration Window         | 校準窗口              |                |                                                                                          |
| Allocation (prize)         | 分配 · 一份分配       |                |                                                                                          |
| Recipient (winner)         | 獲配者                |                |                                                                                          |
| Stellar Selection (raffle) | 星選                  |                | eligibility → 星選資格                                                                   |
| Anchoring (staking)        | 錨定 · release → 解錨 |                |                                                                                          |
| Anchor Distribution        | **錨定派發**          | 錨定配發       | 派發 is the everyday Hong Kong verb for paying out a distribution (派發股息)             |
| Retrieve (withdraw/claim)  | 取回                  |                | never 領取 / 提款 / 提現                                                                 |
| Imprint (mint)             | 銘刻                  |                |                                                                                          |
| Endurance Champion         | 堅守冠軍              |                |                                                                                          |
| Chrono-Warrior             | 時之勇士              |                |                                                                                          |
| Cosmic Council (DAO)       | 宇宙議會              |                |                                                                                          |
| Public Goods               | **公共物品**          | 公共財         | the Hong Kong economics rendering; funding → 公共物品資助                                |
| Compounding Cycle Reserve  | 滾動儲備              |                |                                                                                          |
| Outreach Reserve           | 推廣儲備              |                |                                                                                          |
| Signature (the artwork)    | 簽名                  |                |                                                                                          |

## 3. General term table（通用術語速查）

| English                            | zh-HK                      | zh-TW                      | Notes                                     |
| ---------------------------------- | -------------------------- | -------------------------- | ----------------------------------------- |
| Gallery                            | 畫廊                       | 畫廊                       |                                           |
| How It Works                       | 運作原理                   | 運作原理                   |                                           |
| FAQ / Clarifications               | 常見問題 / 釋疑            | 常見問題 / 釋疑            |                                           |
| Learn Hub                          | 學習中心                   | 學習中心                   |                                           |
| Home (nav, "back to")              | **主頁**                   | 首頁                       |                                           |
| Site Map                           | 網站地圖                   | 網站導覽                   |                                           |
| Statistics                         | 統計                       | 統計                       |                                           |
| Contracts / Source Code            | 合約 / **源代碼**          | 合約 / 原始碼              | 源代碼 is the Hong Kong rendering         |
| Audits / Security                  | 審計 / 安全                | 審計 / 安全                |                                           |
| Terms of Service                   | 服務條款                   | 服務條款                   |                                           |
| Privacy Policy                     | **私隱政策**               | 隱私權政策                 | 私隱 is the Hong Kong word (私隱專員公署) |
| Risk Disclosures                   | **風險披露**               | 風險揭露                   |                                           |
| wallet / Connect / Disconnect      | 錢包 / 連接錢包 / 中斷連接 | 錢包 / 連接錢包 / 中斷連接 |                                           |
| transfer (NFT) / transfer (ERC-20) | 轉移 / 轉帳                | 轉移 / 轉帳                |                                           |
| account / balance                  | 帳戶 / 餘額                | 帳戶 / 餘額                | 帳 with 巾, not 賬                        |
| transaction                        | 交易                       | 交易                       |                                           |
| participant / holder               | 參與者 / 持有者            | 參與者 / 持有者            |                                           |
| network                            | **網絡**                   | 網路                       |                                           |
| software / program                 | **軟件** / 程式            | 軟體 / 程式                |                                           |
| data / information                 | **數據** · 資料 / 資訊     | 資料 · 數據 / 資訊         | 個人資料 for personal data                |
| user                               | **用戶**                   | 使用者                     |                                           |
| smart contract                     | **智能合約**               | 智慧合約                   |                                           |
| interface                          | 介面                       | 介面                       |                                           |
| device / mobile                    | 裝置 / **流動裝置**        | 裝置 / 行動裝置            |                                           |
| digital                            | **數碼**                   | 數位                       |                                           |
| online / real-time                 | 線上 / 即時                | 線上 / 即時                |                                           |
| log in                             | 登入                       | 登入                       |                                           |
| default / settings / save          | 預設 / 設定 / 儲存         | 預設 / 設定 / 儲存         |                                           |
| search / filter / sort             | 搜尋 / 篩選 / 排序         | 搜尋 / 篩選 / 排序         |                                           |
| loading… / refresh / retry         | 載入中…… / 重新整理 / 重試 | 載入中…… / 重新整理 / 重試 |                                           |
| link / video / menu                | 連結 / 影片 / 選單         | 連結 / 影片 / 選單         |                                           |
| click / tap                        | 按 · 點擊                  | 點選                       | glossary preference                       |
| view / details                     | 查看 / **詳情**            | 檢視 / 詳細資料            |                                           |
| email                              | **電郵**                   | 電子郵件                   |                                           |
| contact                            | 聯絡                       | 聯絡                       |                                           |
| feedback loop                      | 反饋迴路                   | 回饋迴路                   |                                           |
| probability                        | **概率**                   | 機率                       |                                           |
| quality (of content)               | **質素**                   | 品質                       | 質量 is _mass_ in the physics copy        |
| screen                             | 屏幕                       | 螢幕                       |                                           |
| server / cache                     | 伺服器 / 快取              | 伺服器 / 快取              |                                           |
| procedural on-chain art protocol   | 程序化鏈上藝術協議         | 程序化鏈上藝術協議         |                                           |
| three-body problem                 | 三體問題                   | 三體問題                   |                                           |
| no data / empty state              | 暫無數據                   | 暫無資料                   |                                           |
| here / inside                      | 這裏 / 裏面                | 這裡 / 裡面                | conventions gate                          |
| Taiwan                             | 台灣                       | 台灣                       |                                           |

### 3.1 Trait vocabulary（作品特徵詞表）

Identical to [glossary-zh-TW.md §3.1](./glossary-zh-TW.md#31-trait-vocabulary作品特徵詞表)
in Traditional characters; the wire label `Round` maps to 週期.

## 4. Keep in English（保留英文）

As [glossary-zh.md §4](./glossary-zh.md#4-keep-in-english保留英文). 以太坊 for Ethereum in
prose. The switcher label for this locale is always 繁體中文（香港）.

## 5. Banned Hong Kong terms（禁用詞表）

Machine-enforced as `ZH_HANT_BANNED_TERMS` (shared with Taiwan) plus `ZH_HK_BANNED_TERMS`.
The Hong Kong additions are the words Hong Kong actually uses for the banned concepts —
its lotteries, racing, and finance. The only sanctioned exception is FAQ/legal denial copy
inside `lexicon-allow` pragmas (or `\uXXXX` escapes in JSON catalogs).

| Banned（禁用）                                                                                                                       | Concept                 | Use instead（改用）     |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ----------------------- |
| 出價、競價、叫價、投標、**競投、投得**                                                                                               | bid / auction           | 落筆 / 校準窗口         |
| 拍賣、競拍、荷蘭拍                                                                                                                   | auction                 | 校準窗口                |
| 獎品、獎勵、獎金、大獎、頭獎、獎池、戰利品、安慰獎                                                                                   | prize / jackpot         | 分配                    |
| 彩票、樂透、彩券、獎券、抽獎、抽籤、搖號、開獎、刮刮樂、**六合彩、攪珠**                                                             | lottery / raffle / draw | 星選                    |
| 中獎、贏家、得主、獲勝者、優勝者                                                                                                     | winner                  | 獲配者                  |
| 賭博、賭場、賭注、賭客、**賭仔、賭波、賭錢**、博彩、下注、投注、押注、**落注、投注站、派彩**、打賭、賠率、莊家、荷官、**賽馬、馬會** | gambling                | denial copy only        |
| 抽中、碰運氣、拼手氣、幸運兒                                                                                                         | luck flavor             | 獲配 / 星選             |
| 遊戲、玩家、玩法、試玩、闖關                                                                                                         | game / play             | 協議 / 參與者 / 機制    |
| 比賽、競賽、競爭、競技、錦標賽、爭奪、對決                                                                                           | competition             | describe the mechanic   |
| 投資、理財、炒幣、建倉                                                                                                               | invest                  | denial copy only        |
| 收益、年化、利息、分紅、股息、盈利、利潤、獲利、**回報、派息**                                                                       | yield / profit / return | 錨定派發 (the mechanic) |
| 賺錢、賺取、躺賺、薅羊毛、被動收入                                                                                                   | earn / income           | 獲得分配                |
| 質押、鑄造、鑄幣、挖礦                                                                                                               | staking / mint / mining | 錨定 / 銘刻             |
| 提現、提款、領取、認領                                                                                                               | withdraw / claim        | 取回                    |
| 空投、贈品、白送、免費領                                                                                                             | giveaway / airdrop      | describe the allocation |
| 慈善、公益、捐贈、捐款、捐獻、捐助、善款                                                                                             | charity / donation      | 公共物品資助            |
| 去中心化自治組織                                                                                                                     | DAO                     | 宇宙議會                |
| 輪次、回合                                                                                                                           | round                   | 週期                    |
| 門票、入場券                                                                                                                         | ticket                  | 星選資格                |
| 免稅、抵稅                                                                                                                           | tax-deductible          | denial copy only        |

Style-level cautions (reviewer judgment): Cantonese colloquialisms in UI copy (嘅、係、
喺、啲、咁), 回饋 in the sense "give back", any certainty-of-gain phrasing, meme slang
(All-in、衝、上車).

## 6. Change process（術語變更流程）

As [glossary-zh.md §6](./glossary-zh.md#6-change-process术语变更流程), sweeping
`messages/zh-HK/**`, `content/**/*.zh-HK.ts`, `content/about/zh-HK.ts`, and updating
`scripts/terminology/zh-HK.ts`, `ZH_HK_BANNED_TERMS`, or `LOCALE_CONVENTIONS['zh-HK']` in
the same PR. A change to a term shared with Taiwan is made in both glossaries or
deliberately not.
