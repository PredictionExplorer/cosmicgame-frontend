# Japanese Glossary — 用語集（日本語）

This is the **single source of truth** for how Cosmic Signature's coined vocabulary is
rendered in Japanese. Every translator and reviewer works with this file open. One English
term = one Japanese term, everywhere — a term that drifts between pages breaks the
product's voice and confuses users.

The English lexicon (machine-enforced in `scripts/lexicon-scan-core.ts`, run via
`npm run lexicon:scan`) is itself a deliberate transcreation layer: _bid_ became
**Gesture**, _raffle_ became **Stellar Selection**, _staking_ became **Anchoring**. The
Japanese must do the same job: carry an **art-performance register**, never a gambling /
gaming / investment register. Japanese crypto writing is saturated with exactly the words
the English avoids (ミント, ステーキング, エアドロップ, 利回り, 当選, ガチャ) — none of them
appear here. Do not translate the underlying banned concept — translate the coined term.

Machine enforcement for this locale: the banned register in §5 is `JA_BANNED_TERMS` in
`scripts/lexicon-scan-core.ts`; the drift rules in §2–§3 are `scripts/terminology/ja.ts`
(run via `npm run terminology:check`); the mechanical conventions of
[style-guide-ja.md](./style-guide-ja.md) (no spaces around Latin tokens, full-width
punctuation, long vowels, the dropped pronoun) are `LOCALE_CONVENTIONS.ja` in
`scripts/i18n-conventions-core.ts` (run via `npm run i18n:conventions`).

> Status: **frozen with the initial Japanese release**. Amendments require the change
> process in §6 and must update all existing usages in the same PR.

---

## 1. Term formation rules（用語づくりの原則）

When a new English coinage appears, coin the Japanese with these rules:

1. **Two to four characters** for anything that must fit a button, nav item, or table
   header; the full form may be longer, but a short form must exist (パフォーマンス・サイクル
   → サイクル).
2. Draw from the **art / craft / astronomy register** (一筆, 刻印, 星選, 係留, シグネチャー,
   ギャラリー) — never from finance (収益, 配当, 投資), gaming (ゲーム, プレイヤー, ラウンド),
   or gambling (当選, 抽選, 賞金) registers.
3. Prefer a native or Sino-Japanese word over a loanword where the word is established
   (配分, 受領者, 刻印, 調律期間, 公共財, 係留). A katakana loanword is acceptable where it
   is the everyday Japanese term for the thing (サイクル, ウォレット, トークン, プロトコル,
   トランザクション, ギャラリー) — Japanese readers meet loanwords in Latin-heavy interfaces
   without friction, but a loanword that only transliterates the English coinage
   (ステラ・セレクション, クロノ・ウォリアー) is a translation debt, not a term.
4. Test every candidate in three places before adopting: a button label, a full
   sentence, and its compounds (a candidate for _Gesture_ must also work in _Gesture
   Cost_ — 一筆の費用, _ETH gesture_ — ETH一筆, _Final Gesture_ — 最後の一筆, _gesture
   count_ — 筆数). Japanese has no agreement, so compounds and the counter word (§5 of
   the style guide) are the tests.
5. Check the term's other readings and homophones for unwanted flavors: 星選 (せいせん)
   deliberately echoes 精選 "careful selection"; 係留 must never be spelled 繋留; 監査 is
   unambiguous in Japanese (unlike Korean 감사), so it needs no qualifier.
6. Established Japanese crypto terms are used where they are neutral (ウォレット, トークン,
   コントラクト, トランザクション, オンチェーン, ガス) and avoided where the English
   deliberately avoided them (ステーキング, ミント, クレーム, エアドロップ, 出金).

## 2. Core coinages — decisions with rationale（中核用語）

### Gesture (was _bid_) → 一筆

The load-bearing term of the whole site. _Gesture_ is an expressive act that shapes an
artwork. **一筆** (ひとふで, "one stroke of the brush") is the calligrapher's word for
exactly that: a single deliberate mark left on the work. It carries no auction flavor, it
counts naturally with the stroke counter (筆数), and it takes every compound the interface
needs. The idiom 一筆を入れる ("to put in a stroke") is the verb.

| English                            | 日本語                   |
| ---------------------------------- | ------------------------ |
| Make a Gesture (CTA)               | 一筆を入れる             |
| a gesture / this gesture           | 一筆 / この一筆          |
| ETH gesture / CST gesture          | ETH一筆 / CST一筆        |
| Gesture with ETH (button)          | ETHで一筆                |
| Gesture Cost                       | 一筆の費用               |
| Final Gesture                      | 最後の一筆               |
| Last Gesture (most recent)         | 最新の一筆               |
| gesture count / Number of Gestures | 筆数                     |
| Total Gestures                     | 一筆の総数               |
| Live gestures                      | 直近の一筆               |
| Gestures with CST                  | CSTでの一筆              |
| Gesture #42                        | 一筆 #42                 |
| last gesturer                      | 最後に一筆を入れた参加者 |

Rejected: ジェスチャー (in Japanese it means a hand or body movement and names the party
game ジェスチャーゲーム — precisely the register to avoid), 一手 (a move in shogi or go —
game framing), 入札 (banned), 筆致 (brushwork as a quality, not countable).

### Performance Cycle (was _round_) → パフォーマンス・サイクル (short: サイクル)

**パフォーマンス** is the established Japanese word for performance art (パフォーマンス
アート), so the compound reads as an artistic act; the nakaguro keeps the two loanwords
legible. The bare short form in dense UI is **サイクル**, which Japanese interfaces already
use for recurring periods. **Never** ラウンド / 回戦 (banned, tournament flavor), never
周期 (reads as "periodicity" and cannot take a number — サイクル12 works, 周期12 does not),
never 性能 (the classic mistranslation of _performance_).

Cycle numbers follow the English: **サイクル12**, the way seasons and episodes are labeled
(シーズン12). Where a column header needs the word _number_, use **サイクル番号**.

| English                      | 日本語                   |
| ---------------------------- | ------------------------ |
| Performance Cycle            | パフォーマンス・サイクル |
| Current Cycle / Active Cycle | 現在のサイクル           |
| Cycle 12 / Cycle #12         | サイクル12               |
| Cycle Opening                | サイクル開始             |
| Total Cycles                 | 総サイクル数             |
| cycle timeline               | サイクルのタイムライン   |
| next cycle                   | 次のサイクル             |

### Finalize / Finalization → 確定 / 確定する

**確定** is the everyday word for a period becoming final (当日確定, 締め切り後に確定) —
dignified, neutral, and it names the moment rather than a settlement. The countdown that
drives the whole cycle is the **確定カウントダウン**. Never ファイナライズ (calque), never
精算 / 決算 (settlement — finance flavor), never 終了 (a mere ending with no distribution
in it), never 締結 (a contract is concluded).

| English                   | 日本語                |
| ------------------------- | --------------------- |
| Finalize (button)         | サイクルを確定        |
| Cycle Finalization Time   | サイクル確定時刻      |
| Open-Finalization Window  | 公開確定期間          |
| exclusivity window        | 優先確定期間          |
| Finalization countdown    | 確定カウントダウン    |
| When the cycle finalizes… | サイクルが確定すると… |
| finalizer                 | 確定実行者            |

### Calibration Window (was _Dutch auction_) → 調律期間

**調律** is the tuning of an instrument — a musician's word for bringing a value into
place, which is exactly what the descending price does — and **期間** is how Japanese
names a span of time. Together they describe a settling price without a hint of an
auction. オークション / 入札 / 競売 are banned. Rejected: 校正 (proofreading in everyday
Japanese), 較正 (instrument calibration — laboratory register), ウィンドウ (a GUI window).

| English                              | 日本語                   |
| ------------------------------------ | ------------------------ |
| Calibration Window                   | 調律期間                 |
| calibration ceiling / floor          | 調律上限 / 調律下限      |
| the price descends during the window | 期間中に価格が下がります |

### Allocation (was _prize_) → 配分

**配分** (allocation, apportionment) is the neutral administrative word: a share assigned
by rule. Never 賞金 / 賞品 / 景品 (banned), never 報酬 (remuneration — payment for work),
never 分配 (distribution — reserved for the mechanics of splitting), never 割り当て
(assignment of a slot or an ID).

| English                       | 日本語                      |
| ----------------------------- | --------------------------- |
| Allocation                    | 配分                        |
| Signature Allocation          | シグネチャー配分            |
| Chrono-Warrior Allocation     | 時の戦士配分                |
| Endurance Champion Allocation | 持久チャンピオン配分        |
| Allocation Tracks             | 配分トラック                |
| Allocations Wallet / escrow   | 配分ウォレット / エスクロー |
| retrieved allocations         | 受け取り済みの配分          |

### Recipient (was _winner_) → 受領者

**受領者** (one who receives) — a role, not a victory. Never 勝者 / 当選者 / 優勝者
(banned), never 受取人 (the payee on a bank form), never 受益者 (a beneficiary of a trust).

### Stellar Selection (was _raffle_) → 星選

A coinage, like the Chinese 星选: **星選** (せいせん) — "selection by the stars" — with the
homophone 精選 "careful selection" resonating underneath. It is short enough for chips and
column headers and takes ETH / NFT directly (星選ETH, 星選NFT). On first mention in
long-form copy, gloss the reading once: 星選（せいせん）. Never 抽選 / 宝くじ / ラッフル
(banned), never ステラ・セレクション (transliteration debt).

| English                                     | 日本語                   |
| ------------------------------------------- | ------------------------ |
| Stellar Selection                           | 星選                     |
| Stellar Selection ETH / NFT                 | 星選ETH / 星選NFT        |
| Anchored-NFT Stellar Selection              | 係留NFT星選              |
| Anchored Selection (trait chip)             | 係留星選                 |
| Stellar Selection Pool                      | 星選プール               |
| Stellar Selection ETH Deposited / Retrieved | 星選ETHの積立 / 受け取り |
| Stellar Selection entry (eligibility)       | 星選の対象               |
| draw (the act of selecting)                 | 選定                     |
| with replacement                            | 復元抽出                 |

### Anchoring (was _staking_) → 係留

**係留** (けいりゅう) is mooring a vessel — a ship held in place by a line to an anchor. It
is the everyday harbor word, carries the anchor image the English chose, and has no
financial reading whatsoever. Always the 係 spelling; 繋留 is a variant the terminology
gate rejects. Never ステーキング / ステーク / ロックアップ / 預け入れ (banned), never
アンカリング (transliteration), never 固定 (a layout word).

| English                   | 日本語                    |
| ------------------------- | ------------------------- |
| Anchor (verb) / Anchoring | 係留する / 係留           |
| Anchor your NFT           | NFTを係留する             |
| release / unanchor        | 係留解除 / 係留を解除する |
| Anchor-holder             | 係留者                    |
| Anchored NFTs             | 係留中のNFT               |
| Anchor action             | 係留の操作                |

### Anchor Distribution (was _yield_) → 係留配分

The ETH an anchor-holder receives is an **allocation from anchoring**, so the term reuses
配分. Never 利回り / 収益 / 配当 / 利息 (banned), never 報酬 (remuneration), never 係留分配.

| English                        | 日本語         |
| ------------------------------ | -------------- |
| Anchor Distribution            | 係留配分       |
| Anchor Distributions (amounts) | 係留配分額     |
| Anchor Distribution deposits   | 係留配分の積立 |
| Anchor Distribution breakdown  | 係留配分の内訳 |

### Retrieve (was _withdraw/claim_) → 受け取る / 受け取り

**受け取る** (to receive, to take delivery) is what a participant does with something
that is already theirs; the noun is **受け取り**. Always with the okurigana け (受取り and
受取 are drift). Never 引き出し / 出金 / クレーム / 換金 (banned), never 回収 (recovering
something lost), never 請求 (a bill or a legal claim).

| English                  | 日本語                  |
| ------------------------ | ----------------------- |
| Retrieve (button)        | 受け取る                |
| Retrieved / retrievals   | 受け取り済み / 受け取り |
| Retrieve your allocation | 配分を受け取る          |
| Public Goods retrievals  | 公共財の受け取り        |

### Imprint (was _mint_) → 刻印

**刻印** (engraving, imprinting a mark) — the artwork is inscribed into the chain. Never
ミント / 鋳造 (banned), never 発行 (issuance — paperwork register), never インプリント.

| English                | 日本語               |
| ---------------------- | -------------------- |
| Imprint (verb)         | 刻印する             |
| Imprinted at           | 刻印日時             |
| Imprint RandomWalk NFT | RandomWalk NFTの刻印 |
| premine                | 事前刻印             |

### Endurance Champion → 持久チャンピオン; Chrono-Warrior → 時の戦士

**持久** (endurance, staying power — 持久力, 持久走) with **チャンピオン**, which Japanese
uses for a title-holder in any field, not only sport; never 優勝者 / 勝者 (banned). The
Chrono-Warrior is **時の戦士** — the warrior of time — a phrase Japanese fantasy and
science fiction already own, which is the right register for a title. Both are 称号
(titles).

| English                   | 日本語                  |
| ------------------------- | ----------------------- |
| Endurance Champion        | 持久チャンピオン        |
| Chrono-Warrior            | 時の戦士                |
| current champion / holder | 現在の持久チャンピオン  |
| Champion Time / reign     | 先頭保持時間 / 保持期間 |

### Cosmic Council (was _DAO_) → 宇宙評議会

**評議会** is the word for a deliberative council (大学評議会, 国家評議会); 宇宙 keeps the
brand image. Never DAO / ダオ (banned in copy; the ticker-like acronym may appear only in
denial copy), never 宇宙議会 (a legislature).

### Public Goods (was _charity/donation_) → 公共財

**公共財** is the economics term (public goods) and carries none of the charity register.
Contributions to it are **拠出** (a contribution of funds to a common pool — 拠出金),
never 寄付 / 寄附 / 募金 (banned). The vault is the **公共財金庫**.

| English                             | 日本語                 |
| ----------------------------------- | ---------------------- |
| Public Goods                        | 公共財                 |
| Public Goods Vault                  | 公共財金庫             |
| Protocol Public Goods contributions | プロトコルの公共財拠出 |
| voluntary contributions             | 自発的な公共財拠出     |

### Compounding Cycle Reserve → 累積準備金

The share carried into the next cycle **accumulates**: **累積準備金**. Never 複利 (compound
interest — finance), never 積立 (savings), never 繰越 alone.

| English                         | 日本語           |
| ------------------------------- | ---------------- |
| Compounding Cycle Reserve       | 累積準備金       |
| Next Cycle Seed (reserve share) | 次サイクル繰越分 |

### Signature (the artwork) → シグネチャー

The artwork keeps brand coherence with "Cosmic Signature" and stays distinct from the
everyday 署名 (a handwritten or cryptographic signature). Where cryptographic signatures
appear in the same context (wallet copy: "sign the transaction"), those are **署名**.
Always with the long vowel; シグネチャ and シグニチャー are drift.

| English                                  | 日本語                                     |
| ---------------------------------------- | ------------------------------------------ |
| the cycle's final Signature              | サイクルの最終シグネチャー                 |
| Every Gesture Shapes the Signature.      | すべての一筆がシグネチャーを形づくります。 |
| a Signature (artwork, ambiguous context) | シグネチャー作品                           |
| sign the transaction (wallet)            | トランザクションに署名                     |

### Outreach Reserve (was _marketing_) → 広報準備金

**広報** (public relations, outreach — 広報活動) is how institutions name telling people
about themselves, and it carries none of the sales register of マーケティング / 宣伝 / 広告
(banned). The reserve is a **準備金**.

## 3. General term table（一般用語）

Interface vocabulary — no coinage needed, but fixed for consistency:

| English                              | 日本語                                          | Notes                                                   |
| ------------------------------------ | ----------------------------------------------- | ------------------------------------------------------- |
| Gallery                              | ギャラリー                                      | never 画廊                                              |
| How It Works                         | 仕組み                                          | never 使い方 (a help page)                              |
| FAQ / Clarifications                 | よくある質問                                    | nav and page heading alike                              |
| Learn Hub                            | 学習ハブ                                        |                                                         |
| About                                | Cosmic Signatureについて                        | short form in nav: 概要                                 |
| Statistics                           | 統計                                            |                                                         |
| My Statistics / My Tokens            | 自分の統計 / 自分のNFT                          | 自分の, never 私の or マイ                              |
| Site Map                             | サイトマップ                                    | one word                                                |
| Contracts                            | コントラクト                                    | smart contracts; 契約 is a legal contract               |
| Source Code                          | ソースコード                                    |                                                         |
| Audits                               | 監査                                            |                                                         |
| Security                             | セキュリティ                                    |                                                         |
| Terms of Use                         | 利用規約                                        | the Japanese legal convention                           |
| Privacy Policy                       | プライバシーポリシー                            | never 個人情報保護方針 (a corporate statement)          |
| Risk Disclosures                     | リスク開示                                      |                                                         |
| White Paper                          | ホワイトペーパー                                | never 白書 (a government report)                        |
| Knowledge quiz / quiz tier           | 知識クイズ / 基礎・中級・上級                   | クイズ is educational in Japanese; never ゲーム         |
| score / result (quiz)                | スコア / 結果                                   |                                                         |
| Outreach Transactions                | 広報トランザクション                            |                                                         |
| Participation CST                    | 参加CST                                         |                                                         |
| Recognition CST                      | 功労CST                                         |                                                         |
| Attached NFTs / attach               | 添付されたNFT / 添付する                        | assets attached to gestures                             |
| Named Tokens / name (verb)           | 名前付きトークン / 名前を付ける                 |                                                         |
| Used Random Walk NFTs                | 使用済みのRandom Walk NFT                       |                                                         |
| token / tokens                       | トークン                                        | Japanese has no plural marker; never トークンたち       |
| wallet / Connect Wallet / Disconnect | ウォレット / ウォレットを接続 / 接続を解除      |                                                         |
| transfer (ERC-20 / CST)              | 送付                                            | 送金 is a bank transfer; 振込 likewise                  |
| transfer (NFT ownership)             | 移転                                            | the property-law word                                   |
| transaction                          | トランザクション                                | 取引 is a trade (Uniswap copy only)                     |
| participant                          | 参加者                                          | never プレイヤー (banned), never 参加ユーザー           |
| Unique Participants                  | ユニーク参加者                                  |                                                         |
| user (UI and legal alike)            | ユーザー                                        | with the long vowel; 利用者 in legal copy is acceptable |
| holder                               | 保有者                                          |                                                         |
| balance                              | 残高                                            |                                                         |
| supply / total supply                | 供給量 / 総供給量                               |                                                         |
| deposit (into pools)                 | 積立                                            | never 預け入れ / 預入 (banned — the staking words)      |
| distribute (general, not Anchor D.)  | 配分する / 配る                                 | never 支給                                              |
| indexed (by the API)                 | インデックス済み                                |                                                         |
| on-chain                             | オンチェーン                                    | オンチェーンアート                                      |
| procedural on-chain art protocol     | プロシージャル・オンチェーンアート・プロトコル  | brand tagline; プロシージャル is the CG term            |
| deterministic                        | 決定論的                                        |                                                         |
| generative art                       | ジェネラティブアート                            | the Japanese art-scene term                             |
| three-body problem                   | 三体問題                                        | the standard physics term                               |
| Newtonian gravity                    | ニュートン重力                                  |                                                         |
| seed                                 | シード                                          | シード値 for "seed value"                               |
| render / rendering                   | レンダリング                                    |                                                         |
| verified / verification              | 検証済み / 検証                                 | contracts; never 認証 (authentication)                  |
| reproducible                         | 再現可能                                        |                                                         |
| open source                          | オープンソース                                  |                                                         |
| public domain                        | パブリックドメイン                              | CC0 context                                             |
| formally verified                    | 形式検証済み                                    | the CS term                                             |
| system event / system mode           | システムイベント / システムモード               |                                                         |
| admin / internal (tools)             | 管理者 / 内部ツール                             |                                                         |
| loading…                             | 読み込み中…                                     | never ローディング中                                    |
| no data / empty state                | データなし                                      |                                                         |
| error                                | エラーが発生しました / エラー                   | surface-dependent, see style guide                      |
| retry / try again later              | 再試行 / しばらくしてからもう一度お試しください |                                                         |
| copy address / copied                | アドレスをコピー / コピーしました               |                                                         |
| view on Arbiscan                     | Arbiscanで見る                                  |                                                         |

### 3.1 Cosmic Signature trait vocabulary（作品特性の用語）

The metadata pipeline publishes each Signature's traits as OpenSea-style attributes.
The frontend never renders the wire labels: every trait type and every closed-set value
goes through `messages/{locale}/traits.json` (mapping in `lib/nftMetadata/labels.ts`).
Open vocabularies (palette names) are composed from a hue word plus a scheme word. The
wire label `Round` maps to サイクル, never ラウンド.

| English (wire)                 | 日本語                | Notes                                                                                                                                                                                  |
| ------------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| trait / traits                 | 特性                  | never 属性 (wire-shape flavor)                                                                                                                                                         |
| rarity / rarity rank           | 希少度 / 希少度ランク | descriptive of frequency only; no value or collectibility framing                                                                                                                      |
| Structure                      | 構造                  |                                                                                                                                                                                        |
| Underlay                       | 下地                  |                                                                                                                                                                                        |
| Accent                         | アクセント            |                                                                                                                                                                                        |
| Symmetry                       | 対称                  | Mirror 鏡像 · Rosette ×N ロゼット×N · Mandala ×N マンダラ×N                                                                                                                            |
| Projection                     | 投影                  | Cross Braid 交差編み · Phase Portrait 位相図 · Hodograph ホドグラフ                                                                                                                    |
| Wildcard                       | ワイルドカード        | value Yes → あり                                                                                                                                                                       |
| Finish                         | 質感                  | Stardust 星屑 · Prism プリズム                                                                                                                                                         |
| Palette                        | パレット              | `{hue}{scheme}` with no space                                                                                                                                                          |
| palette hue words              | see traits.json       | Amber アンバー · Aurora オーロラ · Cerulean セルリアン · Ember 残り火 · Glacial 氷河 · Jade 翡翠 · Nebular 星雲 · Orchid 蘭 · Rose 薔薇 · Sapphire サファイア · Solar 太陽 · Violet 菫 |
| palette scheme words           | see traits.json       | Mono 単色 · Split 分裂 · Analogous 類似 · Triad 三色 · Complementary 補色 · Tetrad 四色                                                                                                |
| Spectral Class                 | スペクトル型          | letters O–M stay Latin: Class B → B型                                                                                                                                                  |
| Mass Balance                   | 質量バランス          | Heavy Primary 重い主星 · Twin Binary 双子の連星 · Equal Trio 均等な三体                                                                                                                |
| Fate                           | 運命                  | Eternal Dance 永遠の舞 · Ejection 放出                                                                                                                                                 |
| Chaos (index)                  | カオス指数            | 0–100                                                                                                                                                                                  |
| Syzygies                       | 朔望                  | three-body alignments; the classical astronomical term                                                                                                                                 |
| Imprinted (trait)              | 刻印                  |                                                                                                                                                                                        |
| Allocation (trait)             | 配分                  | values reuse §2                                                                                                                                                                        |
| structure vocabulary values    | see traits.json       | Orbit Ribbons 軌道リボン · Time Chords 時の和音 · Harmonic Weave 調和の織り · Tangent Caustics 接線コースティクス · Stipple Constellation 点描星座 · Nebula Veil 星雲のヴェール        |
| Collection DNA (gallery strip) | コレクションDNA       |                                                                                                                                                                                        |
| quick view                     | クイックビュー        |                                                                                                                                                                                        |
| spectral sweep (video)         | スペクトルスイープ    |                                                                                                                                                                                        |

### 3.2 Protocol nouns fixed during the rollout（ロールアウト中に確定した用語）

Terms the English copy uses without coining them, fixed here the first time a Japanese
sentence needed them so every surface says the same thing:

| English                                    | 日本語                                               | Notes                                                           |
| ------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------- |
| time increment                             | 時間増分                                             |                                                                 |
| exclusivity window (Final Gesture)         | 優先確定期間                                         | parallel to 公開確定期間                                        |
| finalizer                                  | 確定実行者                                           |                                                                 |
| cycle beneficiary                          | サイクル受領者                                       | シグネチャー配分の受領者 when the role is spelled out           |
| Allocations Wallet / escrow                | 配分ウォレット / エスクロー                          |                                                                 |
| Public Goods Vault                         | 公共財金庫                                           |                                                                 |
| calibration ceiling / floor                | 調律上限 / 調律下限                                  |                                                                 |
| Minimum CST Reward Protection              | 最低参加CST保護                                      | the "reward" is 参加CST, never 報酬                             |
| Recognition CST imprint of 1,000 CST       | 1,000 CSTの功労CST                                   | the ticker keeps its ASCII space                                |
| Stellar Selection entry / draw             | 星選の対象 / 選定                                    | "with replacement" → 復元抽出 (statistics term)                 |
| Selection stage (art pipeline, Borda)      | 選抜                                                 | keeps 選定 for 星選                                             |
| RandomWalk discount / cost reduction       | 割引                                                 | never 減免                                                      |
| burn (CST) / consumed (statistics)         | 焼却 / 消費                                          | mirrors the English distinction                                 |
| leaderboard / live standings               | 順位表 / ライブ順位                                  | リーダーボード has a gaming flavor                              |
| free (a gesture may become free)           | 費用なし / 費用なしで                                | reframe; never 無料 as a selling word                           |
| Net % / Spent / Received / Net             | 純増減率 / 支出 / 受領 / 純額                        | never 収益率                                                    |
| Gesture Duration / Champion Time / reign   | 保持時間 / 先頭保持時間 / 保持期間                   |                                                                 |
| (You) badge                                | （自分）                                             |                                                                 |
| Amount (ETH) / Amount (token quantity)     | 金額 / 数量                                          |                                                                 |
| From / To (transfers)                      | 送付元 / 送付先                                      |                                                                 |
| treasurer (Outreach Reserve)               | 財務担当者                                           |                                                                 |
| Unavailable (metric fallback)              | 取得不可                                             | データなし is the empty state                                   |
| Deck / Observatory                         | 観測所                                               |                                                                 |
| How It Works (marketing steps section)     | 参加の流れ                                           | the page itself stays 仕組み                                    |
| Bucket / Interpolation                     | 集計単位 / 補間                                      |                                                                 |
| divisor                                    | 除数                                                 |                                                                 |
| block explorer                             | ブロックエクスプローラー                             |                                                                 |
| prediction market                          | 予測市場                                             |                                                                 |
| ecosystem                                  | エコシステム                                         |                                                                 |
| Governance Surface (Council)               | 調整機構                                             | ガバナンス is drift                                             |
| coordination changes                       | 調整の変更                                           |                                                                 |
| Digital Collectible                        | デジタルコレクティブル                               |                                                                 |
| lock-up / No Lockup                        | ロック / ロックなし                                  | ロックアップ is banned                                          |
| premine                                    | 事前刻印                                             |                                                                 |
| revert (transaction)                       | 取り消されます                                       |                                                                 |
| premium (V3 multiplier)                    | 割増倍率                                             |                                                                 |
| dust threshold                             | ダスト閾値                                           |                                                                 |
| title (Endurance Champion, Chrono-Warrior) | 称号                                                 |                                                                 |
| Published by                               | 公開者                                               | 発行 is drift                                                   |
| COSMIC mutational signatures (denial)      | 変異シグネチャー                                     | the genomics term                                               |
| parameter                                  | パラメーター                                         | with the long vowel                                             |
| trade-off                                  | トレードオフ                                         |                                                                 |
| snapshot                                   | スナップショット                                     |                                                                 |
| reentrancy guard                           | 再入防止ガード                                       |                                                                 |
| seed phrase                                | シードフレーズ                                       | シード alone is the RNG seed                                    |
| Ethereum core contributors                 | Ethereumコア貢献者                                   | 貢献者 is a person; 拠出 is a contribution of ETH or NFTs       |
| funding mechanism (Protocol Guild)         | 資金支援メカニズム                                   |                                                                 |
| preview                                    | プレビュー                                           |                                                                 |
| swap (Uniswap)                             | スワップ                                             |                                                                 |
| asset (attached ERC-20 / media asset)      | アセット                                             | third-party dependencies → 第三者の依存関係, フォント, アセット |
| typical cycle                              | 標準的なサイクル                                     |                                                                 |
| severity: critical / informational         | 重大 / 情報                                          | audit findings                                                  |
| Knowledge Base (FAQ badge)                 | ナレッジベース                                       |                                                                 |
| Chaos Zero market question                 | このサイクルは前のサイクルより多い筆数で確定するか？ | quoted verbatim wherever the market is described                |

Narrative durations that are not protocol facts are spelled in words (十時間, 二日, 一日),
so the numeric-claims guard never mistakes them for a pinned figure.

**Random Walk NFT / RandomWalk NFT.** The English itself uses both (the brand is "Random
Walk NFT", the contract is `RandomWalkNFT`, and several strings say "RandomWalk NFT").
Mirror the spelling of each English source string; never "translate" one form into the
other.

**Reviewer cautions for substring-matched drift.** 属性 is not a scanner variant of 特性
because it sits inside ordinary words; a reviewer still rejects 属性 for _trait_. 固定 is
not a variant of 係留 because layouts have 固定ヘッダー; a reviewer still rejects it for
_anchoring_.

## 4. Keep in English（英語のまま）

Never translated or transliterated, in any surface. Latin tokens take Japanese particles
directly, with no space (style guide §4): ETHを, CSTが, NFTを, Arbitrumで, Cosmic
Signatureは.

- **Brands/products:** Cosmic Signature, Random Walk NFT, Protocol Guild, Arbitrum,
  Arbitrum One, Ethereum¹, Uniswap, Axiom Zero, Chaos Zero, MetaMask, WalletConnect,
  Coinbase Wallet, Safe, GitHub, Discord, X (Twitter), Arbiscan
- **Tokens/tickers:** ETH, CST, NFT, ERC-20, ERC-721
- **Licenses/standards:** CC0, CC0 1.0, BCP 47
- **Technical identifiers:** SHA3-256, SHA-256, OKLab, AgX, OpenSimplex, H.265, PNG, RNG,
  Yoshida (4th-order Yoshida symplectic integrator → 4次ヨシダ・シンプレクティック積分器),
  Borda (ボルダ集計), API, UTC
- **Language names in the switcher:** English stays "English", 中文 stays "中文",
  Українська stays "Українська", 한국어 stays "한국어", Japanese stays "日本語"

¹ Ethereum: **イーサリアム** is the established Japanese spelling and is used in prose; the
ticker stays ETH.

## 5. Banned Japanese terms（禁止語彙）

Mirrors the English banned list (`scripts/lexicon-scan-core.ts`) with the same scope,
extended only with Japanese vocabulary that carries the banned flavor. Japanese writes
without spaces (再投資, NFTミント), so the scanner matches these as substrings. As in
English, the **only** sanctioned exception is FAQ/legal _denial_ copy inside
`lexicon-allow` pragmas (TS) or `\uXXXX` escapes (JSON), e.g. "これは宝くじでもギャンブルでも
ありません".

| Banned（禁止）                                                                                                             | Concept               | Use instead（代わりに）                 |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------- |
| オークション, 競売, 入札, 落札, 競り                                                                                       | bid / auction         | 一筆 / 調律期間                         |
| 賞金, 賞品, 景品, 懸賞, 大当たり, ジャックポット                                                                           | prize / jackpot       | 配分                                    |
| 当選, 勝者, 優勝, 勝利, 受賞                                                                                               | winner                | 受領者                                  |
| 抽選, 抽籤, 宝くじ, くじ引き, ロッタリー, ラッフル, 福引, ガチャ                                                           | lottery / raffle      | 星選                                    |
| ギャンブル, 賭博, 賭け, 賭場, カジノ, 胴元, オッズ, ベッティング, パチンコ                                                 | gambling / bet / odds | denial copy only                        |
| 幸運, ラッキー, 運試し, 一発逆転, チャンス                                                                                 | luck flavor           | 配分を受け取る / 星選                   |
| チケット, 参加券                                                                                                           | ticket                | 星選の対象                              |
| ゲーム, ゲーマー, プレイヤー, 勝負, 対戦, 対決, トーナメント, 大会, コンテスト, 競争, 競技, バトル                         | game / play(er)       | プロトコル / 参加者 / メカニズム        |
| 投資, 利回り, 収益, 利益, 利潤, 儲け, 儲かる, 稼ぐ, 稼げる, 利息, 利子, 配当, リターン, 収入, 所得, 資産運用, 運用益, 金利 | invest / yield        | 係留配分 (for the mechanic)             |
| 免税, 税控除                                                                                                               | tax-deductible        | denial copy only                        |
| ガチホ, 爆上げ, 億り人                                                                                                     | crypto slang          | —                                       |
| ステーキング, ステーク, ロックアップ, 預け入れ, 預入                                                                       | staking               | 係留                                    |
| ミント, ミンティング, 鋳造, マイニング, 採掘                                                                               | mint / mining         | 刻印                                    |
| 引き出し, 出金, キャッシュアウト, 換金, 現金化, クレーム, ペイアウト, 払い出し                                             | withdraw / claim      | 受け取る                                |
| 慈善, チャリティ, 寄付, 寄附, 寄贈, 募金, 献金, ドネーション                                                               | charity / donation    | 公共財拠出 (denial copy only otherwise) |
| ダオ                                                                                                                       | DAO                   | 宇宙評議会                              |
| マーケティング, 宣伝, 広告, 販促, プロモーション                                                                           | marketing             | 広報                                    |
| ラウンド, 回戦                                                                                                             | round                 | サイクル / サイクルN                    |

Style-level cautions (not scanner-banned, reviewer judgment): 報酬 ("remuneration" — never
for _allocation_ or _Anchor Distribution_), 特典 (a perk — sales register), 確率 (fine for
_probability_, never for _odds_), 無料 (reframe as 費用なし), 獲得 (fine for "obtain a
title", never for "win"), and any certainty-of-gain phrasing (必ず受け取れます) — legally
dangerous. Words the scanner catches inside other words: write 背景 rather than
バックグラウンド (ラウンド), 関係者 rather than ステークホルダー (ステーク), 損害 or 不都合
rather than 不利益 (利益). Words deliberately left unscanned because an innocent word
contains them — never use them in the banned sense: ロト (プロトコル), ベット
(アルファベット), プレイ (ディスプレイ), くじ (bare hiragana runs).

## 6. Change process（変更手順）

1. Propose the change in a PR that edits this file: old term, new term, rationale,
   affected surfaces.
2. In the **same PR**, update every existing usage: search `messages/ja/**`,
   `content/**/text*.ja.ts`, `content/about/ja.ts`, and the legal `content/legal/*.ja.ts`
   copy modules for the old term.
3. A native-fluency reviewer approves the term; an engineer confirms the sweep is
   complete (`npm run terminology:check` and `npm run lexicon:scan` pass).
4. If the term is scanner-relevant (banned or replaces a banned concept), update
   `JA_BANNED_TERMS` in `scripts/lexicon-scan-core.ts` and the rules in
   `scripts/terminology/ja.ts` in the same PR.
