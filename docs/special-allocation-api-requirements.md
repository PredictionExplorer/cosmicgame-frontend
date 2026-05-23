# Special Allocation API Requirements

## Purpose

The frontend currently displays live special-allocation leaders from:

```text
GET /bid/current_special_winners
```

The endpoint is accurate for the fields it returns today, and those fields match direct contract reads for the live deployment. However, the current payload is not sufficient to reproduce all contract-equivalent live status and countdown metrics for Chrono-Warrior.

This document defines the API fields needed to display Last Participant, Endurance Champion, Chrono-Warrior, and Final CST Gesture correctly without unsafe frontend inference.

## Current API Shape

Today the frontend receives:

```ts
interface CurrentSpecialWinners {
  EnduranceChampionAddress?: string;
  EnduranceChampionDuration?: number;
  ChronoWarriorAddress?: string;
  ChronoWarriorDuration?: number;
  LastBidderAddress?: string;
  LastBidderLastBidTime?: number;
  LastCstBidderAddress?: string;
}
```

This is enough to display:

- Latest/Last Participant address.
- Latest/Last Participant current hold: `now - LastBidderLastBidTime`.
- Endurance Champion address and stored duration.
- Endurance Champion live duration only when the latest hold has strictly exceeded `EnduranceChampionDuration`.
- Chrono-Warrior address and current source duration exactly as returned by the API.
- Final CST Gesture address.

This is not enough to safely display:

- Whether Chrono-Warrior is truly growing right now.
- When Chrono-Warrior will start growing.
- When a currently growing Chrono-Warrior segment will stop.
- The current Chrono-Warrior reign segment duration.
- The age or gesture link for the Final CST Gesture.

## Contract Semantics

The deployed contract computes current champions in `tryGetCurrentChampions()`.

Endurance Champion is based on the latest single last-bidder window:

```text
lastBidDuration = block.timestamp - biddersInfo[roundNum][lastBidderAddress].lastBidTimeStamp

if lastBidDuration > enduranceChampionDuration:
  current endurance champion = lastBidderAddress
  current endurance duration = lastBidDuration
```

Chrono-Warrior is based on continuous time as Endurance Champion:

```text
chronoStart = enduranceChampionStartTimeStamp + prevEnduranceChampionDuration
chronoDuration = block.timestamp - chronoStart

if chronoDuration > chronoWarriorDuration:
  current chrono warrior = current endurance champion
  current chrono duration = chronoDuration
```

The key point: `ChronoWarriorAddress === EnduranceChampionAddress` does not prove that Chrono-Warrior is growing. The frontend also needs the current Chrono segment start and a source timestamp.

## Required API Additions

Add these fields to `GET /bid/current_special_winners`.

```ts
interface CurrentSpecialWinnersV2 {
  EnduranceChampionAddress: string;
  EnduranceChampionDuration: number;
  EnduranceChampionStartTimeStamp: number;
  PrevEnduranceChampionDuration: number;

  ChronoWarriorAddress: string;
  ChronoWarriorDuration: number;
  ChronoWarriorIsLive: boolean;

  LastBidderAddress: string;
  LastBidderLastBidTime: number;

  LastCstBidderAddress: string;
  LastCstBidderLastBidTime?: number;
  LastCstBidEventLogId?: number;

  RoundNum: number;
  SourceBlockNumber?: number;
  SourceBlockTimeStamp: number;
}
```

### Required Fields

- `EnduranceChampionStartTimeStamp`: contract storage value.
- `PrevEnduranceChampionDuration`: contract storage value.
- `SourceBlockTimeStamp`: block timestamp or backend timestamp used to compute the returned values.
- `ChronoWarriorIsLive`: backend-computed boolean using the same condition as `tryGetCurrentChampions()`.

### Optional But Useful Fields

- `SourceBlockNumber`: useful for debugging and parity checks.
- `LastCstBidderLastBidTime`: enables `Last CST gesture age`.
- `LastCstBidEventLogId`: enables a link to the actual gesture record.

## Backend Computation

The safest backend implementation is:

1. Read `tryGetCurrentChampions()` for:
   - `EnduranceChampionAddress`
   - `EnduranceChampionDuration`
   - `ChronoWarriorAddress`
   - `ChronoWarriorDuration`
2. Read public storage:
   - `enduranceChampionStartTimeStamp`
   - `prevEnduranceChampionDuration`
   - `lastBidderAddress`
   - `lastCstBidderAddress`
   - `roundNum`
3. Read `biddersInfo(roundNum, lastBidderAddress).lastBidTimeStamp`.
4. Use a single source timestamp from the same chain read context.
5. Compute:

```text
chronoSegmentStart =
  EnduranceChampionStartTimeStamp + PrevEnduranceChampionDuration

currentChronoSegmentDuration =
  SourceBlockTimeStamp - chronoSegmentStart

ChronoWarriorIsLive =
  currentChronoSegmentDuration > storedChronoWarriorDuration
```

If the backend uses `tryGetCurrentChampions()` for `ChronoWarriorDuration`, keep a separate internal `storedChronoWarriorDuration` or compute live status by checking whether:

```text
ChronoWarriorAddress == EnduranceChampionAddress
and ChronoWarriorDuration == currentChronoSegmentDuration
and currentChronoSegmentDuration > storedChronoWarriorDuration
```

Prefer exposing `ChronoWarriorIsLive` directly to avoid repeating subtle contract logic in the frontend.

## Frontend Metrics Enabled By V2

### Latest Participant

Already possible today:

```text
currentHold = now - LastBidderLastBidTime
beatsEnduranceIn = EnduranceChampionDuration + 1 - currentHold
```

Display:

- `Current hold`
- `Beats Endurance in X`
- `Extending Endurance by X`

### Endurance Champion

Already mostly possible today:

```text
latestHold = now - LastBidderLastBidTime
isEnduranceLive =
  LastBidderAddress == EnduranceChampionAddress
  and latestHold > EnduranceChampionDuration
```

V2 additionally enables:

- `Record segment started`
- clearer explanation of same-wallet segment resets.

### Chrono-Warrior

Requires V2 fields:

```text
chronoSegmentStart =
  EnduranceChampionStartTimeStamp + PrevEnduranceChampionDuration

currentChronoSegmentDuration =
  now - chronoSegmentStart
```

Display:

- `Growing now` if `ChronoWarriorIsLive` is true.
- `Starts growing in X` if the current segment has not beaten `ChronoWarriorDuration`.
- `Will stop growing in X` if Chrono is live and the latest bidder is approaching an Endurance record transition that would close the current Chrono segment.
- `Current reign segment`.

### Final CST Gesture

Requires optional V2 fields for richer display:

- `Last CST gesture age` from `LastCstBidderLastBidTime`.
- Link to gesture detail from `LastCstBidEventLogId`.

## Answer To Current Feasibility

With the current API, the frontend cannot safely calculate all proposed Chrono-Warrior metrics.

It can display the current `ChronoWarriorAddress` and `ChronoWarriorDuration` exactly as supplied by the API. It cannot prove whether that duration is live-growing, when it will start growing, or when it will stop growing, because the payload does not include `EnduranceChampionStartTimeStamp`, `PrevEnduranceChampionDuration`, and a source timestamp.

Without adding these API fields, the only accurate way for the frontend to compute those richer Chrono-Warrior metrics is to read the blockchain directly. That would require direct reads of:

- `tryGetCurrentChampions()`
- `enduranceChampionStartTimeStamp()`
- `prevEnduranceChampionDuration()`
- `lastBidderAddress()`
- `lastCstBidderAddress()`
- `roundNum()`
- `biddersInfo(roundNum, lastBidderAddress)`
- the current block timestamp

The preferred architecture is to keep this logic in the backend API so the frontend has one source of truth and does not duplicate contract-specific edge cases.
