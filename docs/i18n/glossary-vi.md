# Vietnamese Glossary (Tiếng Việt)

This is the **single source of truth** for how Cosmic Signature's coined vocabulary is
rendered in Vietnamese. Every translator and reviewer works with this file open. One
English term = one Vietnamese term, everywhere — a term that drifts between pages
breaks the product's voice and confuses users.

The English lexicon (machine-enforced in `scripts/lexicon-scan-core.ts`, run via
`npm run lexicon:scan`) is itself a deliberate transcreation layer: _bid_ became
**Gesture**, _raffle_ became **Stellar Selection**, _staking_ became **Anchoring**. The
Vietnamese must do the same job: carry an **art-performance register**, never a
gambling / gaming / investment register. Do not translate the underlying banned concept —
translate the coined term.

Machine enforcement for this locale: the banned register in §5 is
`LEXICON_PROFILES['vi']` in `scripts/lexicon-scan-core.ts`; the drift rules in
§2–§3 are `scripts/terminology/vi.ts` (run via `npm run terminology:check`);
mechanical conventions are `LOCALE_CONVENTIONS['vi']` in
`scripts/i18n-conventions-core.ts`.

> Status: **draft**. Freeze it with the locale's first release; afterwards amendments
> require the change process in §6 and must update all existing usages in the same PR.

---

## 1. Term formation rules

When a new English coinage appears, coin the Vietnamese with these rules:

1. **One or two words** for anything that must fit a button, nav item, or table header;
   the full form may be longer, but a short form must exist.
2. Draw from the **art / astronomy / craft register** — never from finance, gaming, or
   gambling registers.
3. Prefer established native terms over calques; a loanword is acceptable only where it
   is the established term in this language.
4. Test every candidate in three places before adopting: a button label, a full
   sentence, and its compounds (_Gesture_ must also work in _Gesture Cost_, _ETH gesture_,
   _Final Gesture_, _gesture count_).
5. Check the term's other meanings and collocations for unwanted flavors.
6. Established crypto terms are used where they are neutral (wallet, token, contract,
   transaction) and avoided where the English deliberately avoided them (staking, mint,
   claim, withdraw).

## 2. Core coinages — decisions with rationale

One subsection per coined term, in this order, each with the decision, the rationale,
a table of the English phrases it appears in, and the rejected alternatives:

### Gesture (was _bid_) →

### Performance Cycle (was _round_) →

### Finalize / Finalization →

### Calibration Window (was _Dutch auction_) →

### Allocation (was _prize_) →

### Recipient (was _winner_) →

### Stellar Selection (was _raffle_) →

### Anchoring (was _staking_) →

### Anchor Distribution (was _yield_) →

### Retrieve (was _withdraw/claim_) →

### Imprint (was _mint_) →

### Endurance Champion → ; Chrono-Warrior →

### Cosmic Council (was _DAO_) →

### Public Goods (was _charity/donation_) →

### Compounding Cycle Reserve →

### Signature (the artwork) →

## 3. General term table

| English | Tiếng Việt | Notes |
| ------- | ---------- | ----- |

### 3.1 Cosmic Signature trait vocabulary

## 4. Keep in English

Cosmic Signature, RandomWalk NFT, ETH, CST, NFT, Arbitrum, Protocol Guild, contract and
wallet addresses, transaction hashes.

## 5. Banned Vietnamese terms

The words this language actually uses for the banned concepts (auction / bid, prize /
winner, lottery / raffle, gambling, gaming / player, investment / yield / earnings,
staking, charity / donation, withdraw / claim, mint, marketing, round). Encode the list
in `LEXICON_PROFILES['vi']`.

## 6. Change process

1. Propose the change with the reason and the affected strings.
2. Update this glossary, the terminology pack, and every existing usage in the same PR.
3. `npm run i18n:check` must pass before merge.
