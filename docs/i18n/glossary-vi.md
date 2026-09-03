# Vietnamese Glossary — Bảng thuật ngữ (Tiếng Việt)

This is the **single source of truth** for how Cosmic Signature's coined vocabulary is
rendered in Vietnamese. Every translator and reviewer works with this file open. One
English term = one Vietnamese term, everywhere — a term that drifts between pages breaks
the product's voice and confuses users.

The English lexicon (machine-enforced in `scripts/lexicon-scan-core.ts`, run via
`npm run lexicon:scan`) is itself a deliberate transcreation layer: _bid_ became
**Gesture**, _raffle_ became **Stellar Selection**, _staking_ became **Anchoring**. The
Vietnamese must do the same job: carry an **art-performance register**, never a gambling /
gaming / investment register. Vietnamese crypto writing is saturated with exactly the words
the English avoids (đấu giá, đặt cược, trúng thưởng, lợi nhuận, staking, đúc NFT, airdrop) —
none of them appear here. Do not translate the underlying banned concept — translate the
coined term.

Machine enforcement for this locale: the banned register in §5 is `VI_BANNED_TERMS` in
`scripts/lexicon-scan-core.ts` (matched as whole words under Unicode boundaries); the drift
rules in §2–§3 are `scripts/terminology/vi.ts` (run via `npm run terminology:check`); the
mechanical conventions of [style-guide-vi.md](./style-guide-vi.md) (no East Asian
characters or full-width marks, no space before a sentence mark, a single … for the
ellipsis, the reader addressed as _bạn_) are `LOCALE_CONVENTIONS.vi` in
`scripts/i18n-conventions-core.ts` (run via `npm run i18n:conventions`), and every catalog
must be in Unicode Normalization Form C.

> Status: **frozen with the initial Vietnamese release**. Amendments require the change
> process in §6 and must update all existing usages in the same PR.

---

## 1. Term formation rules (nguyên tắc tạo thuật ngữ)

When a new English coinage appears, coin the Vietnamese with these rules:

1. **Two to four syllables** for anything that must fit a button, nav item, or table
   header; the full form may be longer, but a short form must exist (chu kỳ trình diễn →
   chu kỳ).
2. Draw from the **art / craft / astronomy register** (nét bút, khắc, Tinh tuyển, neo giữ,
   Phòng trưng bày) — never from finance (lợi nhuận, lãi, đầu tư), gaming (trò chơi, người
   chơi, vòng đấu), or gambling (trúng thưởng, xổ số, đặt cược) registers.
3. Prefer a native or Sino-Vietnamese word over a loanword where the word is established
   (phân bổ, người nhận, khắc, cửa sổ hiệu chỉnh, Hàng hóa công, neo giữ). An English
   loanword is acceptable where it is the everyday Vietnamese term for the thing (token,
   NFT, ví, giao thức is native; blockchain, seed, gas stay English) — Vietnamese readers
   meet English nouns in Latin-heavy interfaces without friction, but a loanword that only
   transliterates the English coinage ("Stellar Selection", "Chrono-Warrior" left in
   English) is a translation debt, not a term.
4. Test every candidate in three places before adopting: a button label, a full
   sentence, and its compounds (a candidate for _Gesture_ must also work in _Gesture
   Cost_ — chi phí nét bút, _ETH gesture_ — nét bút ETH, _Final Gesture_ — nét bút cuối
   cùng, _gesture count_ — số nét bút). Vietnamese has no inflection, so compounds and
   the classifier (§5 of the style guide) are the tests.
5. Check the term's homographs and collocations for unwanted flavors: Tinh tuyển
   deliberately echoes _tinh tuyển_ "carefully selected"; _chốt_ was rejected for
   _Finalize_ because _chốt đơn_ is sales slang; _thưởng_ never appears because every
   compound of it is a prize.
6. Established Vietnamese crypto terms are used where they are neutral (ví, token, hợp
   đồng thông minh, giao dịch, trên chuỗi, phí gas) and avoided where the English
   deliberately avoided them (staking, mint / đúc, claim, rút, airdrop).

## 2. Core coinages — decisions with rationale (thuật ngữ cốt lõi)

### Gesture (was _bid_) → nét bút

The load-bearing term of the whole site. _Gesture_ is an expressive act that shapes an
artwork. **Nét bút** ("a stroke of the brush") is the calligrapher's and painter's word for
exactly that: a single deliberate mark left on the work. It carries no auction flavor, it
counts naturally ("3 nét bút"), and it takes every compound the interface needs. The verb
is **đặt nét bút** ("to place a stroke"); the classifier is the noun itself ("một nét bút").

| English                            | Tiếng Việt                  |
| ---------------------------------- | --------------------------- |
| Make a Gesture (CTA)               | Đặt nét bút                 |
| a gesture / this gesture           | một nét bút / nét bút này   |
| ETH gesture / CST gesture          | nét bút ETH / nét bút CST   |
| Gesture with ETH (button)          | Đặt nét bút bằng ETH        |
| Gesture Cost                       | chi phí nét bút             |
| Final Gesture                      | nét bút cuối cùng           |
| Last Gesture (most recent)         | nét bút gần nhất            |
| gesture count / Number of Gestures | số nét bút                  |
| Total Gestures                     | tổng số nét bút             |
| Live gestures                      | nét bút đang diễn ra        |
| Gestures with CST                  | nét bút bằng CST            |
| Gesture #42                        | nét bút #42                 |
| last gesturer                      | người đặt nét bút cuối cùng |

Rejected: cử chỉ (a hand or body movement — the literal _gesture_, awkward as a countable
protocol action: "chi phí cử chỉ" reads as nonsense), đặt giá / trả giá (banned), lượt (a
turn — game framing), nét vẽ (a drawn line — too generic for the act).

### Performance Cycle (was _round_) → chu kỳ trình diễn (short: chu kỳ)

**Trình diễn** is the word for performing on stage (nghệ thuật trình diễn = performance
art), so the compound reads as an artistic act. The bare short form in dense UI is
**chu kỳ**, which Vietnamese interfaces already use for recurring periods. **Never** vòng /
vòng đấu / lượt (banned, tournament flavor), never chu trình (a technical process cycle),
never hiệu suất (the classic mistranslation of _performance_).

Cycle numbers follow the English: **chu kỳ 12** — no ordinal marker (not _chu kỳ thứ 12_),
the way episodes and seasons are labeled. Where a column header needs the word _number_,
use **số chu kỳ**.

| English                      | Tiếng Việt            |
| ---------------------------- | --------------------- |
| Performance Cycle            | chu kỳ trình diễn     |
| Current Cycle / Active Cycle | chu kỳ hiện tại       |
| Cycle 12 / Cycle #12         | chu kỳ 12             |
| Cycle Opening                | mở chu kỳ             |
| Total Cycles                 | tổng số chu kỳ        |
| cycle timeline               | dòng thời gian chu kỳ |
| next cycle                   | chu kỳ tiếp theo      |

### Finalize / Finalization → hoàn tất

**Hoàn tất** (to complete, to bring to its end) is formal, neutral, and names the moment a
period becomes final without a settlement flavor. The countdown that drives the whole cycle
is the **đếm ngược hoàn tất**. Never chốt (sales slang: _chốt đơn_), never kết thúc (a mere
ending with no distribution in it), never chung kết (a sports final), never quyết toán /
thanh lý (settlement — finance flavor). Wallet copy that needs "complete" for a
transaction says **thành công** ("Giao dịch thành công"), so the two never collide.

| English                   | Tiếng Việt                |
| ------------------------- | ------------------------- |
| Finalize (button)         | Hoàn tất chu kỳ           |
| Cycle Finalization Time   | thời điểm hoàn tất chu kỳ |
| Open-Finalization Window  | cửa sổ hoàn tất mở        |
| exclusivity window        | cửa sổ ưu tiên hoàn tất   |
| Finalization countdown    | đếm ngược hoàn tất        |
| When the cycle finalizes… | Khi chu kỳ hoàn tất…      |
| finalizer                 | người hoàn tất            |

### Calibration Window (was _Dutch auction_) → cửa sổ hiệu chỉnh

**Hiệu chỉnh** is the technician's word for bringing a value into place (hiệu chỉnh màn
hình, hiệu chỉnh tham số) — exactly what the descending price does — and **cửa sổ** is how
Vietnamese names a span of time in technical writing (cửa sổ thời gian). Together they
describe a settling price without a hint of an auction. Đấu giá is banned. Rejected: hiệu
chuẩn (metrology-laboratory register), khung điều chỉnh (an adjustment frame), đấu giá Hà
Lan (banned, and the very concept the coinage avoids).

| English                              | Tiếng Việt                       |
| ------------------------------------ | -------------------------------- |
| Calibration Window                   | cửa sổ hiệu chỉnh                |
| calibration ceiling / floor          | trần hiệu chỉnh / sàn hiệu chỉnh |
| the price descends during the window | giá giảm dần trong cửa sổ        |

### Allocation (was _prize_) → phân bổ

**Phân bổ** (allocation, apportionment) is the neutral administrative word: a share
assigned by rule. Never giải thưởng / phần thưởng (banned), never thù lao (remuneration —
payment for work), never phân phối (distribution — reserved for the mechanics of splitting,
and for Anchor Distribution), never phần chia (a cut).

| English                       | Tiếng Việt                   |
| ----------------------------- | ---------------------------- |
| Allocation                    | phân bổ                      |
| Signature Allocation          | phân bổ Signature            |
| Chrono-Warrior Allocation     | phân bổ Chiến binh Thời gian |
| Endurance Champion Allocation | phân bổ Quán quân Bền bỉ     |
| Allocation Tracks             | các luồng phân bổ            |
| Allocations Wallet / escrow   | ví phân bổ / ký quỹ          |
| retrieved allocations         | phân bổ đã nhận về           |

### Recipient (was _winner_) → người nhận

**Người nhận** (the one who receives) — a role, not a victory. Never người thắng / người
trúng (banned), never người thụ hưởng (a beneficiary of a trust or a policy), never bên nhận
(a party to a contract). Where the role is spelled out: **người nhận phân bổ**.

### Stellar Selection (was _raffle_) → Tinh tuyển

A coinage, like the Chinese 星选 and the Japanese 星選: **Tinh tuyển** — _tinh_ (星, star, as
in tinh vân "nebula", tinh cầu "star sphere", hành tinh "planet") + _tuyển_ (選, to select)
— "selection by the stars", with the homograph _tinh tuyển_ "carefully selected" resonating
underneath. It is short enough for chips and column headers and takes ETH / NFT directly
(ETH Tinh tuyển, NFT Tinh tuyển). On first mention in long-form copy, gloss it once:
Tinh tuyển (sự tuyển chọn của các vì sao). Capitalized as a proper name. Never xổ số / rút
thăm / quay số (banned), never "Stellar Selection" left in English (translation debt).

| English                                     | Tiếng Việt                         |
| ------------------------------------------- | ---------------------------------- |
| Stellar Selection                           | Tinh tuyển                         |
| Stellar Selection ETH / NFT                 | ETH Tinh tuyển / NFT Tinh tuyển    |
| Anchored-NFT Stellar Selection              | Tinh tuyển NFT neo giữ             |
| Anchored Selection (trait chip)             | Tinh tuyển neo giữ                 |
| Stellar Selection Pool                      | quỹ Tinh tuyển                     |
| Stellar Selection ETH Deposited / Retrieved | ETH Tinh tuyển đã nạp / đã nhận về |
| Stellar Selection entry (eligibility)       | thuộc diện Tinh tuyển              |
| draw (the act of selecting)                 | lượt chọn                          |
| with replacement                            | có hoàn lại                        |

### Anchoring (was _staking_) → neo giữ

**Neo giữ** ("to hold at anchor") is the harbor word — a vessel held in place by a line to
an anchor. It carries the anchor image the English chose and has no financial reading
whatsoever. Never staking / stake / đặt cọc / ký gửi (banned), never khóa (a lock — layout
and security word), never cắm neo (planting a stake — a construction word).

| English                   | Tiếng Việt          |
| ------------------------- | ------------------- |
| Anchor (verb) / Anchoring | neo giữ             |
| Anchor your NFT           | Neo giữ NFT của bạn |
| release / unanchor        | gỡ neo              |
| Anchor-holder             | người neo giữ       |
| Anchored NFTs             | NFT đang neo giữ    |
| Anchor action             | thao tác neo giữ    |

### Anchor Distribution (was _yield_) → phân phối neo giữ

The ETH an anchor-holder receives is **distributed** to anchors, so the term uses **phân
phối** (to distribute) — distinct from _phân bổ_ (allocation by rule) and from _phân bố_
(a statistical distribution). Never lợi nhuận / lãi / lợi tức / thu nhập / phần thưởng
(banned), never hoa lợi (fruits of capital — law and finance).

| English                        | Tiếng Việt                    |
| ------------------------------ | ----------------------------- |
| Anchor Distribution            | phân phối neo giữ             |
| Anchor Distributions (amounts) | các khoản phân phối neo giữ   |
| Anchor Distribution deposits   | các đợt nạp phân phối neo giữ |
| Anchor Distribution breakdown  | chi tiết phân phối neo giữ    |

### Retrieve (was _withdraw/claim_) → nhận về

**Nhận về** (to receive into one's possession) is what a participant does with something
that is already theirs. It rhymes with _người nhận_ (Recipient) on purpose. Never rút / rút
tiền (banned), never yêu cầu / claim (a demand), never thu hồi (to revoke), never lấy lại
(to take back what was taken).

| English                  | Tiếng Việt                   |
| ------------------------ | ---------------------------- |
| Retrieve (button)        | Nhận về                      |
| Retrieved / retrievals   | đã nhận về / các lần nhận về |
| Retrieve your allocation | Nhận về phần phân bổ của bạn |
| Public Goods retrievals  | nhận về Hàng hóa công        |

### Imprint (was _mint_) → khắc

**Khắc** (to carve, to engrave) — the artwork is inscribed into the chain. Never đúc
(banned — the Vietnamese crypto word for _mint_), never phát hành (issuance — paperwork
register), never tạo (to create — generic), never khắc ghi (to remember deeply — idiom).

| English                | Tiếng Việt          |
| ---------------------- | ------------------- |
| Imprint (verb)         | khắc                |
| Imprinted at           | thời điểm khắc      |
| Imprint RandomWalk NFT | Khắc RandomWalk NFT |
| Imprinted (trait)      | Đã khắc             |
| premine                | khắc trước          |

### Endurance Champion → Quán quân Bền bỉ; Chrono-Warrior → Chiến binh Thời gian

**Quán quân** (冠軍) is the Sino-Vietnamese word for a title-holder in any field — formal,
used for a laureate as readily as for an athlete — and **bền bỉ** is staying power. Never
người thắng / người chiến thắng (banned), never nhà vô địch (the sports word). The
Chrono-Warrior is **Chiến binh Thời gian** — the warrior of time — a phrase Vietnamese
fantasy and science fiction already own, which is the right register for a title. Both are
**danh hiệu** (titles), capitalized as proper names.

| English                   | Tiếng Việt                               |
| ------------------------- | ---------------------------------------- |
| Endurance Champion        | Quán quân Bền bỉ                         |
| Chrono-Warrior            | Chiến binh Thời gian                     |
| current champion / holder | Quán quân Bền bỉ hiện tại                |
| Champion Time / reign     | thời gian dẫn đầu / thời gian giữ vị trí |

### Cosmic Council (was _DAO_) → Hội đồng Vũ trụ

**Hội đồng** is the word for a deliberative council (hội đồng quản trị, hội đồng khoa học);
_Vũ trụ_ keeps the brand image. Never DAO (banned in copy; the acronym may appear only in
denial copy), never tổ chức tự trị phi tập trung (the DAO expansion), never nghị viện (a
legislature).

### Public Goods (was _charity/donation_) → Hàng hóa công

**Hàng hóa công** is the economics term (hàng hóa công cộng, public goods) and carries none
of the charity register. Contributions to it are **đóng góp** (a contribution to a common
pool), never quyên góp / từ thiện / ủng hộ (banned). The vault is the **Kho Hàng hóa
công**. Capitalized as a proper name.

| English                             | Tiếng Việt                           |
| ----------------------------------- | ------------------------------------ |
| Public Goods                        | Hàng hóa công                        |
| Public Goods Vault                  | Kho Hàng hóa công                    |
| Protocol Public Goods contributions | đóng góp Hàng hóa công của giao thức |
| voluntary contributions             | đóng góp tự nguyện                   |

### Compounding Cycle Reserve → Dự trữ tích lũy

The share carried into the next cycle **accumulates**: **Dự trữ tích lũy**. Never lãi kép
(compound interest — finance), never quỹ tiết kiệm (savings), never chuyển tiếp alone.

| English                         | Tiếng Việt               |
| ------------------------------- | ------------------------ |
| Compounding Cycle Reserve       | Dự trữ tích lũy          |
| Cycle Reserve                   | Dự trữ chu kỳ            |
| Next Cycle Seed (reserve share) | phần khởi đầu chu kỳ sau |

### Signature (the artwork) → Signature

The artwork keeps the brand's own word, in Latin letters, for coherence with "Cosmic
Signature" and to stay distinct from the everyday **chữ ký** (a handwritten or
cryptographic signature). Vietnamese technical writing keeps English product nouns this
way without friction. Where cryptographic signatures appear in the same context (wallet
copy: "sign the transaction"), those are **ký** / **chữ ký**. Where the context is ambiguous,
write **tác phẩm Signature**.

| English                                  | Tiếng Việt                           |
| ---------------------------------------- | ------------------------------------ |
| the cycle's final Signature              | Signature cuối cùng của chu kỳ       |
| Every Gesture Shapes the Signature.      | Mỗi nét bút đều định hình Signature. |
| a Signature (artwork, ambiguous context) | tác phẩm Signature                   |
| sign the transaction (wallet)            | ký giao dịch                         |

### Outreach Reserve (was _marketing_) → Dự trữ truyền thông

**Truyền thông** (communications, outreach — the word institutions use for telling people
about themselves) carries none of the sales register of tiếp thị / quảng cáo / quảng bá
(banned). The reserve is a **dự trữ**; the two named reserves are capitalized.

| English               | Tiếng Việt             |
| --------------------- | ---------------------- |
| Outreach Reserve      | Dự trữ truyền thông    |
| Outreach Transactions | giao dịch truyền thông |
| outreach (activity)   | truyền thông           |
| treasurer             | thủ quỹ                |

## 3. General term table (thuật ngữ chung)

Interface vocabulary — no coinage needed, but fixed for consistency:

| English                              | Tiếng Việt                                            | Notes                                                       |
| ------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------- |
| Gallery                              | Phòng trưng bày                                       | the art word; never thư viện (a library)                    |
| How It Works                         | Cách hoạt động                                        | never hướng dẫn sử dụng (a help page)                       |
| FAQ / Clarifications                 | Câu hỏi thường gặp                                    | nav and page heading alike                                  |
| Learn Hub                            | Trung tâm học tập                                     | nav short form: Học                                         |
| About                                | Về Cosmic Signature                                   | nav short form: Giới thiệu                                  |
| Statistics                           | Thống kê                                              |                                                             |
| My Statistics / My Tokens            | Thống kê của tôi / NFT của tôi                        | "của tôi" after the noun                                    |
| Site Map                             | Sơ đồ trang                                           |                                                             |
| Contracts                            | Hợp đồng                                              | smart contracts; hợp đồng thông minh when spelled out       |
| Source Code                          | Mã nguồn                                              |                                                             |
| Audits                               | Kiểm toán                                             | kiểm toán bảo mật when the page needs the full form         |
| Security                             | Bảo mật                                               |                                                             |
| Terms of Use                         | Điều khoản sử dụng                                    | footer short form: Điều khoản                               |
| Privacy Policy                       | Chính sách quyền riêng tư                             | footer short form: Quyền riêng tư; never chính sách bảo mật |
| Risk Disclosures                     | Công bố rủi ro                                        |                                                             |
| White Paper                          | Sách trắng                                            | the established Vietnamese term                             |
| Knowledge quiz / quiz tier           | Trắc nghiệm kiến thức / Cơ bản · Trung cấp · Nâng cao | educational register; never trò chơi                        |
| score / result (quiz)                | điểm / kết quả                                        |                                                             |
| Outreach Transactions                | giao dịch truyền thông                                |                                                             |
| Participation CST                    | CST tham gia                                          |                                                             |
| Recognition CST                      | CST ghi nhận                                          |                                                             |
| Attached NFTs / attach               | NFT đính kèm / đính kèm                               | assets attached to gestures                                 |
| Named Tokens / name (verb)           | token đã đặt tên / đặt tên                            |                                                             |
| Used Random Walk NFTs                | Random Walk NFT đã sử dụng                            |                                                             |
| token / tokens                       | token                                                 | no plural marker; "các token" only when the count matters   |
| wallet / Connect Wallet / Disconnect | ví / Kết nối ví / Ngắt kết nối                        |                                                             |
| transfer (ERC-20 / CST)              | chuyển                                                | chuyển khoản is a bank transfer                             |
| transfer (NFT ownership)             | chuyển giao                                           | the property word                                           |
| transaction                          | giao dịch                                             |                                                             |
| participant                          | người tham gia                                        | never người chơi (banned), never thành viên                 |
| Unique Participants                  | người tham gia riêng biệt                             |                                                             |
| user (UI and legal alike)            | người dùng                                            |                                                             |
| holder                               | người nắm giữ                                         |                                                             |
| balance                              | số dư                                                 |                                                             |
| supply / total supply                | nguồn cung / tổng cung                                |                                                             |
| deposit (into pools)                 | nạp                                                   | never gửi / ký gửi (banned — the deposit words)             |
| distribute (general, not Anchor D.)  | phân phối                                             |                                                             |
| indexed (by the API)                 | đã lập chỉ mục                                        |                                                             |
| on-chain                             | trên chuỗi                                            | nghệ thuật trên chuỗi                                       |
| procedural on-chain art protocol     | giao thức nghệ thuật tạo sinh trên chuỗi              | brand tagline; tạo sinh is the CG term (see below)          |
| procedural / procedurally generated  | tạo sinh theo thuật toán                              | never thủ tục (paperwork)                                   |
| deterministic                        | tất định                                              | the mathematics term                                        |
| generative art                       | nghệ thuật tạo sinh                                   | the Vietnamese art-scene term                               |
| three-body problem                   | bài toán ba vật thể                                   | the standard physics term                                   |
| Newtonian gravity                    | lực hấp dẫn Newton                                    |                                                             |
| seed                                 | seed                                                  | giá trị seed for "seed value"                               |
| render / rendering                   | kết xuất                                              | the Vietnamese CG term                                      |
| verified / verification              | đã xác minh / xác minh                                | contracts; never xác thực (authentication)                  |
| reproducible                         | có thể tái tạo                                        |                                                             |
| open source                          | mã nguồn mở                                           |                                                             |
| public domain                        | phạm vi công cộng                                     | CC0 context                                                 |
| formally verified                    | đã kiểm chứng hình thức                               | the CS term                                                 |
| system event / system mode           | sự kiện hệ thống / chế độ hệ thống                    |                                                             |
| admin / internal (tools)             | quản trị / công cụ nội bộ                             |                                                             |
| loading…                             | Đang tải…                                             |                                                             |
| no data / empty state                | Không có dữ liệu                                      |                                                             |
| error                                | Đã xảy ra lỗi / Lỗi                                   | surface-dependent, see style guide                          |
| retry / try again later              | Thử lại / Vui lòng thử lại sau                        |                                                             |
| copy address / copied                | Sao chép địa chỉ / Đã sao chép                        |                                                             |
| view on Arbiscan                     | Xem trên Arbiscan                                     |                                                             |

### 3.1 Cosmic Signature trait vocabulary (đặc tính tác phẩm)

The metadata pipeline publishes each Signature's traits as OpenSea-style attributes.
The frontend never renders the wire labels: every trait type and every closed-set value
goes through `messages/{locale}/traits.json` (mapping in `lib/nftMetadata/labels.ts`).
Open vocabularies (palette names) are composed from a hue word plus a scheme word. The
wire label `Round` maps to chu kỳ, never vòng.

| English (wire)                 | Tiếng Việt             | Notes                                                                                                                                                                                                       |
| ------------------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| trait / traits                 | đặc tính               | never thuộc tính (wire-shape flavor)                                                                                                                                                                        |
| rarity / rarity rank           | độ hiếm / hạng độ hiếm | descriptive of frequency only; no value or collectibility framing                                                                                                                                           |
| Structure                      | Cấu trúc               |                                                                                                                                                                                                             |
| Underlay                       | Nền lót                |                                                                                                                                                                                                             |
| Accent                         | Điểm nhấn              |                                                                                                                                                                                                             |
| Symmetry                       | Đối xứng               | Mirror Gương · Rosette ×N Hoa thị ×N · Mandala ×N Mandala ×N                                                                                                                                                |
| Projection                     | Phép chiếu             | Cross Braid Đan chéo · Phase Portrait Chân dung pha · Hodograph Hodograph                                                                                                                                   |
| Wildcard                       | Ẩn số                  | value Yes → Có                                                                                                                                                                                              |
| Finish                         | Hoàn thiện             | Stardust Bụi sao · Prism Lăng kính                                                                                                                                                                          |
| Palette                        | Bảng màu               | `{hue} {scheme}` with a space                                                                                                                                                                               |
| palette hue words              | see traits.json        | Amber Hổ phách · Aurora Cực quang · Cerulean Thiên thanh · Ember Than hồng · Glacial Băng hà · Jade Ngọc bích · Nebular Tinh vân · Orchid Lan · Rose Hồng · Sapphire Lam ngọc · Solar Mặt trời · Violet Tím |
| palette scheme words           | see traits.json        | Mono đơn sắc · Split phân tách · Analogous tương đồng · Triad bộ ba · Complementary bổ túc · Tetrad bộ bốn                                                                                                  |
| Spectral Class                 | Lớp quang phổ          | letters O–M stay Latin: Class B → Lớp B                                                                                                                                                                     |
| Mass Balance                   | Cân bằng khối lượng    | Heavy Primary Sao chính nặng · Twin Binary Sao đôi song sinh · Equal Trio Bộ ba cân bằng                                                                                                                    |
| Fate                           | Vận mệnh               | Eternal Dance Vũ điệu vĩnh cửu · Ejection Phóng xuất                                                                                                                                                        |
| Chaos (index)                  | Chỉ số hỗn độn         | 0–100                                                                                                                                                                                                       |
| Syzygies                       | Sóc vọng               | three-body alignments; the classical astronomical term                                                                                                                                                      |
| Imprinted (trait)              | Đã khắc                |                                                                                                                                                                                                             |
| Allocation (trait)             | Phân bổ                | values reuse §2                                                                                                                                                                                             |
| structure vocabulary values    | see traits.json        | Orbit Ribbons Dải quỹ đạo · Time Chords Hợp âm thời gian · Harmonic Weave Dệt hài hòa · Tangent Caustics Tụ quang tiếp tuyến · Stipple Constellation Chòm sao chấm · Nebula Veil Màn tinh vân               |
| Collection DNA (gallery strip) | DNA bộ sưu tập         |                                                                                                                                                                                                             |
| quick view                     | xem nhanh              |                                                                                                                                                                                                             |
| spectral sweep (video)         | quét quang phổ         |                                                                                                                                                                                                             |

### 3.2 Protocol nouns fixed during the rollout (thuật ngữ cố định trong quá trình dịch)

Terms the English copy uses without coining them, fixed here the first time a Vietnamese
sentence needed them so every surface says the same thing:

| English                                    | Tiếng Việt                                                       | Notes                                                               |
| ------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| time increment                             | mức tăng thời gian                                               |                                                                     |
| exclusivity window (Final Gesture)         | cửa sổ ưu tiên hoàn tất                                          | parallel to cửa sổ hoàn tất mở                                      |
| finalizer                                  | người hoàn tất                                                   |                                                                     |
| cycle beneficiary                          | người nhận của chu kỳ                                            | người nhận phân bổ Signature when the role is spelled out           |
| Allocations Wallet / escrow                | ví phân bổ / ký quỹ                                              |                                                                     |
| Public Goods Vault                         | Kho Hàng hóa công                                                |                                                                     |
| calibration ceiling / floor                | trần hiệu chỉnh / sàn hiệu chỉnh                                 |                                                                     |
| Minimum CST Reward Protection              | bảo đảm CST tham gia tối thiểu                                   | the "reward" is CST tham gia, never phần thưởng                     |
| Recognition CST imprint of 1,000 CST       | 1.000 CST ghi nhận                                               | Vietnamese thousands separator is the dot                           |
| Stellar Selection entry / draw             | thuộc diện Tinh tuyển / lượt chọn                                | "with replacement" → có hoàn lại (statistics term)                  |
| Selection stage (art pipeline, Borda)      | vòng chọn lọc                                                    | vòng is banned only in its game compounds; chọn lọc is curation     |
| RandomWalk discount / cost reduction       | giảm giá                                                         |                                                                     |
| burn (CST) / consumed (statistics)         | đốt / đã tiêu thụ                                                | mirrors the English distinction                                     |
| leaderboard / live standings               | bảng xếp hạng / thứ hạng trực tiếp                               |                                                                     |
| free (a gesture may become free)           | không tốn chi phí                                                | reframe; never miễn phí as a selling word                           |
| Net % / Spent / Received / Net             | % ròng / đã chi / đã nhận / ròng                                 | never tỷ suất lợi nhuận                                             |
| Gesture Duration / Champion Time / reign   | thời gian giữ / thời gian dẫn đầu / thời gian giữ vị trí         |                                                                     |
| (You) badge                                | (Bạn)                                                            |                                                                     |
| Amount (ETH) / Amount (token quantity)     | số tiền / số lượng                                               |                                                                     |
| From / To (transfers)                      | Từ / Đến                                                         |                                                                     |
| treasurer (Outreach Reserve)               | thủ quỹ                                                          |                                                                     |
| Unavailable (metric fallback)              | Không khả dụng                                                   | Không có dữ liệu is the empty state                                 |
| Deck / Observatory                         | Đài quan sát                                                     |                                                                     |
| How It Works (marketing steps section)     | Cách tham gia                                                    | the page itself stays Cách hoạt động                                |
| Bucket / Interpolation                     | khoảng gộp / nội suy                                             |                                                                     |
| divisor                                    | số chia                                                          |                                                                     |
| block explorer                             | trình khám phá khối                                              |                                                                     |
| prediction market                          | thị trường dự đoán                                               |                                                                     |
| ecosystem                                  | hệ sinh thái                                                     |                                                                     |
| Governance Surface (Council)               | cơ chế điều phối                                                 | quản trị is the admin word                                          |
| coordination changes                       | thay đổi điều phối                                               |                                                                     |
| Digital Collectible                        | vật phẩm số                                                      |                                                                     |
| lock-up / No Lockup                        | khóa / không khóa                                                | the security-and-layout word, never đặt cọc                         |
| premine                                    | khắc trước                                                       |                                                                     |
| revert (transaction)                       | bị hoàn nguyên                                                   |                                                                     |
| premium (V3 multiplier)                    | hệ số cộng thêm                                                  |                                                                     |
| dust threshold                             | ngưỡng vụn                                                       |                                                                     |
| title (Endurance Champion, Chrono-Warrior) | danh hiệu                                                        |                                                                     |
| Published by                               | Công bố bởi                                                      | phát hành is drift                                                  |
| COSMIC mutational signatures (denial)      | chữ ký đột biến                                                  | the genomics term                                                   |
| parameter                                  | tham số                                                          |                                                                     |
| trade-off                                  | sự cân nhắc được–mất                                             |                                                                     |
| snapshot                                   | ảnh chụp nhanh                                                   |                                                                     |
| reentrancy guard                           | bộ chặn tái nhập                                                 |                                                                     |
| seed phrase                                | cụm từ khôi phục                                                 | seed alone is the RNG seed                                          |
| Ethereum core contributors                 | những người đóng góp cốt lõi cho Ethereum                        | người đóng góp is a person; đóng góp is ETH or NFTs                 |
| funding mechanism (Protocol Guild)         | cơ chế tài trợ                                                   | tài trợ (to fund) is neutral; quyên góp is banned                   |
| preview                                    | xem trước                                                        |                                                                     |
| swap (Uniswap)                             | hoán đổi                                                         |                                                                     |
| asset (attached ERC-20 / media asset)      | tài sản                                                          | third-party dependencies → phụ thuộc bên thứ ba, phông chữ, tài sản |
| typical cycle                              | chu kỳ điển hình                                                 |                                                                     |
| severity: critical / informational         | nghiêm trọng / thông tin                                         | audit findings                                                      |
| Knowledge Base (FAQ badge)                 | Cơ sở kiến thức                                                  |                                                                     |
| Chaos Zero market question                 | Chu kỳ này có hoàn tất với nhiều nét bút hơn chu kỳ trước không? | quoted verbatim wherever the market is described                    |

Narrative durations that are not protocol facts are spelled in words (mười giờ, hai ngày,
một ngày), so the numeric-claims guard never mistakes them for a pinned figure.

**Random Walk NFT / RandomWalk NFT.** The English itself uses both (the brand is "Random
Walk NFT", the contract is `RandomWalkNFT`, and several strings say "RandomWalk NFT").
Mirror the spelling of each English source string; never "translate" one form into the
other.

**Reviewer cautions for whole-word drift.** _thuộc tính_ is not a scanner variant of _đặc
tính_ because HTML attributes are thuộc tính; a reviewer still rejects it for _trait_.
_khóa_ is not a variant of _neo giữ_ because the lock-up column needs it; a reviewer still
rejects it for _anchoring_. _phân phối_ is the Anchor Distribution word and the general
"distribute"; it is never used for _Allocation_.

## 4. Keep in English (giữ nguyên tiếng Anh)

Never translated or transliterated, in any surface. Latin tokens take Vietnamese words with
an ordinary space on each side (style guide §4): 3 NFT, nét bút ETH, 1.000 CST, trên
Arbitrum, Cosmic Signature là.

- **Brands/products:** Cosmic Signature, Random Walk NFT, Protocol Guild, Arbitrum,
  Arbitrum One, Ethereum, Uniswap, Axiom Zero, Chaos Zero, MetaMask, WalletConnect,
  Coinbase Wallet, Safe, GitHub, Discord, X (Twitter), Arbiscan
- **Tokens/tickers:** ETH, CST, NFT, ERC-20, ERC-721
- **Licenses/standards:** CC0, CC0 1.0, BCP 47
- **Technical identifiers:** SHA3-256, SHA-256, OKLab, AgX, OpenSimplex, H.265, PNG, RNG,
  Yoshida (4th-order Yoshida symplectic integrator → bộ tích phân symplectic Yoshida bậc 4),
  Borda (kiểm phiếu Borda), API, UTC, seed
- **The artwork:** Signature (§2)
- **Language names in the switcher:** English stays "English", 中文 stays "中文",
  Українська stays "Українська", 한국어 stays "한국어", 日本語 stays "日本語", Vietnamese is
  "Tiếng Việt"

## 5. Banned Vietnamese terms (từ ngữ bị cấm)

Mirrors the English banned list (`scripts/lexicon-scan-core.ts`) with the same scope,
extended only with Vietnamese vocabulary that carries the banned flavor. Vietnamese spaces
every syllable, so the scanner matches these as whole words or phrases (case-insensitive)
under Unicode boundaries. As in English, the **only** sanctioned exception is FAQ/legal
_denial_ copy inside `lexicon-allow` pragmas (TS) or `\uXXXX` escapes (JSON), e.g. "Đây
không phải là xổ số hay trò chơi cờ bạc".

| Banned (bị cấm)                                                                                                                                                                           | Concept               | Use instead (thay bằng)                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------- |
| đấu giá, đấu thầu, bỏ thầu, đặt giá, trả giá, ra giá, phiên đấu                                                                                                                           | bid / auction         | nét bút / cửa sổ hiệu chỉnh                         |
| giải thưởng, phần thưởng, tiền thưởng, trúng thưởng, trao thưởng, nhận thưởng, lĩnh thưởng, trả thưởng, khen thưởng, độc đắc                                                              | prize / jackpot       | phân bổ                                             |
| thắng, chiến thắng, thắng cuộc, thắng giải, người thắng, người trúng, đoạt giải, giành giải, trúng giải, trúng số, thua, thua cuộc, thua lỗ                                               | winner / win / lose   | người nhận                                          |
| xổ số, vé số, số đề, lô tô, lô đề, rút thăm, bốc thăm, quay số, quay thưởng, vòng quay                                                                                                    | lottery / raffle      | Tinh tuyển                                          |
| may mắn, vận may, cầu may, ăn may, may rủi, hên xui, số đỏ, đỏ đen                                                                                                                        | luck flavor           | nhận về phân bổ / Tinh tuyển                        |
| cá cược, đặt cược, cược, kèo, đánh bạc, cờ bạc, sòng bạc, sòng bài, đánh bài, nhà cái, con bạc                                                                                            | gambling / bet / odds | denial copy only                                    |
| vé, tấm vé                                                                                                                                                                                | ticket                | thuộc diện Tinh tuyển                               |
| trò chơi, người chơi, chơi, ván, lượt chơi, giải đấu, thi đấu, trận đấu, hiệp đấu, vòng đấu, vòng chơi, vòng cược, đối đầu, đối thủ, so tài, tranh tài, cạnh tranh, cuộc đua, cuộc thi    | game / play(er)       | giao thức / người tham gia / cơ chế                 |
| đầu tư, nhà đầu tư, lợi nhuận, lợi tức, lợi suất, lãi, lãi suất, tiền lãi, sinh lời, sinh lãi, sinh lợi, kiếm lời, kiếm tiền, thu lợi, thu nhập, cổ tức, cổ phiếu, chứng khoán, lướt sóng | invest / yield        | phân phối neo giữ (for the mechanic)                |
| miễn thuế                                                                                                                                                                                 | tax-deductible        | denial copy only                                    |
| đặt cọc, ký gửi, thế chấp, gửi tiết kiệm                                                                                                                                                  | staking / deposit     | neo giữ / nạp                                       |
| đúc, khai thác, đào coin, đào tiền, thợ đào                                                                                                                                               | mint / mining         | khắc                                                |
| rút tiền, rút về, rút vốn, rút lời, rút ETH, lĩnh tiền                                                                                                                                    | withdraw / claim      | nhận về                                             |
| từ thiện, quyên góp, quyên tặng, hiến tặng, thiện nguyện, làm phúc, cứu trợ, ủng hộ                                                                                                       | charity / donation    | đóng góp Hàng hóa công (denial copy only otherwise) |
| tự trị phi tập trung                                                                                                                                                                      | DAO                   | Hội đồng Vũ trụ                                     |
| tiếp thị, quảng cáo, quảng bá, khuyến mãi, khuyến mại                                                                                                                                     | marketing             | truyền thông                                        |

Style-level cautions (not scanner-banned, reviewer judgment): _thù lao_ ("remuneration" —
never for _allocation_ or _Anchor Distribution_), _ưu đãi_ (a perk — sales register),
_xác suất_ (fine for _probability_, never for _odds_), _miễn phí_ (reframe as không tốn chi
phí), _giành được_ (fine for "obtain a title", never for "win"), and any certainty-of-gain
phrasing (chắc chắn nhận được) — legally dangerous. Syllables deliberately left unscanned
because an innocent compound contains them — never use them in the banned sense: _thưởng_
(thưởng thức "to appreciate art"), _lời_ (lời nhắn "message", có lời nhắn "there is a message"), _rút_ (rút gọn "shorten"),
_vòng_ (vòng lặp "loop", vòng chọn lọc "selection stage"), _hiệp_ (hiệp hội
"association"), _bạc_ (silver). Write _hỗ trợ_ for "support" (ủng hộ is banned), _giảm giá_
for the RandomWalk discount (never khuyến mãi), _truyền thông_ for outreach (never quảng bá).

## 6. Change process (quy trình thay đổi)

1. Propose the change in a PR that edits this file: old term, new term, rationale,
   affected surfaces.
2. In the **same PR**, update every existing usage: search `messages/vi/**`,
   `content/**/text*.vi.ts`, `content/about/vi.ts`, and the legal `content/legal/*.vi.ts`
   copy modules for the old term.
3. A native-fluency reviewer approves the term; an engineer confirms the sweep is
   complete (`npm run terminology:check` and `npm run lexicon:scan` pass).
4. If the term is scanner-relevant (banned or replaces a banned concept), update
   `VI_BANNED_TERMS` in `scripts/lexicon-scan-core.ts` and the rules in
   `scripts/terminology/vi.ts` in the same PR.
