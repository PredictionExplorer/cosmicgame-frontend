# Taiwan Traditional Chinese Glossary — 術語表（繁體中文・台灣）

The **single source of truth** for how Cosmic Signature's coined vocabulary is rendered in
Traditional Chinese for Taiwan (`zh-TW`). One English term = one Chinese term, everywhere.
Machine-enforced by `scripts/terminology/zh-TW.ts` (drift), `ZH_HANT_BANNED_TERMS` +
`ZH_TW_BANNED_TERMS` in `scripts/lexicon-scan-core.ts` (banned register), and
`scripts/i18n-script-conventions-core.ts` (script, character forms, quotation marks).

`zh-TW` is **not** a character conversion of `zh`. The coined terms were re-decided for a
Taipei reader; the everyday vocabulary follows Taiwan usage (網路、軟體、資訊、使用者、
登入、預設、設定); the script conventions follow the Ministry of Education standard as
written online (裡、著、台灣、「」). Where Taiwan and Hong Kong differ, the Hong Kong
rendering is listed so reviewers can spot a leak in either direction
([glossary-zh-HK.md](./glossary-zh-HK.md)). Everything else — rationale for the coinages,
term-formation rules, the change process — is shared with [glossary-zh.md](./glossary-zh.md)
and only summarized here.

> Status: **frozen with the zh-TW launch**. Amendments follow §6 and update every existing
> usage in the same PR.

---

## 1. Term formation rules（造詞規則）

As in [glossary-zh.md §1](./glossary-zh.md#1-term-formation-rules造词规则), plus:

1. Prefer the word a Taiwan reader meets on Apple, Google, and government sites over the
   word a mainland reader meets: 使用者 not 用戶, 網路 not 網絡, 資訊 not 信息, 預設 not
   默認, 設定 not 設置, 載入 not 加載.
2. Never let OpenCC decide vocabulary. Its Taiwan phrase table is right about 軟體 and
   資訊 and wrong about 校準視窗 (a GUI window; we mean a time window: 校準窗口), 連線錢包
   (a network connection; wallets are 連接), 程式化 (programmatic; the art is 程序化),
   臺灣 (official, but the everyday form is 台灣).
3. Coined terms keep the art register in Traditional characters: 落筆、演繹週期、星選、
   錨定、銘刻. Two coinages diverge from Hong Kong because the natural word differs:
   **錨定配發** (Hong Kong 錨定派發) and **公共財** (Hong Kong 公共物品).

## 2. Core coinages（核心術語定案）

| English (lexicon)          | zh-TW                 | zh-HK differs? | Notes                                                                                       |
| -------------------------- | --------------------- | -------------- | ------------------------------------------------------------------------------------------- |
| Gesture (原 bid)           | 落筆 · 一筆 / 這一筆  |                | Make a Gesture → 落筆; ETH gesture → ETH 落筆; gesture count → 落筆次數; live → 即時落筆    |
| Gesture Cost               | 落筆價格              |                | never 成本                                                                                  |
| Final Gesture              | 收官之筆              |                |                                                                                             |
| Performance Cycle (round)  | 演繹週期 · 週期       |                | 週 with the 辵 radical, never 周期 (mainland form); a cycle number is 第 N 個週期 / 週期 #N |
| Finalize / Finalization    | 收官                  |                | from Go (圍棋); familiar in Taiwan media (收官戰)                                           |
| Finalization countdown     | 收官倒數              |                | 倒數 is the Taiwan word; 倒計時 reads mainland                                              |
| Calibration Window         | 校準窗口              |                | a period, not a GUI 視窗                                                                    |
| Allocation (prize)         | 分配 · 一份分配       |                |                                                                                             |
| Recipient (winner)         | 獲配者                |                |                                                                                             |
| Stellar Selection (raffle) | 星選                  |                | eligibility → 星選資格; pool → 星選池                                                       |
| Anchoring (staking)        | 錨定 · release → 解錨 |                | anchored NFT → 已錨定 NFT                                                                   |
| Anchor Distribution        | **錨定配發**          | 錨定派發       | 配發 is how Taiwan finance words a distribution (配發股利); 派發 reads Hong Kong            |
| Retrieve (withdraw/claim)  | 取回                  |                | never 領取 / 提領 / 提現                                                                    |
| Imprint (mint)             | 銘刻                  |                | imprinted → 已銘刻                                                                          |
| Endurance Champion         | 堅守冠軍              |                |                                                                                             |
| Chrono-Warrior             | 時之勇士              |                |                                                                                             |
| Cosmic Council (DAO)       | 宇宙議會              |                |                                                                                             |
| Public Goods               | **公共財**            | 公共物品       | the Taiwan economics term (數位公共財); funding → 公共財資助                                |
| Compounding Cycle Reserve  | 滾動儲備              |                |                                                                                             |
| Outreach Reserve           | 推廣儲備              |                | never 行銷 (Taiwan's word for marketing — the banned concept)                               |
| Signature (the artwork)    | 簽名                  |                | 每一筆，都在塑造簽名                                                                        |

## 3. General term table（通用術語速查）

Interface vocabulary, fixed for consistency. The zh-HK column is a reviewer's aid.

| English                            | zh-TW                            | zh-HK                      | Notes                                               |
| ---------------------------------- | -------------------------------- | -------------------------- | --------------------------------------------------- |
| Gallery                            | 畫廊                             | 畫廊                       | not 圖庫                                            |
| How It Works                       | 運作原理                         | 運作原理                   |                                                     |
| FAQ / Clarifications               | 常見問題 / 釋疑                  | 常見問題 / 釋疑            |                                                     |
| Learn Hub                          | 學習中心                         | 學習中心                   |                                                     |
| Home (nav, "back to")              | 首頁                             | 主頁                       |                                                     |
| Site Map                           | **網站導覽**                     | 網站地圖                   | the Taiwan convention for a site map page           |
| Statistics                         | 統計                             | 統計                       |                                                     |
| Contracts / Source Code            | 合約 / **原始碼**                | 合約 / 源代碼              | Taiwan says 原始碼, Hong Kong 源代碼                |
| Audits / Security                  | 審計 / 安全                      | 審計 / 安全                | 審計 is the crypto-industry word in Taiwan too      |
| Terms of Service                   | 服務條款                         | 服務條款                   |                                                     |
| Privacy Policy                     | **隱私權政策**                   | 私隱政策                   |                                                     |
| Risk Disclosures                   | **風險揭露**                     | 風險披露                   |                                                     |
| wallet / Connect / Disconnect      | 錢包 / 連接錢包 / 中斷連接       | 錢包 / 連接錢包 / 中斷連接 | not 連線錢包                                        |
| transfer (NFT) / transfer (ERC-20) | 轉移 / 轉帳                      | 轉移 / 轉帳                | 帳 with 巾, not 賬                                  |
| account / balance                  | 帳戶 / 餘額                      | 帳戶 / 餘額                |                                                     |
| transaction                        | 交易                             | 交易                       |                                                     |
| participant / holder               | 參與者 / 持有者                  | 參與者 / 持有者            | counter 位                                          |
| network                            | **網路**                         | 網絡                       |                                                     |
| software / program                 | **軟體** / 程式                  | 軟件 / 程式                |                                                     |
| data / information                 | 資料 · 數據 (metrics) / **資訊** | 數據 · 資料 / 資訊         | 數據 is fine for statistics in Taiwan               |
| user                               | **使用者**                       | 用戶                       |                                                     |
| smart contract                     | **智慧合約**                     | 智能合約                   |                                                     |
| interface                          | 介面                             | 介面                       | not 界面                                            |
| device / mobile                    | 裝置 / **行動裝置**              | 裝置 / 流動裝置            |                                                     |
| digital                            | **數位**                         | 數碼                       |                                                     |
| online / real-time                 | 線上 / 即時                      | 線上 / 即時                | not 在線 / 實時                                     |
| log in / sign in                   | 登入                             | 登入                       | not 登錄                                            |
| default / settings / save          | 預設 / 設定 / 儲存               | 預設 / 設定 / 儲存         | 保存 only in the sense "preserve"                   |
| search / filter / sort             | 搜尋 / 篩選 / 排序               | 搜尋 / 篩選 / 排序         |                                                     |
| loading… / refresh / retry         | 載入中…… / 重新整理 / 重試       | 載入中…… / 重新整理 / 重試 |                                                     |
| link / video / menu                | 連結 / 影片 / 選單               | 連結 / 影片 / 選單         |                                                     |
| click / tap                        | 點選 · 點一下                    | 按 · 點擊                  | glossary preference, not scanner-enforced           |
| view / details                     | 檢視 · 查看 / 詳細資料           | 查看 / 詳情                |                                                     |
| copy address / copied              | 複製地址 / 已複製                | 複製地址 / 已複製          |                                                     |
| email                              | 電子郵件                         | 電郵                       |                                                     |
| contact                            | 聯絡                             | 聯絡                       | not 聯繫                                            |
| feedback loop                      | **回饋迴路**                     | 反饋迴路                   |                                                     |
| probability                        | **機率**                         | 概率                       |                                                     |
| quality (of content)               | 品質                             | 質素                       | 質量 is _mass_ — used correctly in the physics copy |
| screen                             | 螢幕                             | 屏幕                       |                                                     |
| server / cache                     | 伺服器 / 快取                    | 伺服器 / 快取              |                                                     |
| procedural on-chain art protocol   | 程序化鏈上藝術協議               | 程序化鏈上藝術協議         | brand tagline; never 程式化                         |
| deterministic / generative art     | 確定性 / 生成藝術                | 確定性 / 生成藝術          |                                                     |
| three-body problem                 | 三體問題                         | 三體問題                   |                                                     |
| render / seed / verified           | 渲染 / 種子 / 已驗證             | 渲染 / 種子 / 已驗證       |                                                     |
| open source / public domain        | 開源 / 公有領域                  | 開源 / 公有領域            |                                                     |
| no data / empty state              | 暫無資料                         | 暫無數據                   |                                                     |
| error / something went wrong       | 錯誤 / 發生錯誤                  | 錯誤 / 發生錯誤            |                                                     |
| try again later                    | 請稍後再試                       | 請稍後再試                 |                                                     |
| view on Arbiscan                   | 在 Arbiscan 上查看               | 在 Arbiscan 上查看         |                                                     |
| Taiwan                             | 台灣                             | 台灣                       | never 臺灣 in UI copy                               |

### 3.1 Trait vocabulary（作品特徵詞表）

Traditional renderings of [glossary-zh.md §3.1](./glossary-zh.md#31-cosmic-signature-trait-vocabulary作品特征词表);
identical in zh-HK unless noted. The wire label `Round` maps to 週期, never 輪/回合.

| English (wire)     | zh-TW                                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| trait / rarity     | 特徵 / 稀有度 · 稀有度排名                                                                                                                                         |
| Structure          | 結構 — Orbit Ribbons 軌道綢帶 · Time Chords 時間和弦 · Harmonic Weave 諧波織紋 · Tangent Caustics 切線焦散 · Stipple Constellation 點彩星群 · Nebula Veil 星雲薄紗 |
| Underlay / Accent  | 底紋 / 點綴                                                                                                                                                        |
| Symmetry           | 對稱 — Mirror 鏡像 · Rosette ×N 花結 ×N · Mandala ×N 曼陀羅 ×N                                                                                                     |
| Projection         | 投影 — Cross Braid 交叉編結 · Phase Portrait 相圖 · Hodograph 速端曲線                                                                                             |
| Wildcard / Finish  | 變數 (Yes → 是) / 質感 — Stardust 星塵 · Prism 稜鏡                                                                                                                |
| Palette            | 調色 `{hue}{scheme}` — hue and scheme words in `messages/zh-TW/traits.json`                                                                                        |
| Spectral Class     | 光譜型 (letters stay Latin: B 型)                                                                                                                                  |
| Mass Balance       | 質量配比 — Heavy Primary 主星偏重 · Twin Binary 雙星並重 · Equal Trio 三體均衡                                                                                     |
| Fate               | 命運 — Eternal Dance 永恆之舞 · Ejection 逃逸                                                                                                                      |
| Chaos / Syzygies   | 混沌度 / 連珠                                                                                                                                                      |
| Imprinted (trait)  | 銘刻時間                                                                                                                                                           |
| Allocation (trait) | 分配 — 星選 · 錨定 NFT 星選 · 收官之筆 · 最後 CST 落筆 · 堅守冠軍 · 時之勇士                                                                                       |
| Collection DNA     | 作品集基因                                                                                                                                                         |

## 4. Keep in English（保留英文）

Identical to [glossary-zh.md §4](./glossary-zh.md#4-keep-in-english保留英文): brands,
tickers (ETH, CST, NFT, ERC-20), standards (CC0), technical identifiers (SHA3-256, OKLab,
Yoshida → 四階 Yoshida 辛積分器). 以太坊 for Ethereum in prose. Language names in the
switcher are never translated: this locale is always labelled 繁體中文（台灣）.

## 5. Banned Taiwan terms（禁用詞表）

Machine-enforced as `ZH_HANT_BANNED_TERMS` (shared with Hong Kong) plus
`ZH_TW_BANNED_TERMS` in `scripts/lexicon-scan-core.ts`. The register is the same as the
Simplified list in Traditional characters; the Taiwan additions are the words Taiwan
actually uses for the banned concepts. The only sanctioned exception is FAQ/legal denial
copy inside `lexicon-allow` pragmas (or `\uXXXX` escapes in JSON catalogs).

| Banned（禁用）                                                                                         | Concept                 | Use instead（改用）     |
| ------------------------------------------------------------------------------------------------------ | ----------------------- | ----------------------- |
| 出價、競價、叫價、投標、**競標、標售、得標、喊價**                                                     | bid / auction           | 落筆 / 校準窗口         |
| 拍賣、競拍、荷蘭拍                                                                                     | auction                 | 校準窗口                |
| 獎品、獎勵、獎金、大獎、頭獎、獎池、戰利品、安慰獎                                                     | prize / jackpot         | 分配                    |
| 彩票、樂透、彩券、獎券、抽獎、抽籤、搖號、開獎、刮刮樂、**摸彩、賓果、威力彩、大樂透、運彩、運動彩券** | lottery / raffle / draw | 星選                    |
| 中獎、贏家、得主、獲勝者、優勝者                                                                       | winner                  | 獲配者                  |
| 賭博、賭場、賭注、賭客、博彩、**博弈**、下注、投注、押注、打賭、賠率、莊家、荷官、**簽注、簽賭**       | gambling                | denial copy only        |
| 抽中、碰運氣、拼手氣、幸運兒                                                                           | luck flavor             | 獲配 / 星選             |
| 遊戲、玩家、玩法、試玩、闖關                                                                           | game / play             | 協議 / 參與者 / 機制    |
| 比賽、競賽、競爭、競技、錦標賽、爭奪、對決                                                             | competition             | describe the mechanic   |
| 投資、理財、炒幣、建倉                                                                                 | invest                  | denial copy only        |
| 收益、年化、利息、分紅、股息、盈利、利潤、獲利、**報酬、獲利率、股利、配息**                           | yield / profit / return | 錨定配發 (the mechanic) |
| 賺錢、賺取、躺賺、薅羊毛、被動收入                                                                     | earn / income           | 獲得分配                |
| 質押、鑄造、鑄幣、挖礦                                                                                 | staking / mint / mining | 錨定 / 銘刻             |
| 提現、提款、**提領**、領取、認領                                                                       | withdraw / claim        | 取回                    |
| 空投、贈品、白送、免費領                                                                               | giveaway / airdrop      | describe the allocation |
| 慈善、公益、捐贈、捐款、捐獻、捐助、善款                                                               | charity / donation      | 公共財資助              |
| 去中心化自治組織                                                                                       | DAO                     | 宇宙議會                |
| 輪次、回合                                                                                             | round                   | 週期                    |
| 門票、入場券                                                                                           | ticket                  | 星選資格                |
| 免稅、抵稅                                                                                             | tax-deductible          | denial copy only        |

Style-level cautions (reviewer judgment): 行銷 (marketing — use 推廣), 回饋 in the sense
"give back" (fine as 回饋迴路), 福利, any certainty-of-gain phrasing, meme slang (梭哈、
衝、上車).

## 6. Change process（術語變更流程）

As [glossary-zh.md §6](./glossary-zh.md#6-change-process术语变更流程), sweeping
`messages/zh-TW/**`, `content/**/*.zh-TW.ts`, `content/about/zh-TW.ts`, and updating
`scripts/terminology/zh-TW.ts` (drift), `ZH_TW_BANNED_TERMS` (register), or
`SCRIPT_CONVENTIONS['zh-TW']` (characters) in the same PR. A change to a term shared with
Hong Kong is made in both glossaries or deliberately not.
