# Simplified Chinese Glossary — 术语表（简体中文）

This is the **single source of truth** for how Cosmic Signature's coined vocabulary is
rendered in Simplified Chinese. Every translator and reviewer works with this file open.
One English term = one Chinese term, everywhere — a term that drifts between pages breaks
the product's voice and confuses users.

The English lexicon (specified in `marketing/cosmic-lexicon.md` per code comments; the
machine-enforced term list lives in `scripts/lexicon-scan-core.ts` and runs via
`yarn lexicon:scan`) is itself a deliberate transcreation layer: _bid_ became **Gesture**,
_raffle_ became **Stellar Selection**, _staking_ became **Anchoring**. The Chinese must do the same job:
carry an **art-performance register**, never a gambling / gaming / investment register.
Do not translate the underlying banned concept — translate the coined term.

> Status: **frozen after Sprint 2 (2026-07-18)**. Amendments now require the change process
> in §6 and must update all existing usages in the same PR.

---

## 1. Term formation rules（造词规则）

When a new English coinage appears, coin the Chinese with these rules:

1. **2–4 characters** for anything that must fit a button, nav item, or table header.
2. Draw from the **art / astronomy / calligraphy register** (笔、章、刻、锚、星、廊),
   matching the protocol's tone — never from finance (收益、回报), gaming (玩法、闯关),
   or gambling (奖、彩) registers.
3. Test every candidate in three places before adopting: a button label, a full sentence,
   and its compounds (e.g. a candidate for _Gesture_ must also work in _Gesture Cost_,
   _ETH gesture_, _Final Gesture_, _gesture count_).
4. Check collocations and homophones for unwanted flavors (e.g. anything that commonly
   collocates with 奖、赌、赚 is out).
5. Established crypto-Chinese terms are used where they are neutral (钱包、代币、合约、
   金库), and avoided where the English deliberately avoided them (提现、质押、铸造).

## 2. Core coinages — decisions with rationale（核心术语定案）

### Gesture（原 bid）→ 落笔

The load-bearing term of the whole site. _Gesture_ is an expressive act that shapes an
artwork; the direct translations fail: 手势 means a touchscreen gesture, 姿态 collides
with the idiom 摆姿态 (posturing, insincere show).

**Decision: 落笔** — "to set brush to paper," the stroke that commits ink. It is
art-native, verb-ready, two characters, and its noun form 一笔 doubles as the natural
Chinese counter for both brushstrokes _and_ transactions. It makes the brand promise
compose perfectly: 每一笔，都在塑造签名 ("Every Gesture Shapes the Signature").

| English                            | 中文                |
| ---------------------------------- | ------------------- |
| Make a Gesture (CTA)               | 落笔                |
| a gesture / this gesture           | 一笔 / 这一笔       |
| ETH gesture / CST gesture          | ETH 落笔 / CST 落笔 |
| Gesture Cost                       | 落笔价格            |
| Final Gesture                      | 收官之笔            |
| gesture count / Number of Gestures | 落笔次数            |
| Live gestures                      | 实时落笔            |
| Gestures with CST                  | CST 落笔            |

Runner-up considered: 姿态 (rejected: posturing idiom); 手势 (rejected: touch-UI flavor);
参与 (rejected: too bland, already used for _participation_).

### Performance Cycle（原 round）→ 演绎周期（简称：周期）

演绎 is an interpretive artistic rendition — closer to _performance_ in the artistic
sense than 演出 (a staged show) or 表演 (performing for an audience). The bare short form
in dense UI is 周期. **Never** 轮 / 轮次 / 回合 (round-flavored; see banned list).

| English                      | 中文         |
| ---------------------------- | ------------ |
| Performance Cycle            | 演绎周期     |
| Current Cycle / Active Cycle | 当前周期     |
| Cycle 12 / Cycle #12         | 第 12 个周期 |
| Cycle Opening                | 周期开启     |
| Total Cycles                 | 周期总数     |

### Finalize / Finalization → 收官

收官 comes from Go (围棋) endgame and is standard elevated Chinese for "the closing
phase/act" (收官之战、收官之作). It is dignified, art-adjacent, and verb-ready for the
Finalize button. Never 最终确定 (translationese) or 结算 (settlement — finance flavor).

| English                   | 中文         |
| ------------------------- | ------------ |
| Finalize (button)         | 收官         |
| Cycle Finalization Time   | 周期收官时间 |
| Open-Finalization Window  | 公开收官窗口 |
| When the cycle finalizes… | 周期收官时…… |

`周期收官时间` is the full mechanic name used in definitions and labels. In running
Chinese that describes the clock starting, extending, or reaching zero, use the natural
short form `收官倒计时` (for example, `首笔落笔会启动收官倒计时`).

### Calibration Window（原 Dutch auction）→ 校准窗口

Technical, precise, zero auction flavor. 拍卖 / 竞拍 / 荷兰拍 are banned.

| English                                | 中文                  |
| -------------------------------------- | --------------------- |
| Calibration Window                     | 校准窗口              |
| CST Calibration Window                 | CST 校准窗口          |
| The first ETH Calibration Window opens | 首个 ETH 校准窗口开启 |

### Allocation（原 prize）→ 分配（一份分配）

分配 is the neutral distribution/allotment term. A countable allocation is 一份分配
(the counter 份 keeps it a "share handed over," not a prize). 奖 / 奖励 / 奖金 / 奖品
are banned in all forms.

| English                       | 中文             |
| ----------------------------- | ---------------- |
| Allocation                    | 分配             |
| Signature Allocation          | 签名分配         |
| Chrono-Warrior Allocation     | 时之勇士分配     |
| Endurance Champion Allocation | 坚守冠军分配     |
| Final CST Gesture Allocation  | CST 收官之笔分配 |
| Public Goods Allocation       | 公共物品分配     |
| allocation tracks             | 分配轨道         |
| Allocations Distributed       | 已发放分配       |
| My Allocations                | 我的分配         |

Note: 轨道 (orbit/track) for _track_ reinforces the cosmic theme — more than ten
allocation tracks → 十余条分配轨道.

### Recipient（原 winner）→ 获配者

获配 ("received an allotment") is compact and administrative-neutral. 赢家 / 得主 /
获胜者 / 中奖者 are all banned (winner/prize flavor).

| English                      | 中文       |
| ---------------------------- | ---------- |
| Recipient                    | 获配者     |
| Allocation Recipients (page) | 分配名录   |
| Recipient History            | 获配记录   |
| Unique Recipients            | 独立获配者 |

### Stellar Selection（原 raffle）→ 星选

Compact (2 chars), literally "star-selection," and reads as curation rather than chance.
The randomness is explained in denial copy as 协议层面的程序化随机分配 — never with
抽奖 / 抽签 / 开奖 vocabulary.

| English                                     | 中文                     |
| ------------------------------------------- | ------------------------ |
| Stellar Selection                           | 星选                     |
| ETH Stellar Selection                       | ETH 星选                 |
| NFT Stellar Selection — Participants        | 参与者 NFT 星选          |
| Anchored-NFT Stellar Selection              | 锚定 NFT 星选            |
| a Stellar Selection entry                   | 一次星选资格             |
| Stellar Selection ETH Deposited / Retrieved | 星选 ETH 已存入 / 已取回 |

### Anchoring（原 staking）→ 锚定；release → 解锚

锚定 is the natural anchor metaphor and already reads well in Chinese crypto text.
解锚 mirrors 解锁 and is instantly parseable. 质押 (the standard zh "staking") is banned
— the English deliberately avoided _staking_ and so do we.

| English                            | 中文                  |
| ---------------------------------- | --------------------- |
| Anchor (verb) / Anchoring          | 锚定                  |
| Release (an anchor)                | 解锚                  |
| Anchor-holder                      | 锚定者                |
| Anchored NFTs                      | 已锚定 NFT            |
| My Anchors                         | 我的锚定              |
| anchor & release actions           | 锚定与解锚操作        |
| each NFT can be anchored only once | 每枚 NFT 仅可锚定一次 |

### Anchor Distribution（原 yield）→ 锚定派发

Must be distinct from 分配 (Allocation) since they are different concepts on the same
screens. 派发 is a neutral hand-out verb. Never 收益 / 回报 / 分红 / 利息 (all banned —
exactly the yield-flavor the English avoids).

| English                         | 中文             |
| ------------------------------- | ---------------- |
| Anchor Distribution             | 锚定派发         |
| Anchor Distributions (amounts)  | 锚定派发额       |
| Unretrieved Anchor Distribution | 未取回的锚定派发 |
| Anchor Distribution deposits    | 锚定派发存入     |

### Retrieve（原 withdraw/claim）→ 取回

Everyday, calm, possession-recovering. Banned: 提现、提款、提取、领取、认领 (the standard
zh renderings of _withdraw_ and _claim_).

| English                     | 中文       |
| --------------------------- | ---------- |
| Retrieve (button)           | 取回       |
| Retrieve All                | 全部取回   |
| Unretrieved                 | 未取回     |
| retrieved at anchor release | 解锚时取回 |

### Imprint（原 mint）→ 铭刻

铭刻 ("engrave, inscribe permanently") is ceremonial and permanent — precisely the
_imprint_ register. 铸造 (the standard zh "mint") is banned.

| English                                      | 中文                   |
| -------------------------------------------- | ---------------------- |
| Imprint (verb)                               | 铭刻                   |
| NFTs Imprinted                               | 已铭刻 NFT             |
| may imprint dynamic Participation CST        | 可能铭刻动态的参与 CST |
| the `/imprint` page (Random Walk imprinting) | 铭刻                   |

### Endurance Champion → 坚守冠军；Chrono-Warrior → 时之勇士

坚守 ("hold fast, stand one's ground") captures _endurance-by-holding-the-lead_ far
better than athletic 耐力. 冠军 is acceptable — it mirrors the sanctioned English
"Champion" (the lexicon bans _compete/competition_, not _champion_). 时之勇士 ("warrior
of time") is poetic and memorable; 勇士 carries no gambling/finance flavor.

| English                    | 中文                |
| -------------------------- | ------------------- |
| Endurance Champion         | 坚守冠军            |
| Chrono-Warrior             | 时之勇士            |
| endurance timeline         | 坚守时间线          |
| lead stint / held the lead | 领先时段 / 保持领先 |
| single continuous reign    | 单次连续在位        |

### Cosmic Council（原 DAO）→ 宇宙议会

议会 (deliberative assembly) over 理事会 (corporate board). "DAO" and
去中心化自治组织 are banned in copy.

| English                                  | 中文               |
| ---------------------------------------- | ------------------ |
| Cosmic Council                           | 宇宙议会           |
| Protocol Coordination                    | 协议协调           |
| Coordination Proposal                    | 协调提案           |
| Coordination Weight                      | 协调权重           |
| Coordination Quorum                      | 协调法定权重       |
| coordination delay / coordination period | 协调延迟 / 协调期  |
| Support / Opposition / Abstain           | 支持 / 反对 / 弃权 |
| delegate (weight)                        | 委托（权重）       |
| Coordination Changes (page)              | 协调变更           |

### Public Goods（原 charity/donation）→ 公共物品

公共物品 is the economics term and the one used in the Ethereum public-goods-funding
community. 慈善 / 捐赠 / 捐款 are banned (they carry the exact charitable-donation
framing the legal copy denies). _Contribution_ splits by context:

| English                                   | 中文                  |
| ----------------------------------------- | --------------------- |
| Public Goods                              | 公共物品              |
| Public Goods Beneficiary                  | 公共物品受益方        |
| Public Goods Contribution (funding sense) | 公共物品资助          |
| ETH Contribution (protocol inflow sense)  | ETH 贡献              |
| Public Goods Vault                        | 公共物品金库          |
| Public Goods Retrievals                   | 公共物品取回          |
| Voluntary Contributions                   | 自愿贡献              |
| forwarded to Protocol Guild               | 转拨给 Protocol Guild |

### Compounding Cycle Reserve → 滚动储备

滚动 ("rolling") is neutral logistics vocabulary (滚动更新). Never 复利 (compound
interest), never 奖池滚存 (lottery-jackpot rollover flavor).

| English                                     | 中文                   |
| ------------------------------------------- | ---------------------- |
| Cycle Reserve                               | 周期储备               |
| Compounding Cycle Reserve                   | 滚动储备               |
| rolls forward into the next cycle           | 滚入下一周期           |
| The protocol compounds rather than extracts | 协议滚动累积，而非抽取 |

### Signature（作品含义）→ 签名

The artwork keeps brand coherence with "Cosmic Signature." Where cryptographic signatures
appear in the same context (Council copy: "a cryptographic signature"), disambiguate the
artwork as 签名作品 and the cryptographic one as 密码学签名.

| English                                  | 中文                   |
| ---------------------------------------- | ---------------------- |
| the cycle's final Signature              | 这一周期最终的签名     |
| Every Gesture Shapes the Signature.      | 每一笔，都在塑造签名。 |
| a Signature (artwork, ambiguous context) | 签名作品               |

## 3. General term table（通用术语速查）

Interface vocabulary — no coinage needed, but fixed for consistency:

| English                              | 中文                       | Notes                                                |
| ------------------------------------ | -------------------------- | ---------------------------------------------------- |
| Gallery                              | 画廊                       | art gallery, not 图库                                |
| How It Works                         | 运作原理                   |                                                      |
| FAQ / Clarifications                 | 常见问题 / 释疑            | nav uses 常见问题; the FAQ page heading may use 释疑 |
| Learn Hub                            | 学习中心                   |                                                      |
| About                                | 关于                       |                                                      |
| Statistics                           | 统计                       |                                                      |
| My Statistics / My Tokens            | 我的统计 / 我的代币        |                                                      |
| Site Map                             | 网站地图                   |                                                      |
| Contracts                            | 合约                       |                                                      |
| Source Code                          | 源代码                     |                                                      |
| Audits                               | 审计                       |                                                      |
| Security                             | 安全                       |                                                      |
| Terms of Use                         | 服务条款                   |                                                      |
| Privacy Policy                       | 隐私政策                   |                                                      |
| Risk Disclosures                     | 风险披露                   |                                                      |
| Outreach Reserve                     | 推广储备                   | 原 marketing                                         |
| Outreach Transactions                | 推广交易                   |                                                      |
| Participation CST                    | 参与 CST                   |                                                      |
| Recognition CST                      | 表彰 CST                   |                                                      |
| Attached NFTs / attach               | 已附加 NFT / 附加          | assets attached to gestures                          |
| Named Tokens / name (verb)           | 已命名代币 / 命名          |                                                      |
| Used Random Walk NFTs                | 已使用的 Random Walk NFT   |                                                      |
| token / tokens                       | 代币                       | ERC-20 context; NFTs counted with 枚                 |
| wallet / Connect Wallet / Disconnect | 钱包 / 连接钱包 / 断开连接 |                                                      |
| transfer (NFT) / transfer (ERC-20)   | 转移 / 转账                | standard zh crypto split                             |
| transaction                          | 交易                       |                                                      |
| participant                          | 参与者                     | counter: 位                                          |
| Unique Participants                  | 独立参与者                 | 独立 = distinct, standard analytics zh               |
| holder                               | 持有者                     |                                                      |
| balance                              | 余额                       |                                                      |
| supply / total supply                | 供应量 / 总供应量          |                                                      |
| deposit (noun, into pools)           | 存入                       |                                                      |
| distribute / distribution (general)  | 发放                       | when not Anchor Distribution                         |
| indexed (by the API)                 | 已索引                     | 由 API 索引                                          |
| on-chain                             | 链上                       |                                                      |
| procedural on-chain art protocol     | 程序化链上艺术协议         | brand tagline                                        |
| deterministic                        | 确定性                     | 确定性渲染                                           |
| generative art                       | 生成艺术                   |                                                      |
| three-body problem                   | 三体问题                   | resonates strongly in zh (刘慈欣《三体》); use it    |
| Newtonian gravity                    | 牛顿引力                   |                                                      |
| seed                                 | 种子                       |                                                      |
| render / rendering                   | 渲染                       |                                                      |
| verified / verification              | 已验证 / 验证              |                                                      |
| reproducible                         | 可复现                     |                                                      |
| open source                          | 开源                       |                                                      |
| public domain                        | 公有领域                   | CC0 context                                          |
| formally verified                    | 经形式化验证               |                                                      |
| system event / system mode           | 系统事件 / 系统模式        |                                                      |
| admin / internal (tools)             | 管理 / 内部工具            |                                                      |
| loading…                             | 加载中……                   |                                                      |
| no data / empty state                | 暂无数据                   |                                                      |
| error                                | 出错了 / 错误              | surface-dependent, see style guide                   |
| retry / try again later              | 重试 / 请稍后再试          |                                                      |
| copy address / copied                | 复制地址 / 已复制          |                                                      |
| view on Arbiscan                     | 在 Arbiscan 上查看         |                                                      |

### 3.1 Cosmic Signature trait vocabulary（作品特征词表）

The metadata pipeline (v2) publishes each Signature's traits as OpenSea-style
attributes. The frontend never renders the wire labels: every trait type and every
closed-set value goes through `messages/{locale}/traits.json` (mapping in
`lib/nftMetadata/labels.ts`). Open vocabularies (palette names) are composed from a
hue word plus a scheme word; anything the catalog does not know renders in English.
The wire label `Round` maps to 周期, never 轮/轮次.

| English (wire)                 | 中文                | Notes                                                                                                                                                                    |
| ------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| trait / traits                 | 特征                | never 属性 (too generic) or 稀有属性                                                                                                                                     |
| rarity / rarity rank           | 稀有度 / 稀有度排名 | descriptive of frequency only; no value or collectibility framing                                                                                                        |
| Structure                      | 结构                | primary drawing vocabulary                                                                                                                                               |
| Underlay                       | 底纹                |                                                                                                                                                                          |
| Accent                         | 点缀                |                                                                                                                                                                          |
| Symmetry                       | 对称                | Mirror 镜像 · Rosette ×N 花结 ×N · Mandala ×N 曼陀罗 ×N                                                                                                                  |
| Projection                     | 投影                | Cross Braid 交叉编结 · Phase Portrait 相图 · Hodograph 速端曲线                                                                                                          |
| Wildcard                       | 变数                | value Yes → 是                                                                                                                                                           |
| Finish                         | 质感                | Stardust 星尘 · Prism 棱镜                                                                                                                                               |
| Palette                        | 调色                | `{hue}{scheme}`, e.g. Glacial Split → 冰川分裂                                                                                                                           |
| palette hue words              | 见 traits.json      | Amber 琥珀 · Aurora 极光 · Cerulean 天青 · Ember 余烬 · Glacial 冰川 · Jade 翡翠 · Nebular 星云 · Orchid 兰紫 · Rose 玫瑰 · Sapphire 蓝宝石 · Solar 日曜 · Violet 紫罗兰 |
| palette scheme words           | 见 traits.json      | Mono 单色 · Split 分裂 · Analogous 邻近 · Triad 三色 · Complementary 互补 · Tetrad 四色                                                                                  |
| Spectral Class                 | 光谱型              | letters O–M stay Latin: B → B 型                                                                                                                                         |
| Mass Balance                   | 质量配比            | Heavy Primary 主星偏重 · Twin Binary 双星并重 · Equal Trio 三体均衡                                                                                                      |
| Fate                           | 命运                | Eternal Dance 永恒之舞 · Ejection 逃逸                                                                                                                                   |
| Chaos (index)                  | 混沌度              | 0–100                                                                                                                                                                    |
| Syzygies                       | 连珠                | three-body alignments; 连珠 is the classical astronomical term                                                                                                           |
| Imprinted (trait)              | 铭刻时间            |                                                                                                                                                                          |
| Allocation (trait)             | 分配                | values reuse §2: 星选 · 锚定 NFT 星选 · 收官之笔 · 最后 CST 落笔 · 坚守冠军 · 时之勇士                                                                                   |
| structure vocabulary values    | 见 traits.json      | Orbit Ribbons 轨道绸带 · Time Chords 时间和弦 · Harmonic Weave 谐波织纹 · Tangent Caustics 切线焦散 · Stipple Constellation 点彩星群 · Nebula Veil 星云薄纱              |
| Collection DNA (gallery strip) | 作品集基因          |                                                                                                                                                                          |
| quick view                     | 快速预览            |                                                                                                                                                                          |
| spectral sweep (video)         | 光谱扫描            |                                                                                                                                                                          |

## 4. Keep in English（保留英文）

Never translated, in any surface. In running Chinese text they take the CJK–Latin spacing
rule (style guide §4).

- **Brands/products:** Cosmic Signature, Random Walk NFT, Protocol Guild, Arbitrum,
  Arbitrum One, Ethereum¹, Uniswap, Axiom Zero, Chaos Zero, MetaMask, WalletConnect,
  Coinbase Wallet, Safe, GitHub, Discord, X (Twitter), Arbiscan
- **Tokens/tickers:** ETH, CST, NFT, ERC-20, ERC-721
- **Licenses/standards:** CC0, CC0 1.0, BCP 47
- **Technical identifiers:** SHA3-256, SHA-256, OKLab, AgX, OpenSimplex, H.265, PNG, RNG,
  Yoshida (4th-order Yoshida symplectic integrator → 四阶 Yoshida 辛积分器), Borda
  (Borda 排序聚合), API, UTC
- **Language names in the switcher:** English stays "English", Chinese stays "中文"

¹ Ethereum: use 以太坊 in prose (universally standard), "Ethereum" in technical
identifiers and proper names like Protocol Guild descriptions where it reads better.
以太坊 is the default.

## 5. Banned Chinese terms（中文禁用词表）

Mirrors the English banned list (`scripts/lexicon-scan-core.ts`), extended with
zh-specific vocabulary that carries the banned flavor. This table feeds the zh extension
of the lexicon scanner (README §7). As in English, the **only** sanctioned exception is
FAQ/legal _denial_ copy inside `lexicon-allow` pragmas (e.g. 这不是彩票，也不是任何形式的
赌博产品。).

| Banned（禁用）                                                       | Concept               | Use instead（改用）                                     |
| -------------------------------------------------------------------- | --------------------- | ------------------------------------------------------- |
| 出价、竞价、叫价、投标                                               | bid                   | 落笔                                                    |
| 拍卖、竞拍、荷兰拍                                                   | auction               | 校准窗口                                                |
| 奖、奖品、奖励、奖金、大奖、头奖、奖池、战利品                       | prize/jackpot         | 分配 / 一份分配                                         |
| 彩票、乐透、彩券、奖券、抽奖、抽签、摇号、开奖、刮刮乐               | lottery/raffle/draw   | 星选                                                    |
| 中奖、赢家、得主、获胜者、优胜者                                     | winner                | 获配者                                                  |
| 赌、赌博、赌场、赌注、博彩、下注、投注、押注、打赌、赔率、庄家、荷官 | gambling/bet/house    | denial copy only                                        |
| 抽中、碰运气、拼手气、幸运儿                                         | luck-flavor           | 获配 / 星选                                             |
| 游戏、玩、玩家、玩法、试玩、闯关                                     | game/play(er)         | 协议 / 参与者 / 机制                                    |
| 比赛、竞赛、竞争、竞技、锦标赛、争夺、对决                           | competition/contest   | describe the mechanic                                   |
| 投资、投资者、理财、炒币、建仓                                       | invest(or)            | denial copy only                                        |
| 收益、收益率、回报、回报率、年化、利息、分红、股息、盈利、利润       | yield/profit/dividend | 锚定派发 (for the mechanic); denial copy only otherwise |
| 赚、赚钱、赚取、躺赚、薅羊毛、撸毛                                   | earn(ings)            | 获得分配 / describe the flow                            |
| 收入、被动收入                                                       | income                | — (reframe)                                             |
| 质押、staking                                                        | staking               | 锚定                                                    |
| 铸造、铸币、开采、挖矿                                               | mint/mining/farming   | 铭刻                                                    |
| 提现、提款、提取、领取、认领                                         | withdraw/claim        | 取回                                                    |
| 空投、赠品、白送、免费领                                             | giveaway/airdrop      | describe the allocation                                 |
| 慈善、捐赠、捐款、善款                                               | charity/donation      | 公共物品资助（denial copy only otherwise）              |
| DAO、去中心化自治组织                                                | DAO                   | 宇宙议会                                                |
| 轮、轮次、回合（指周期时）                                           | round                 | 周期 / 第 N 个周期                                      |
| 门票、入场券、票                                                     | ticket                | 星选资格                                                |
| 免税、抵税、税前扣除                                                 | tax-deductible        | denial copy only                                        |

Style-level cautions (not scanner-banned, reviewer judgment): 公益 (charity-adjacent —
prefer 公共物品), 福利 ("perks"), 回馈 ("give back"), 稳赚 and any certainty-of-gain
phrasing (legally dangerous), meme slang (梭哈、冲、上车).

## 6. Change process（术语变更流程）

1. Propose the change in a PR that edits this file: old term, new term, rationale,
   affected surfaces.
2. In the **same PR**, update every existing usage: search `messages/zh/**`,
   `content/**/text*.zh.ts`, `content/about/zh.ts`, and the legal `content/legal/*.zh.ts`
   copy modules for the old term.
3. A native-fluency reviewer approves the term; an engineer confirms the sweep is
   complete (no stale occurrences).
4. If the term is scanner-relevant (banned or replaces a banned concept), update the zh
   list in the lexicon scanner in the same PR.
