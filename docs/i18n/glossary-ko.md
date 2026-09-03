# Korean Glossary — 용어집 (한국어)

This is the **single source of truth** for how Cosmic Signature's coined vocabulary is
rendered in Korean. Every translator and reviewer works with this file open. One English
term = one Korean term, everywhere — a term that drifts between pages breaks the
product's voice and confuses users.

The English lexicon (machine-enforced in `scripts/lexicon-scan-core.ts`, run via
`npm run lexicon:scan`) is itself a deliberate transcreation layer: _bid_ became
**Gesture**, _raffle_ became **Stellar Selection**, _staking_ became **Anchoring**. The
Korean must do the same job: carry an **art-performance register**, never a gambling /
gaming / investment register. Korean crypto writing is saturated with exactly the words
the English avoids (민팅, 스테이킹, 에어드랍, 수익률, 당첨) — none of them appear here. Do not
translate the underlying banned concept — translate the coined term.

Machine enforcement for this locale: the banned register in §5 is `KO_BANNED_TERMS` in
`scripts/lexicon-scan-core.ts`; the drift rules in §2–§3 are `scripts/terminology/ko.ts`
(run via `npm run terminology:check`); the mechanical conventions of
[style-guide-ko.md](./style-guide-ko.md) (particles on placeholders, punctuation, the
dropped pronoun) are `LOCALE_CONVENTIONS.ko` in `scripts/i18n-conventions-core.ts` (run
via `npm run i18n:conventions`).

> Status: **frozen with the initial Korean release**. Amendments require the change
> process in §6 and must update all existing usages in the same PR.

---

## 1. Term formation rules (용어 만들기 원칙)

When a new English coinage appears, coin the Korean with these rules:

1. **Two to four syllables** for anything that must fit a button, nav item, or table
   header; the full form may be longer, but a short form must exist (퍼포먼스 사이클 →
   사이클).
2. Draw from the **art / astronomy / craft register** (제스처, 각인, 별빛, 시그니처, 갤러리)
   — never from finance (수익, 배당, 투자), gaming (게임, 플레이어, 라운드), or gambling
   (당첨, 추첨, 상금) registers.
3. Prefer Sino-Korean or native words over loanwords where the word is established
   (배분, 수령자, 회수, 각인, 보정 구간, 공공재). A loanword is acceptable where it is the
   everyday Korean term for the thing (제스처, 사이클, 앵커링, 갤러리, 지갑 is native, 토큰,
   프로토콜, 트랜잭션) — Korean readers meet loanwords in Latin-heavy interfaces without
   friction, but a loanword that only transliterates the English coinage (스텔라 셀렉션,
   크로노 워리어) is a translation debt, not a term.
4. Test every candidate in three places before adopting: a button label, a full
   sentence, and its compounds (a candidate for _Gesture_ must also work in _Gesture
   Cost_ — 제스처 비용, _ETH gesture_ — ETH 제스처, _Final Gesture_ — 최종 제스처, _gesture
   count_ — 제스처 수). Korean has no cases, so compounds are the only agreement test;
   the particle test (§3 of the style guide) is the other.
5. Check the term's other meanings and homographs for unwanted flavors: 마감 is fine for
   _finalize_ (a closing) but rules out 마감 for the _Finish_ trait (질감 instead); 회수 is
   _retrieve_ (回收), never a count (횟수); 감사 needs 보안 in front of it so it does not
   read as "thanks".
6. Established Korean crypto terms are used where they are neutral (지갑, 토큰,
   컨트랙트, 트랜잭션, 온체인, 가스) and avoided where the English deliberately avoided them
   (스테이킹, 민팅, 클레임, 에어드랍, 출금).

## 2. Core coinages — decisions with rationale (핵심 용어)

### Gesture (was _bid_) → 제스처

The load-bearing term of the whole site. _Gesture_ is an expressive act that shapes an
artwork. Korean art writing already uses **제스처** for exactly this (제스처 페인팅,
회화적 제스처), it carries no auction flavor, and it takes every compound the interface
needs. It is the National Institute of Korean Language spelling (제스처, never 제스쳐).

| English                            | 한국어                  |
| ---------------------------------- | ----------------------- |
| Make a Gesture (CTA)               | 제스처 남기기           |
| a gesture / this gesture           | 제스처 / 이 제스처      |
| ETH gesture / CST gesture          | ETH 제스처 / CST 제스처 |
| Gesture Cost                       | 제스처 비용             |
| Final Gesture                      | 최종 제스처             |
| Last Gesture (most recent)         | 최근 제스처             |
| gesture count / Number of Gestures | 제스처 수               |
| Live gestures                      | 실시간 제스처           |
| Gestures with CST                  | CST 제스처              |
| Gesture #42                        | 제스처 #42              |

남기다 ("to leave a mark") is the verb: a gesture is left on the cycle the way a
brushstroke is left on paper. Rejected: 획 (a stroke — ambiguous alone, homograph-heavy
in compounds), 붓질 (brushstroke — too literal for ETH/CST mechanics), 손짓 (a hand
wave, casual), 입찰 (banned).

### Performance Cycle (was _round_) → 퍼포먼스 사이클 (short: 사이클)

**퍼포먼스** is the established Korean word for performance art (퍼포먼스 아트), so the
compound reads as an artistic act. The bare short form in dense UI is **사이클**, which
Korean interfaces already use for recurring periods. **Never** 라운드 / 회차 (banned,
lottery-draw flavor), never 주기 (reads as "periodicity" and cannot take a number —
사이클 12 works, 주기 12 does not), never 성능 (the classic mistranslation of
_performance_).

Cycle numbers follow the English: **사이클 12**, the way seasons and episodes are labeled
(시즌 12). Where a column header needs the word _number_, use **사이클 번호**.

| English                      | 한국어          |
| ---------------------------- | --------------- |
| Performance Cycle            | 퍼포먼스 사이클 |
| Current Cycle / Active Cycle | 현재 사이클     |
| Cycle 12 / Cycle #12         | 사이클 12       |
| Cycle Opening                | 사이클 시작     |
| Total Cycles                 | 총 사이클 수    |
| cycle timeline               | 사이클 타임라인 |
| next cycle                   | 다음 사이클     |

### Finalize / Finalization → 마감 / 마감하다

**마감** is the everyday word for bringing a period to its close (원고 마감, 접수 마감) —
dignified, neutral, and it names the moment rather than a settlement. The countdown that
drives the whole cycle is the **마감 카운트다운**. Never 파이널라이즈 (calque), never 정산 /
결산 (settlement — finance flavor), never 종료 (a mere ending with no distribution in
it).

| English                   | 한국어             |
| ------------------------- | ------------------ |
| Finalize (button)         | 사이클 마감        |
| Cycle Finalization Time   | 사이클 마감 시각   |
| Open-Finalization Window  | 공개 마감 구간     |
| Finalization countdown    | 마감 카운트다운    |
| When the cycle finalizes… | 사이클이 마감되면… |
| finalizer                 | 마감 실행자        |

### Calibration Window (was _Dutch auction_) → 보정 구간

**보정** (calibration, correction) is the engineering word; **구간** is how Korean names a
span of time or price (가격 구간, 시간 구간). Together they describe a descending
price without a hint of an auction. 경매 / 입찰 / 더치 옥션 are banned.

| English                                | 한국어                        |
| -------------------------------------- | ----------------------------- |
| Calibration Window                     | 보정 구간                     |
| CST Calibration Window                 | CST 보정 구간                 |
| The first ETH Calibration Window opens | 첫 ETH 보정 구간이 시작됩니다 |

Rejected: 캘리브레이션 윈도우 (calque), 보정 창 (창 is a window pane), 조정 구간 (조정 is
"adjustment", and collides with the mediation sense).

### Allocation (was _prize_) → 배분

**배분** is the neutral allotment term (예산 배분, 자원 배분), and it works both for the
mechanism (배분 경로 — allocation tracks) and a countable allocation (배분 한 건, 시그니처
배분). 상금 / 경품 / 잭팟 / 당첨금 are banned in all forms; 배당 (dividend) is banned; 보상 /
리워드 (reward) are drift — the English says _allocation_ precisely because nothing is
"won" or "earned".

| English                       | 한국어               |
| ----------------------------- | -------------------- |
| Allocation                    | 배분                 |
| Signature Allocation          | 시그니처 배분        |
| Chrono-Warrior Allocation     | 시간의 전사 배분     |
| Endurance Champion Allocation | 수호 챔피언 배분     |
| Final CST Gesture Allocation  | 최종 CST 제스처 배분 |
| Public Goods Allocation       | 공공재 배분          |
| allocation tracks             | 배분 경로            |
| Allocations Distributed       | 완료된 배분          |
| My Allocations                | 내 배분              |
| Special Allocations           | 특별 배분            |

Rejected: 할당 (a quota or assignment — technical), 분배 (kept out so that Anchor
Distribution has its own word), 배당 (banned).

### Recipient (was _winner_) → 수령자

**수령자** ("the one who receives") is administrative-neutral Korean. 당첨자 / 승자 /
우승자 are banned; 수신자 is a message recipient; 수혜자 carries a welfare flavor.

| English                      | 한국어      |
| ---------------------------- | ----------- |
| Recipient                    | 수령자      |
| Allocation Recipients (page) | 배분 수령자 |
| Recipient History            | 수령자 내역 |
| Unique Recipients            | 고유 수령자 |

### Stellar Selection (was _raffle_) → 별빛 선정

**선정** is the word for a curated selection (심사 선정, 작품 선정) — a jury's choice,
never a draw. **별빛** ("starlight") keeps the astronomical register of the English and
gives the mechanic a name a Korean reader can say. The randomness is explained in denial
copy as 프로토콜 수준의 무작위 배분 — never with 추첨 / 복권 / 뽑기 vocabulary.

| English                                     | 한국어                    |
| ------------------------------------------- | ------------------------- |
| Stellar Selection                           | 별빛 선정                 |
| ETH Stellar Selection                       | ETH 별빛 선정             |
| NFT Stellar Selection — Participants        | 참여자 대상 NFT 별빛 선정 |
| Anchored-NFT Stellar Selection              | 앵커링 NFT 별빛 선정      |
| a Stellar Selection entry                   | 별빛 선정 자격            |
| Stellar Selection Pool                      | 별빛 선정 풀              |
| Stellar Selection ETH Deposited / Retrieved | 별빛 선정 ETH 적립 / 회수 |

Rejected: 스텔라 셀렉션 (untranslated), 항성 선정 (astronomy jargon, cold), 별 뽑기
(lottery flavor), 추첨 (banned).

### Anchoring (was _staking_) → 앵커링; release → 해제

**앵커링** keeps the brand's anchor metaphor legible (앵커 = anchor) and is already a
Korean UX word (앵커 링크, 앵커링 효과). The native alternatives fail the compound test:
정박 is for ships, 고정 is every "fixed" and "pinned" in the interface. 스테이킹 and 예치
(the Korean DeFi word for depositing into a protocol) are banned — the English
deliberately avoided _staking_ and so do we.

| English                            | 한국어                                |
| ---------------------------------- | ------------------------------------- |
| Anchor (verb) / Anchoring          | 앵커링하다 / 앵커링                   |
| Release (an anchor)                | 앵커링 해제                           |
| Anchor-holder                      | 앵커링 보유자                         |
| Anchored NFTs                      | 앵커링된 NFT                          |
| My Anchors                         | 내 앵커링                             |
| anchor & release actions           | 앵커링 및 해제 작업                   |
| each NFT can be anchored only once | 각 NFT는 한 번만 앵커링할 수 있습니다 |

### Anchor Distribution (was _yield_) → 앵커링 지급

Must be distinct from 배분 (Allocation) since they are different concepts on the same
screens. **지급** ("disbursement") is neutral administrative vocabulary (급여 지급, 지급
내역) with no promise of return. Never 수익 / 이자 / 배당 / 이율 (all banned — exactly
the yield flavor the English avoids). Short form in table headers: **지급**.

| English                         | 한국어             |
| ------------------------------- | ------------------ |
| Anchor Distribution             | 앵커링 지급        |
| Anchor Distributions (amounts)  | 앵커링 지급액      |
| Unretrieved Anchor Distribution | 미회수 앵커링 지급 |
| Anchor Distribution deposits    | 앵커링 지급 적립   |

### Retrieve (was _withdraw/claim_) → 회수

**회수** (回收, "to take back what is yours") is calm and possession-recovering; it
serves allocations, anchored NFTs, and public-goods funds alike. Banned: 인출 / 출금
(bank withdrawal), 클레임 / 캐시아웃 / 현금화. Counts are always 횟수, never 회수, so the
homograph never appears.

| English                     | 한국어              |
| --------------------------- | ------------------- |
| Retrieve (button)           | 회수                |
| Retrieve All                | 모두 회수           |
| Unretrieved                 | 미회수              |
| Retrievable                 | 회수 가능           |
| retrieved at anchor release | 앵커링 해제 시 회수 |

### Imprint (was _mint_) → 각인

**각인** ("to engrave permanently"; 각인되다 — to be etched into memory) is ceremonial
and permanent, precisely the _imprint_ register. 민팅 / 민트 (crypto slang) and 채굴
(mining) are banned; 발행 (issuance — the finance word) is drift.

| English                                      | 한국어                             |
| -------------------------------------------- | ---------------------------------- |
| Imprint (verb)                               | 각인하다                           |
| NFTs Imprinted                               | 각인된 NFT 수                      |
| Imprinted NFTs                               | 각인된 NFT                         |
| may imprint dynamic Participation CST        | 동적 참여 CST를 각인할 수 있습니다 |
| the `/imprint` page (Random Walk imprinting) | 각인                               |

### Endurance Champion → 수호 챔피언; Chrono-Warrior → 시간의 전사

_Champion_ is sanctioned in English (the lexicon bans _compete/competition_, not
_champion_), so **챔피언** stays. The Endurance Champion is the participant who held the
lead the longest — in Korean sports writing you 선두를 지키다, "keep (guard) the lead",
and **수호** is that guarding made a title. **시간의 전사** ("warrior of time") is poetic
and memorable, and 전사 carries no gambling or finance flavor. The pair shares one
heroic register.

| English                    | 한국어                             |
| -------------------------- | ---------------------------------- |
| Endurance Champion         | 수호 챔피언                        |
| Chrono-Warrior             | 시간의 전사                        |
| endurance timeline         | 선두 유지 기록                     |
| lead stint / held the lead | 선두 유지 구간 / 선두를 지켰습니다 |
| single continuous reign    | 단일 연속 선두                     |

Rejected: 인듀어런스 챔피언 / 크로노 워리어 (untranslated), 지속 챔피언 (bureaucratic), 인내
챔피언 (moralizing), 지구력 챔피언 (sports stamina), 시간 전사 (reads as "time soldier").

### Cosmic Council (was _DAO_) → 우주 평의회

**평의회** (a deliberative council of peers) over 의회 (a legislature), 위원회 (a
committee), or 이사회 (a corporate board). "DAO" and 다오 are banned in copy.
_Coordination_, the English word for what the Council does, is **조율** — the word for
bringing parties into tune — never 거버넌스 (the calque the English itself avoids).

| English                                  | 한국어                 |
| ---------------------------------------- | ---------------------- |
| Cosmic Council                           | 우주 평의회            |
| Protocol Coordination                    | 프로토콜 조율          |
| Coordination Proposal                    | 조율 제안              |
| Coordination Weight                      | 조율 가중치            |
| Coordination Quorum                      | 조율 정족수            |
| coordination delay / coordination period | 조율 지연 / 조율 기간  |
| Support / Opposition / Abstain           | 찬성 / 반대 / 기권     |
| delegate (weight)                        | 위임하다 (가중치 위임) |
| Coordination Changes (page)              | 조율 변경 내역         |

### Public Goods (was _charity/donation_) → 공공재

**공공재** is the economics term and the one Korean public-goods-funding writing uses.
자선 / 기부 / 후원 / 모금 are banned (they carry the exact charitable-donation framing the
legal copy denies). _Contribution_ is **기여** in every sense — the funding sense and the
protocol-inflow sense alike — never 기부.

| English                                   | 한국어                  |
| ----------------------------------------- | ----------------------- |
| Public Goods                              | 공공재                  |
| Public Goods Beneficiary                  | 공공재 수령처           |
| Public Goods Contribution (funding sense) | 공공재 기여             |
| ETH Contribution (protocol inflow sense)  | ETH 기여                |
| Public Goods Vault                        | 공공재 금고             |
| Public Goods Retrievals                   | 공공재 회수 내역        |
| Voluntary Contributions                   | 자발적 기여             |
| forwarded to Protocol Guild               | Protocol Guild로 전달됨 |

### Compounding Cycle Reserve → 누적 준비금

**누적** ("accumulating") is neutral logistics vocabulary; **준비금** is the reserve
fund. Never 복리 (compound interest), never 잭팟 / 이월 잭팟 (rollover flavor). The
reserve **이월됩니다** ("is carried over") into the next cycle — the accounting verb.

| English                                     | 한국어                             |
| ------------------------------------------- | ---------------------------------- |
| Cycle Reserve                               | 사이클 준비금                      |
| Compounding Cycle Reserve                   | 누적 준비금                        |
| rolls forward into the next cycle           | 다음 사이클로 이월됩니다           |
| The protocol compounds rather than extracts | 프로토콜은 빼내지 않고 쌓아 갑니다 |

### Signature (the artwork) → 시그니처

The artwork keeps brand coherence with "Cosmic Signature" and stays distinct from the
everyday 서명 (a handwritten or cryptographic signature). Where cryptographic signatures
appear in the same context (wallet copy: "sign the transaction"), those are **서명**.

| English                                  | 한국어                               |
| ---------------------------------------- | ------------------------------------ |
| the cycle's final Signature              | 사이클의 최종 시그니처               |
| Every Gesture Shapes the Signature.      | 모든 제스처가 시그니처를 빚어냅니다. |
| a Signature (artwork, ambiguous context) | 시그니처 작품                        |
| sign the transaction (wallet)            | 트랜잭션에 서명                      |

## 3. General term table (일반 용어)

Interface vocabulary — no coinage needed, but fixed for consistency:

| English                              | 한국어                                 | Notes                                               |
| ------------------------------------ | -------------------------------------- | --------------------------------------------------- |
| Gallery                              | 갤러리                                 |                                                     |
| How It Works                         | 작동 원리                              | never 이용 방법 (a help page), 작동 방식            |
| FAQ / Clarifications                 | 자주 묻는 질문                         | nav and page heading alike                          |
| Learn Hub                            | 학습 센터                              |                                                     |
| About                                | Cosmic Signature 소개                  | short form in nav: 소개                             |
| Statistics                           | 통계                                   |                                                     |
| My Statistics / My Tokens            | 내 통계 / 내 토큰                      | 내, never 나의 or 저의                              |
| Site Map                             | 사이트맵                               | one word, never 사이트 지도                         |
| Contracts                            | 컨트랙트                               | smart contracts; 계약 is a legal contract           |
| Source Code                          | 소스 코드                              |                                                     |
| Audits                               | 보안 감사                              | always with 보안 — bare 감사 also reads as "thanks" |
| Security                             | 보안                                   |                                                     |
| Terms of Use                         | 이용약관                               | one word, the Korean legal convention               |
| Privacy Policy                       | 개인정보 처리방침                      | the statutory term; never 프라이버시 정책           |
| Risk Disclosures                     | 위험 고지                              |                                                     |
| White Paper                          | 백서                                   | never 화이트페이퍼                                  |
| Knowledge quiz / quiz tier           | 지식 퀴즈 / 단계 (기본, 중급, 고급)    | 퀴즈 is educational in Korean; never 게임           |
| score / result (quiz)                | 점수 / 결과                            |                                                     |
| Outreach Reserve                     | 홍보 준비금                            | was _marketing_; 마케팅 is banned                   |
| Outreach Transactions                | 홍보 트랜잭션                          |                                                     |
| Participation CST                    | 참여 CST                               |                                                     |
| Recognition CST                      | 공로 CST                               |                                                     |
| Attached NFTs / attach               | 첨부된 NFT / 첨부하다                  | assets attached to gestures                         |
| Named Tokens / name (verb)           | 이름 붙인 토큰 / 이름 붙이기           |                                                     |
| Used Random Walk NFTs                | 사용된 Random Walk NFT                 |                                                     |
| token / tokens                       | 토큰                                   | Korean has no plural marker; never 토큰들           |
| wallet / Connect Wallet / Disconnect | 지갑 / 지갑 연결 / 연결 해제           |                                                     |
| transfer (NFT or ERC-20)             | 전송                                   | 이체 is a bank transfer                             |
| transaction                          | 트랜잭션                               | 거래 is a trade (Uniswap copy only)                 |
| participant                          | 참여자                                 | never 참가자 (an entrant), 플레이어 (banned)        |
| Unique Participants                  | 고유 참여자                            |                                                     |
| user (UI and legal alike)            | 사용자                                 | never 유저; 이용자 is drift                         |
| holder                               | 보유자                                 |                                                     |
| balance                              | 잔액                                   |                                                     |
| supply / total supply                | 공급량 / 총 공급량                     |                                                     |
| deposit (into pools)                 | 적립                                   | never 예치 (banned — the staking word)              |
| distribute (general, not Anchor D.)  | 배분하다 / 전달하다                    | never 지급 outside Anchor Distribution              |
| indexed (by the API)                 | 인덱싱됨                               |                                                     |
| on-chain                             | 온체인                                 | 온체인 아트                                         |
| procedural on-chain art protocol     | 절차적 온체인 아트 프로토콜            | brand tagline; 절차적 is the CG term (절차적 생성)  |
| deterministic                        | 결정론적                               |                                                     |
| generative art                       | 제너러티브 아트                        | the Korean art-scene term                           |
| three-body problem                   | 삼체 문제                              | the standard physics term                           |
| Newtonian gravity                    | 뉴턴 중력                              |                                                     |
| seed                                 | 시드                                   | 시드값 for "seed value"                             |
| render / rendering                   | 렌더 / 렌더링                          |                                                     |
| verified / verification              | 검증됨 / 검증                          | contracts; never 인증 (authentication)              |
| reproducible                         | 재현 가능                              |                                                     |
| open source                          | 오픈 소스                              |                                                     |
| public domain                        | 퍼블릭 도메인                          | CC0 context                                         |
| formally verified                    | 정형 검증됨                            | the CS term                                         |
| system event / system mode           | 시스템 이벤트 / 시스템 모드            |                                                     |
| admin / internal (tools)             | 관리자 / 내부 도구                     |                                                     |
| loading…                             | 불러오는 중…                           | never 로딩 중                                       |
| no data / empty state                | 데이터 없음                            |                                                     |
| error                                | 오류가 발생했습니다 / 오류             | surface-dependent, see style guide                  |
| retry / try again later              | 다시 시도 / 잠시 후 다시 시도해 주세요 |                                                     |
| copy address / copied                | 주소 복사 / 복사됨                     |                                                     |
| view on Arbiscan                     | Arbiscan에서 보기                      |                                                     |

### 3.1 Cosmic Signature trait vocabulary (작품 특성 용어)

The metadata pipeline publishes each Signature's traits as OpenSea-style attributes.
The frontend never renders the wire labels: every trait type and every closed-set value
goes through `messages/{locale}/traits.json` (mapping in `lib/nftMetadata/labels.ts`).
Open vocabularies (palette names) are composed from a hue word plus a scheme word. The
wire label `Round` maps to 사이클, never 라운드.

| English (wire)                 | 한국어               | Notes                                                                                                                                                                            |
| ------------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| trait / traits                 | 특성                 | never 속성 (wire-shape flavor)                                                                                                                                                   |
| rarity / rarity rank           | 희귀도 / 희귀도 순위 | descriptive of frequency only; no value or collectibility framing                                                                                                                |
| Structure                      | 구조                 |                                                                                                                                                                                  |
| Underlay                       | 밑그림               |                                                                                                                                                                                  |
| Accent                         | 악센트               |                                                                                                                                                                                  |
| Symmetry                       | 대칭                 | Mirror 거울 · Rosette ×N 로제트 ×N · Mandala ×N 만다라 ×N                                                                                                                        |
| Projection                     | 투영                 | Cross Braid 교차 엮음 · Phase Portrait 위상 초상 · Hodograph 호도그래프                                                                                                          |
| Wildcard                       | 와일드카드           | value Yes → 예                                                                                                                                                                   |
| Finish                         | 질감                 | never 마감 (reserved for _finalize_); Stardust 별가루 · Prism 프리즘                                                                                                             |
| Palette                        | 팔레트               | `{hue} {scheme}`                                                                                                                                                                 |
| palette hue words              | see traits.json      | Amber 앰버 · Aurora 오로라 · Cerulean 세룰리안 · Ember 불씨 · Glacial 빙하 · Jade 비취 · Nebular 성운 · Orchid 난초 · Rose 장미 · Sapphire 사파이어 · Solar 태양 · Violet 제비꽃 |
| palette scheme words           | see traits.json      | Mono 단색 · Split 분할 · Analogous 유사 · Triad 삼색 · Complementary 보색 · Tetrad 사색                                                                                          |
| Spectral Class                 | 분광형               | letters O–M stay Latin: Class B → B형                                                                                                                                            |
| Mass Balance                   | 질량 균형            | Heavy Primary 무거운 주성 · Twin Binary 쌍둥이 쌍성 · Equal Trio 균등 삼체                                                                                                       |
| Fate                           | 운명                 | Eternal Dance 영원한 춤 · Ejection 방출                                                                                                                                          |
| Chaos (index)                  | 카오스 지수          | 0–100                                                                                                                                                                            |
| Syzygies                       | 삭망                 | three-body alignments; the classical astronomical term                                                                                                                           |
| Imprinted (trait)              | 각인                 |                                                                                                                                                                                  |
| Allocation (trait)             | 배분                 | values reuse §2                                                                                                                                                                  |
| structure vocabulary values    | see traits.json      | Orbit Ribbons 궤도 리본 · Time Chords 시간 화음 · Harmonic Weave 조화 직조 · Tangent Caustics 접선 커스틱 · Stipple Constellation 점묘 별자리 · Nebula Veil 성운 베일            |
| Collection DNA (gallery strip) | 컬렉션 DNA           |                                                                                                                                                                                  |
| quick view                     | 빠른 보기            |                                                                                                                                                                                  |
| spectral sweep (video)         | 스펙트럼 스윕        |                                                                                                                                                                                  |

## 4. Keep in English (영문 유지)

Never translated or transliterated, in any surface. Latin tokens take Korean particles
directly, chosen by how the token is pronounced (style guide §3): ETH를, CST가, NFT를,
Arbitrum에서, Cosmic Signature가.

- **Brands/products:** Cosmic Signature, Random Walk NFT, Protocol Guild, Arbitrum,
  Arbitrum One, Ethereum¹, Uniswap, Axiom Zero, Chaos Zero, MetaMask, WalletConnect,
  Coinbase Wallet, Safe, GitHub, Discord, X (Twitter), Arbiscan
- **Tokens/tickers:** ETH, CST, NFT, ERC-20, ERC-721
- **Licenses/standards:** CC0, CC0 1.0, BCP 47
- **Technical identifiers:** SHA3-256, SHA-256, OKLab, AgX, OpenSimplex, H.265, PNG, RNG,
  Yoshida (4th-order Yoshida symplectic integrator → 4차 요시다 심플렉틱 적분기), Borda
  (보르다 집계), API, UTC
- **Language names in the switcher:** English stays "English", 中文 stays "中文",
  Українська stays "Українська", Korean stays "한국어"

¹ Ethereum: **이더리움** is the established Korean spelling and is used in prose; the
ticker stays ETH.

## 5. Banned Korean terms (금지 어휘)

Mirrors the English banned list (`scripts/lexicon-scan-core.ts`) with the same scope,
extended only with Korean vocabulary that carries the banned flavor. Korean compounds
join without spaces (재투자, NFT민팅), so the scanner matches these as substrings. As in
English, the **only** sanctioned exception is FAQ/legal _denial_ copy inside
`lexicon-allow` pragmas (TS) or `\uXXXX` escapes (JSON), e.g. "이것은 복권도, 도박도
아닙니다".

| Banned (금지)                                                 | Concept               | Use instead (대신)                       |
| ------------------------------------------------------------- | --------------------- | ---------------------------------------- |
| 경매, 입찰, 낙찰, 옥션, 비드, 비딩, 더치 옥션                 | bid / auction         | 제스처 / 보정 구간                       |
| 상금, 경품, 잭팟, 대박, 당첨금                                | prize / jackpot       | 배분                                     |
| 당첨, 승자, 우승                                              | winner                | 수령자                                   |
| 추첨, 복권, 로또, 뽑기, 응모                                  | lottery / raffle      | 별빛 선정                                |
| 도박, 베팅, 배팅, 카지노, 갬블, 사행, 판돈, 배당              | gambling / bet / odds | denial copy only                         |
| 행운, 럭키, 찬스                                              | luck flavor           | 배분을 받다 / 별빛 선정                  |
| 티켓, 참가권                                                  | ticket                | 별빛 선정 자격                           |
| 게임, 게이머, 플레이어, 승부, 경쟁, 대회, 토너먼트, 콘테스트  | game / play(er)       | 프로토콜 / 참여자 / 메커니즘             |
| 투자, 재테크, 수익, 이익, 이윤, 소득, 수입, 이자율, 이자 수익 | invest / yield        | 앵커링 지급 (for the mechanic)           |
| 면세, 세금 공제                                               | tax-deductible        | denial copy only                         |
| 존버, 가즈아, 떡상                                            | crypto slang          | —                                        |
| 스테이킹, 예치, 락업                                          | staking               | 앵커링                                   |
| 민팅, 민트, 채굴                                              | mint / mining         | 각인                                     |
| 인출, 출금, 클레임, 캐시아웃, 현금화, 페이아웃                | withdraw / claim      | 회수                                     |
| 자선, 기부, 후원, 모금, 도네이션                              | charity / donation    | 공공재 기여 (denial copy only otherwise) |
| 다오                                                          | DAO                   | 우주 평의회                              |
| 마케팅                                                        | marketing             | 홍보                                     |
| 라운드, 회차                                                  | round                 | 사이클 / 사이클 N                        |

Style-level cautions (not scanner-banned, reviewer judgment): 보상 / 리워드 ("reward" —
sanctioned in English but keep it for _reward_ only, never for _allocation_; the
terminology gate flags 리워드), 내기 (a bet — not scanned because 보내기 "send" contains
it; never use it in the betting sense), 호가 (asking price — not scanned because 번호가
contains it), 시합 (a match — not scanned because 표시합니다 contains it), 확률 (fine for
_probability_, never for _odds_), 무료 (reframe), and any certainty-of-gain phrasing
(반드시 받게 됩니다) — legally dangerous. Words the scanner catches inside other words:
write 배경 rather than 백그라운드 (라운드), 불리한 결과 rather than 불이익 (이익), 손해 배상
rather than 보상금 (상금).

## 6. Change process (변경 절차)

1. Propose the change in a PR that edits this file: old term, new term, rationale,
   affected surfaces.
2. In the **same PR**, update every existing usage: search `messages/ko/**`,
   `content/**/text*.ko.ts`, `content/about/ko.ts`, and the legal `content/legal/*.ko.ts`
   copy modules for the old term.
3. A native-fluency reviewer approves the term; an engineer confirms the sweep is
   complete (`npm run terminology:check` and `npm run lexicon:scan` pass).
4. If the term is scanner-relevant (banned or replaces a banned concept), update
   `KO_BANNED_TERMS` in `scripts/lexicon-scan-core.ts` and the rules in
   `scripts/terminology/ko.ts` in the same PR.
