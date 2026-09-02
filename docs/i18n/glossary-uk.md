# Ukrainian Glossary — Глосарій (українська)

This is the **single source of truth** for how Cosmic Signature's coined vocabulary is
rendered in Ukrainian. Every translator and reviewer works with this file open. One
English term = one Ukrainian term, everywhere — a term that drifts between pages breaks
the product's voice and confuses users.

The English lexicon (machine-enforced in `scripts/lexicon-scan-core.ts`, run via
`npm run lexicon:scan`) is itself a deliberate transcreation layer: _bid_ became
**Gesture**, _raffle_ became **Stellar Selection**, _staking_ became **Anchoring**. The
Ukrainian must do the same job: carry an **art-performance register**, never a gambling /
gaming / investment register. Do not translate the underlying banned concept — translate
the coined term.

Machine enforcement for this locale: the banned register in §5 is `UK_BANNED_STEMS` /
`UK_BANNED_TERMS` in `scripts/lexicon-scan-core.ts`; the drift rules in §2–§3 are
`scripts/terminology/uk.ts` (run via `npm run terminology:check`).

> Status: **frozen with the initial Ukrainian release**. Amendments require the change
> process in §6 and must update all existing usages in the same PR.

---

## 1. Term formation rules (правила творення термінів)

When a new English coinage appears, coin the Ukrainian with these rules:

1. **One or two words** for anything that must fit a button, nav item, or table header;
   the full form may be longer, but a short form must exist (перформанс-цикл → цикл).
2. Draw from the **art / astronomy / craft register** (жест, сигнатура, закарбувати,
   зоряний, галерея) — never from finance (дохід, прибуток, ставка), gaming (гра,
   гравець, раунд), or gambling (приз, розіграш, виграш) registers.
3. Prefer native Ukrainian roots over calques and anglicisms (розподіл, not алокація;
   закріплення, not анкеринг). A loanword is acceptable only where it is the
   established Ukrainian term (перформанс, галерея, транзакція, токен).
4. Test every candidate in three places before adopting: a button label, a full
   sentence, and its compounds and cases (a candidate for _Gesture_ must also work in
   _Gesture Cost_ — вартість жесту, _ETH gesture_ — ETH-жест, _Final Gesture_ —
   завершальний жест, _gesture count_ — кількість жестів, and in all seven cases).
5. Check the term's other meanings and collocations for unwanted flavors (закріпити is
   fine; прикріпити collides with _attach_; ставка collides with _bet_).
6. Established Ukrainian crypto terms are used where they are neutral (гаманець, токен,
   контракт, транзакція, сховище) and avoided where the English deliberately avoided
   them (стейкінг, мінт, клейм, вивести кошти).

## 2. Core coinages — decisions with rationale (ключові терміни)

### Gesture (was _bid_) → жест

The load-bearing term of the whole site. _Gesture_ is an expressive act that shapes an
artwork. Ukrainian **жест** already lives in art criticism (жестовий живопис) and carries
no auction flavor. It declines cleanly (жест, жесту, жестом, жести, жестів) and its
plural forms are regular for ICU (`one {# жест} few {# жести} many {# жестів}`).

| English                            | Українська                |
| ---------------------------------- | ------------------------- |
| Make a Gesture (CTA)               | Зробити жест              |
| a gesture / this gesture           | жест / цей жест           |
| ETH gesture / CST gesture          | ETH-жест / CST-жест       |
| Gesture Cost                       | вартість жесту            |
| Final Gesture                      | завершальний жест         |
| gesture count / Number of Gestures | кількість жестів          |
| Live gestures                      | жести наживо              |
| Gestures with CST                  | CST-жести                 |
| Gesture #42                        | Жест 42 (tables: № жесту) |

Rejected: пропозиція (also _proposal_ — needed for Council copy), заявка (application
form flavor), хід (a game move).

### Performance Cycle (was _round_) → перформанс-цикл (short: цикл)

**Перформанс** is the established Ukrainian word for performance art, so the compound
reads as an artistic act rather than a sports round. The bare short form in dense UI is
**цикл**. **Never** раунд / тур / етап-раунд (round-flavored; see banned list).

Cycle numbers are written without №: **Цикл 12** (the way seasons and episodes are
labeled in Ukrainian interfaces). Where a column header needs the word _number_, use
**№ циклу**.

| English                      | Українська       |
| ---------------------------- | ---------------- |
| Performance Cycle            | перформанс-цикл  |
| Current Cycle / Active Cycle | поточний цикл    |
| Cycle 12 / Cycle #12         | Цикл 12          |
| Cycle Opening                | відкриття циклу  |
| Total Cycles                 | усього циклів    |
| cycle timeline               | хронологія циклу |

Rejected: цикл виконання (execution flavor), цикл вистави (a staged show), цикл
продуктивності (the classic mistranslation of _performance_).

### Finalize / Finalization → завершити / завершення

Plain and dignified. The countdown that drives the whole cycle is the **відлік до
завершення**. Never фіналізувати (calque) and never розрахунок / врегулювання
(settlement — finance flavor).

| English                   | Українська                  |
| ------------------------- | --------------------------- |
| Finalize (button)         | Завершити цикл              |
| Cycle Finalization Time   | час завершення циклу        |
| Open-Finalization Window  | вікно відкритого завершення |
| Finalization countdown    | відлік до завершення        |
| When the cycle finalizes… | коли цикл завершується…     |

### Calibration Window (was _Dutch auction_) → вікно калібрування

Technical, precise, zero auction flavor. Аукціон / торги / голландський аукціон are
banned.

| English                                | Українська                                 |
| -------------------------------------- | ------------------------------------------ |
| Calibration Window                     | вікно калібрування                         |
| CST Calibration Window                 | вікно калібрування CST                     |
| The first ETH Calibration Window opens | відкривається перше вікно калібрування ETH |

### Allocation (was _prize_) → розподіл

**Розподіл** is the neutral distribution/allotment term, and it works for both the
mechanism (напрями розподілу — allocation tracks) and a countable allocation (один
розподіл, розподіл Сигнатури). Приз / винагорода-за-виграш / джекпот are banned in all
forms.

| English                       | Українська                       |
| ----------------------------- | -------------------------------- |
| Allocation                    | розподіл                         |
| Signature Allocation          | розподіл Сигнатури               |
| Chrono-Warrior Allocation     | розподіл Воїна часу              |
| Endurance Champion Allocation | розподіл Чемпіона витривалості   |
| Final CST Gesture Allocation  | розподіл завершального CST-жесту |
| Public Goods Allocation       | розподіл на суспільні блага      |
| allocation tracks             | напрями розподілу                |
| Allocations Distributed       | виконані розподіли               |
| My Allocations                | Мої розподіли                    |
| Special Allocations           | особливі розподіли               |

### Recipient (was _winner_) → отримувач

**Отримувач** is the modern administrative-neutral word ("the one who receives").
Одержувач is the rejected synonym (one term rule); переможець / призер are banned.

| English                      | Українська            |
| ---------------------------- | --------------------- |
| Recipient                    | отримувач             |
| Allocation Recipients (page) | Отримувачі розподілів |
| Recipient History            | історія отримувачів   |
| Unique Recipients            | унікальні отримувачі  |

### Stellar Selection (was _raffle_) → зоряний відбір

**Відбір** is the word for a curated selection (casting, jury selection), never a draw.
The randomness is explained in denial copy as програмний випадковий розподіл на рівні
протоколу — never with лотерея / розіграш / жеребкування vocabulary.

| English                                     | Українська                             |
| ------------------------------------------- | -------------------------------------- |
| Stellar Selection                           | зоряний відбір                         |
| ETH Stellar Selection                       | зоряний відбір ETH                     |
| NFT Stellar Selection — Participants        | зоряний відбір NFT серед учасників     |
| Anchored-NFT Stellar Selection              | зоряний відбір закріплених NFT         |
| a Stellar Selection entry                   | запис у зоряному відборі               |
| Stellar Selection Pool                      | пул зоряного відбору                   |
| Stellar Selection ETH Deposited / Retrieved | ETH зоряного відбору внесено / забрано |

### Anchoring (was _staking_) → закріплення; release → відкріпити

**Закріпити** ("to fasten, to secure in place") is everyday Ukrainian and already the UI
word for pinning (закріплені повідомлення). **Відкріпити** is its natural opposite.
Стейкінг is banned — the English deliberately avoided _staking_ and so do we.

| English                            | Українська                         |
| ---------------------------------- | ---------------------------------- |
| Anchor (verb) / Anchoring          | закріпити / закріплення            |
| Release (an anchor)                | відкріпити                         |
| Anchor-holder                      | власник закріплення                |
| Anchored NFTs                      | закріплені NFT                     |
| My Anchors                         | Мої закріплення                    |
| anchor & release actions           | дії закріплення та відкріплення    |
| each NFT can be anchored only once | кожен NFT можна закріпити лише раз |

Rejected: заякорити / якоріння (rare, nautical), анкеринг (calque), прикріпити (reserved
for _attach_).

### Anchor Distribution (was _yield_) → надходження за закріплення

Must be distinct from розподіл (Allocation) since they are different concepts on the
same screens. **Надходження** ("incoming receipts") is neutral accounting vocabulary
with no promise of return. Never дохід / прибуток / відсотки / дивіденди (all banned —
exactly the yield flavor the English avoids). Short form in table headers:
**надходження**.

| English                         | Українська                           |
| ------------------------------- | ------------------------------------ |
| Anchor Distribution             | надходження за закріплення           |
| Anchor Distributions (amounts)  | суми надходжень за закріплення       |
| Unretrieved Anchor Distribution | незабрані надходження за закріплення |
| Anchor Distribution deposits    | депозити надходжень за закріплення   |

### Retrieve (was _withdraw/claim_) → забрати

Everyday, calm, possession-recovering — the word Ukrainian fintech apps use for
collecting what is yours. Banned: вивести кошти / зняти кошти / кешаут / клейм.

| English                     | Українська                       |
| --------------------------- | -------------------------------- |
| Retrieve (button)           | Забрати                          |
| Retrieve All                | Забрати все                      |
| Unretrieved                 | не забрано / незабрані           |
| Retrievable                 | можна забрати                    |
| retrieved at anchor release | забирається під час відкріплення |

### Imprint (was _mint_) → закарбувати / закарбування

**Закарбувати** ("to engrave, to imprint permanently" — закарбувати в пам’яті) is
ceremonial and permanent, precisely the _imprint_ register. Мінт / мінтити (crypto slang)
and чеканити (coin minting) are banned; bare карбування is drift (it is the coin-minting
noun) and is caught by the terminology gate.

| English                                      | Українська                            |
| -------------------------------------------- | ------------------------------------- |
| Imprint (verb)                               | закарбувати                           |
| NFTs Imprinted                               | закарбовано NFT                       |
| Imprinted NFTs                               | закарбовані NFT                       |
| may imprint dynamic Participation CST        | може закарбувати динамічні CST участі |
| the `/imprint` page (Random Walk imprinting) | Закарбування                          |

### Endurance Champion → Чемпіон витривалості; Chrono-Warrior → Воїн часу

_Champion_ is sanctioned in English (the lexicon bans _compete/competition_, not
_champion_), so **чемпіон** stays. **Витривалість** captures endurance-by-holding-the-lead.
**Воїн часу** ("warrior of time") is poetic and memorable; воїн carries no gambling or
finance flavor.

| English                    | Українська                             |
| -------------------------- | -------------------------------------- |
| Endurance Champion         | Чемпіон витривалості                   |
| Chrono-Warrior             | Воїн часу                              |
| endurance timeline         | хронологія витривалості                |
| lead stint / held the lead | період лідерства / утримував лідерство |
| single continuous reign    | єдине безперервне лідерство            |

### Cosmic Council (was _DAO_) → Космічна Рада

**Рада** (deliberative assembly) over комітет or правління (corporate board). Both words
are capitalized, on the model of Верховна Рада. "DAO" and ДАО are banned in copy.

| English                                  | Українська                                |
| ---------------------------------------- | ----------------------------------------- |
| Cosmic Council                           | Космічна Рада                             |
| Protocol Coordination                    | координація протоколу                     |
| Coordination Proposal                    | пропозиція координації                    |
| Coordination Weight                      | вага координації                          |
| Coordination Quorum                      | кворум координації                        |
| coordination delay / coordination period | затримка координації / період координації |
| Support / Opposition / Abstain           | За / Проти / Утримуюся                    |
| delegate (weight)                        | делегувати (вагу)                         |
| Coordination Changes (page)              | Зміни координації                         |

### Public Goods (was _charity/donation_) → суспільні блага

**Суспільні блага** is the economics term and the one used in the Ukrainian
public-goods-funding community. Благодійність / пожертва / донат are banned (they carry
the exact charitable-donation framing the legal copy denies). _Contribution_ splits by
context:

| English                                   | Українська                    |
| ----------------------------------------- | ----------------------------- |
| Public Goods                              | суспільні блага               |
| Public Goods Beneficiary                  | бенефіціар суспільних благ    |
| Public Goods Contribution (funding sense) | внесок у суспільні блага      |
| ETH Contribution (protocol inflow sense)  | внесок ETH                    |
| Public Goods Vault                        | сховище суспільних благ       |
| Public Goods Retrievals                   | забрані кошти суспільних благ |
| Voluntary Contributions                   | добровільні внески            |
| forwarded to Protocol Guild               | перераховано Protocol Guild   |

### Compounding Cycle Reserve → накопичувальний резерв

**Накопичувальний** ("accumulating") is neutral logistics vocabulary. Never складні
відсотки (compound interest), never джекпот, що переходить (jackpot rollover flavor).

| English                                     | Українська                       |
| ------------------------------------------- | -------------------------------- |
| Cycle Reserve                               | резерв циклу                     |
| Compounding Cycle Reserve                   | накопичувальний резерв           |
| rolls forward into the next cycle           | переходить у наступний цикл      |
| The protocol compounds rather than extracts | Протокол накопичує, а не вилучає |

### Signature (the artwork) → Сигнатура

The artwork keeps brand coherence with "Cosmic Signature" and stays distinct from the
everyday підпис. Capitalized as the proper name of the work. Where cryptographic
signatures appear in the same context (Council copy: "a cryptographic signature"), those
are криптографічний підпис.

| English                                  | Українська                   |
| ---------------------------------------- | ---------------------------- |
| the cycle's final Signature              | фінальна Сигнатура циклу     |
| Every Gesture Shapes the Signature.      | Кожен жест формує Сигнатуру. |
| a Signature (artwork, ambiguous context) | Сигнатура (твір)             |
| sign the transaction (wallet)            | підписати транзакцію         |

## 3. General term table (загальні терміни)

Interface vocabulary — no coinage needed, but fixed for consistency:

| English                              | Українська                                        | Notes                                          |
| ------------------------------------ | ------------------------------------------------- | ---------------------------------------------- |
| Gallery                              | Галерея                                           |                                                |
| How It Works                         | Як це працює                                      |                                                |
| FAQ / Clarifications                 | Поширені запитання                                | nav and page heading alike; never ЧаПи         |
| Learn Hub                            | Навчальний центр                                  |                                                |
| About                                | Про проєкт                                        | 2019 orthography: проєкт                       |
| Statistics                           | Статистика                                        |                                                |
| My Statistics / My Tokens            | Моя статистика / Мої токени                       |                                                |
| Site Map                             | Мапа сайту                                        | never карта сайту                              |
| Contracts                            | Контракти                                         |                                                |
| Source Code                          | Вихідний код                                      |                                                |
| Audits                               | Аудити                                            |                                                |
| Security                             | Безпека                                           |                                                |
| Terms of Use                         | Умови використання                                |                                                |
| Privacy Policy                       | Політика конфіденційності                         |                                                |
| Risk Disclosures                     | Розкриття ризиків                                 |                                                |
| White Paper                          | Біла книга                                        | never вайтпейпер                               |
| Knowledge quiz / quiz tier           | тест знань / рівень (базовий, середній, складний) | never вікторина (TV-show flavor) or гра        |
| score / result (quiz)                | результат                                         | never рахунок, очки                            |
| Outreach Reserve                     | резерв просування                                 | was _marketing_                                |
| Outreach Transactions                | транзакції просування                             |                                                |
| Participation CST                    | CST участі                                        |                                                |
| Recognition CST                      | CST визнання                                      |                                                |
| Attached NFTs / attach               | долучені NFT / долучити                           | assets attached to gestures; never прикріплені |
| Named Tokens / name (verb)           | іменовані токени / дати ім’я                      |                                                |
| Used Random Walk NFTs                | використані Random Walk NFT                       |                                                |
| token / tokens                       | токен / токени                                    | ERC-20 and NFT alike                           |
| wallet / Connect Wallet / Disconnect | гаманець / Під’єднати гаманець / Від’єднати       |                                                |
| transfer (NFT) / transfer (ERC-20)   | передати / переказати                             | передача / переказ as nouns                    |
| transaction                          | транзакція                                        |                                                |
| participant                          | учасник                                           | учасники, учасників                            |
| Unique Participants                  | унікальні учасники                                |                                                |
| holder                               | власник                                           |                                                |
| balance                              | баланс                                            |                                                |
| supply / total supply                | пропозиція / загальна пропозиція                  | standard Ukrainian token-supply term           |
| deposit (noun, into pools)           | депозит                                           |                                                |
| distribute (general, not Anchor D.)  | надіслати / передати                              | never виплатити                                |
| indexed (by the API)                 | проіндексовано                                    |                                                |
| on-chain                             | ончейн (adj.: ончейн-)                            | ончейн-мистецтво                               |
| procedural on-chain art protocol     | процедурний протокол ончейн-мистецтва             | brand tagline                                  |
| deterministic                        | детермінований                                    |                                                |
| generative art                       | генеративне мистецтво                             |                                                |
| three-body problem                   | задача трьох тіл                                  | the standard physics term                      |
| Newtonian gravity                    | ньютонівська гравітація                           |                                                |
| seed                                 | сід                                               | початкове значення генератора                  |
| render / rendering                   | рендер / рендеринг                                |                                                |
| verified / verification              | верифіковано / верифікація                        | contracts; "перевірено" for facts              |
| reproducible                         | відтворюваний                                     |                                                |
| open source                          | відкритий код                                     |                                                |
| public domain                        | суспільне надбання                                | CC0 context                                    |
| formally verified                    | формально верифікований                           |                                                |
| system event / system mode           | системна подія / системний режим                  |                                                |
| admin / internal (tools)             | адміністрування / внутрішні інструменти           |                                                |
| loading…                             | Завантаження…                                     |                                                |
| no data / empty state                | Немає даних                                       |                                                |
| error                                | Сталася помилка / Помилка                         | surface-dependent, see style guide             |
| retry / try again later              | Повторити / Спробуйте пізніше                     |                                                |
| copy address / copied                | Копіювати адресу / Скопійовано                    |                                                |
| view on Arbiscan                     | Переглянути на Arbiscan                           |                                                |

### 3.1 Cosmic Signature trait vocabulary (ознаки творів)

The metadata pipeline publishes each Signature's traits as OpenSea-style attributes.
The frontend never renders the wire labels: every trait type and every closed-set value
goes through `messages/{locale}/traits.json` (mapping in `lib/nftMetadata/labels.ts`).
Open vocabularies (palette names) are composed from a hue word plus a scheme word. The
wire label `Round` maps to цикл, never раунд.

| English (wire)                 | Українська               | Notes                                                                                                                                                                                                             |
| ------------------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| trait / traits                 | ознака / ознаки          | never атрибут (wire-shape flavor)                                                                                                                                                                                 |
| rarity / rarity rank           | рідкість / ранг рідкості | descriptive of frequency only; no value or collectibility framing                                                                                                                                                 |
| Structure                      | Структура                |                                                                                                                                                                                                                   |
| Underlay                       | Підкладка                |                                                                                                                                                                                                                   |
| Accent                         | Акцент                   |                                                                                                                                                                                                                   |
| Symmetry                       | Симетрія                 | Mirror дзеркальна · Rosette ×N розета ×N · Mandala ×N мандала ×N                                                                                                                                                  |
| Projection                     | Проєкція                 | Cross Braid перехресне плетиво · Phase Portrait фазовий портрет · Hodograph годограф                                                                                                                              |
| Wildcard                       | Несподіванка             | value Yes → Так                                                                                                                                                                                                   |
| Finish                         | Фактура                  | Stardust зоряний пил · Prism призма                                                                                                                                                                               |
| Palette                        | Палітра                  | `{hue} · {scheme}`                                                                                                                                                                                                |
| palette hue words              | see traits.json          | Amber бурштин · Aurora аврора · Cerulean лазур · Ember жарина · Glacial крига · Jade нефрит · Nebular туманність · Orchid орхідея · Rose троянда · Sapphire сапфір · Solar сонце · Violet фіалка                  |
| palette scheme words           | see traits.json          | Mono моно · Split розділена · Analogous аналогова · Triad тріада · Complementary комплементарна · Tetrad тетрада                                                                                                  |
| Spectral Class                 | Спектральний клас        | letters O–M stay Latin: B → клас B                                                                                                                                                                                |
| Mass Balance                   | Баланс мас               | Heavy Primary важка головна · Twin Binary подвійна пара · Equal Trio рівне тріо                                                                                                                                   |
| Fate                           | Доля                     | Eternal Dance вічний танець · Ejection викид                                                                                                                                                                      |
| Chaos (index)                  | Індекс хаосу             | 0–100                                                                                                                                                                                                             |
| Syzygies                       | Сизигії                  | three-body alignments; the classical astronomical term                                                                                                                                                            |
| Imprinted (trait)              | Закарбовано              |                                                                                                                                                                                                                   |
| Allocation (trait)             | Розподіл                 | values reuse §2                                                                                                                                                                                                   |
| structure vocabulary values    | see traits.json          | Orbit Ribbons орбітальні стрічки · Time Chords часові акорди · Harmonic Weave гармонічне плетіння · Tangent Caustics дотичні каустики · Stipple Constellation пунктирне сузір’я · Nebula Veil серпанок туманності |
| Collection DNA (gallery strip) | ДНК колекції             |                                                                                                                                                                                                                   |
| quick view                     | швидкий перегляд         |                                                                                                                                                                                                                   |
| spectral sweep (video)         | спектральний огляд       |                                                                                                                                                                                                                   |

## 4. Keep in English (залишаємо латинкою)

Never translated or transliterated, in any surface. Latin abbreviations are
indeclinable and never take Cyrillic case endings (у CST, за ETH, з NFT — never
CST-ом).

- **Brands/products:** Cosmic Signature, Random Walk NFT, Protocol Guild, Arbitrum,
  Arbitrum One, Ethereum¹, Uniswap, Axiom Zero, Chaos Zero, MetaMask, WalletConnect,
  Coinbase Wallet, Safe, GitHub, Discord, X (Twitter), Arbiscan
- **Tokens/tickers:** ETH, CST, NFT, ERC-20, ERC-721
- **Licenses/standards:** CC0, CC0 1.0, BCP 47
- **Technical identifiers:** SHA3-256, SHA-256, OKLab, AgX, OpenSimplex, H.265, PNG, RNG,
  Yoshida (4th-order Yoshida symplectic integrator → симплектичний інтегратор Йосіди
  4-го порядку), Borda (агрегація за методом Борда), API, UTC
- **Language names in the switcher:** English stays "English", 中文 stays "中文",
  Ukrainian stays "Українська"

¹ Ethereum: **Ethereum** stays Latin in prose too (Ukrainian crypto writing keeps the
network name in Latin); "ефір" is not used.

## 5. Banned Ukrainian terms (заборонена лексика)

Mirrors the English banned list (`scripts/lexicon-scan-core.ts`) with the same scope,
extended only with Ukrainian vocabulary that carries the banned flavor. Stems in the
scanner cover every inflected form. As in English, the **only** sanctioned exception is
FAQ/legal _denial_ copy inside `lexicon-allow` pragmas (e.g. «Це не лотерея і не азартна
гра»).

| Banned (заборонено)                                                              | Concept               | Use instead (замість)                                 |
| -------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------- |
| ставка, ставки, торги, лот, аукціон, голландський аукціон                        | bid / auction         | жест / вікно калібрування                             |
| приз, призовий, джекпот, куш                                                     | prize / jackpot       | розподіл                                              |
| переможець, виграш, виграти                                                      | winner                | отримувач                                             |
| лотерея, розіграш, розіграти, жеребкування, тираж, лототрон, роздача             | lottery / raffle      | зоряний відбір                                        |
| казино, азарт, гральний, букмекер, тоталізатор, рулетка                          | gambling / bet / odds | denial copy only                                      |
| удача, везіння, фортуна, щасливчик, пощастило                                    | luck flavor           | отримати розподіл / зоряний відбір                    |
| квиток, білет                                                                    | ticket                | запис у зоряному відборі                              |
| гра, грати, гравець, ігровий, гейм-, геймер                                      | game / play(er)       | протокол / учасник / механіка                         |
| змагання, змагатися, конкурс, турнір, конкуренція, конкурент                     | competition / contest | describe the mechanic                                 |
| інвестиція, інвестор, інвестувати                                                | invest(or)            | denial copy only                                      |
| дохід, дохідність, прибуток, прибутковість, дивіденди, рентабельність, окупність | yield / profit        | надходження за закріплення (for the mechanic)         |
| заробити, заробляти, заробіток                                                   | earn(ings)            | отримати розподіл / describe the flow                 |
| неоподатковуваний, податкові пільги                                              | tax-deductible        | denial copy only                                      |
| деген, туземун, ламбо                                                            | crypto slang          | —                                                     |
| стейкінг, стейкати                                                               | staking               | закріплення                                           |
| мінт, мінтити, замінтити, чеканити, майнінг, майнер                              | mint / mining         | закарбувати                                           |
| вивести кошти, виведення коштів, зняти кошти, кешаут, клейм, клеймити            | withdraw / claim      | забрати                                               |
| халява                                                                           | freebie slang         | describe the allocation                               |
| благодійність, доброчинність, пожертва, донат, донор, філантропія                | charity / donation    | внесок у суспільні блага (denial copy only otherwise) |
| DAO, ДАО                                                                         | DAO                   | Космічна Рада                                         |
| раунд                                                                            | round                 | цикл / Цикл N                                         |

Style-level cautions (not scanner-banned, reviewer judgment): виплата ("payout" —
prefer надходження / розподіл), винагорода ("reward" — sanctioned in English but keep it
for _reward_ only, never for _prize_), парі ("a bet" — not scanned because it is also the
locative of пара, "a pair"; never use it in the betting sense), шанс (prefer можливість),
безкоштовно (reframe), and any certainty-of-gain phrasing (гарантовано отримаєте) —
legally dangerous.

## 6. Change process (процес змін)

1. Propose the change in a PR that edits this file: old term, new term, rationale,
   affected surfaces.
2. In the **same PR**, update every existing usage: search `messages/uk/**`,
   `content/**/text*.uk.ts`, `content/about/uk.ts`, and the legal `content/legal/*.uk.ts`
   copy modules for the old term (all its inflected forms).
3. A native-fluency reviewer approves the term; an engineer confirms the sweep is
   complete (`npm run terminology:check` and `npm run lexicon:scan` pass).
4. If the term is scanner-relevant (banned or replaces a banned concept), update
   `UK_BANNED_STEMS` / `UK_BANNED_TERMS` in `scripts/lexicon-scan-core.ts` and the rules
   in `scripts/terminology/uk.ts` in the same PR.
