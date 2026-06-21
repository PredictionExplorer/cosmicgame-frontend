# Contract API Update Requirements

## Purpose

The Cosmic Signature protocol proxy on Arbitrum One now points to implementation
`0x50eB3d05d2C463949DE9238D419385594f7AdB97`. The frontend can read critical
values directly from the contract, but several user-facing screens still depend
on the Cosmic Game API for price, duration, address, and allocation data.

This document specifies API updates that may be necessary so the website remains
compatible with the upgraded contracts and does not infer dynamic on-chain state
from stale or static fields.

## Current Verification Snapshot

Direct Arbitrum RPC reads from the protocol proxy
`0x6a714Ae7B5b6eA520F6BCA23d2E609C4Fd5863F2` showed:

```text
EIP-1967 implementation slot:
0x50eB3d05d2C463949DE9238D419385594f7AdB97

getCstDutchAuctionDurations():
[43200, 589047]

cstDutchAuctionDuration():
43200

cstDutchAuctionDurationChangeDivisor():
250

getNextCstBidPrice():
0

getBidCstRewardAmount():
0
```

Two local ABI getters reverted against the upgraded proxy and should not be used
as primary API sources without further verification:

```text
cstRewardAmountForBidding()
cstDutchAuctionDurationDivisor()
bidCstRewardAmount()
```

Their replacement/safe read paths appear to be:

```text
getCstDutchAuctionDurations()
cstDutchAuctionDuration()
cstDutchAuctionDurationChangeDivisor()
getBidCstRewardAmount()
getBidCstRewardAmountAdvanced(int256)
```

## Endpoint: GET /bid/cst_price

### Current Frontend Usage

The frontend currently expects:

```ts
interface CTPriceInfo {
  AuctionDuration: string;
  CSTPrice: string;
  SecondsElapsed: string;
  [key: string]: unknown;
}
```

This endpoint feeds:

- The CST gesture method panel on the home page.
- The CST Calibration Window duration and elapsed time.
- The CST gesture button label.
- The CST price/free state used before sending `bidWithCst`.

### Required Backwards-Compatible Fields

Keep these existing fields, but ensure they are computed from the upgraded
contract:

```ts
interface CTPriceInfo {
  /** getCstDutchAuctionDurations()[0], decimal seconds */
  AuctionDuration: string;

  /** getNextCstBidPrice(), decimal wei */
  CSTPrice: string;

  /** getCstDutchAuctionDurations()[1], decimal seconds */
  SecondsElapsed: string;
}
```

The API must not hardcode `AuctionDuration` to old static values such as `3600`
or “roughly two days”. The current deployed contract reports `43200` seconds.

### Recommended New Fields

Add explicit fields so clients do not have to guess what the legacy names mean:

```ts
interface CTPriceInfoV2 extends CTPriceInfo {
  RoundNum: number;

  CstDutchAuctionDuration: string;
  CstDutchAuctionElapsedDuration: string;
  CstDutchAuctionDurationChangeDivisor: string;
  CstDutchAuctionBeginningTimeStamp?: string;

  NextCstBidPriceWei: string;
  ExpectedBidCstRewardAmountWei: string;
  ExpectedBidCstRewardAmountAdvancedWei?: string;

  IsCstGestureFree: boolean;
  SourceBlockNumber: number;
  SourceBlockTimeStamp: number;
  ProtocolProxyAddress: string;
  ImplementationAddress: string;
}
```

### Backend Read Source

Use the protocol proxy, not the implementation address, for runtime reads:

```text
getCstDutchAuctionDurations()
getNextCstBidPrice()
getBidCstRewardAmount()
getBidCstRewardAmountAdvanced(0)
cstDutchAuctionDuration()
cstDutchAuctionDurationChangeDivisor()
```

Avoid relying on:

```text
cstRewardAmountForBidding()
cstDutchAuctionDurationDivisor()
bidCstRewardAmount()
```

unless the verified upgraded ABI proves those selectors are valid and they do
not revert for the current proxy state.

### Acceptance Criteria

- `AuctionDuration` equals `getCstDutchAuctionDurations()[0]`.
- `SecondsElapsed` equals `getCstDutchAuctionDurations()[1]`.
- `CSTPrice` equals `getNextCstBidPrice()`.
- `ExpectedBidCstRewardAmountWei` equals `getBidCstRewardAmount()`.
- `IsCstGestureFree` is derived from contract-equivalent state and agrees with
  `CSTPrice === "0"` when the window has elapsed.
- All large integer values are decimal strings, not JavaScript numbers.
- The response includes block metadata so the frontend can show data freshness.

## Endpoint: GET /statistics/dashboard

### Current Frontend Usage

The dashboard response carries `ContractAddrs`, including:

```ts
interface ContractAddresses {
  CosmicGameAddr?: string;
  ImplementationAddr?: string;
  CosmicTokenAddr?: string;
  CosmicSignatureAddr?: string;
  RandomWalkAddr?: string;
  CosmicDaoAddr?: string;
  CharityWalletAddr?: string;
  PrizesWalletAddr?: string;
  StakingWalletCSTAddr?: string;
  StakingWalletRWalkAddr?: string;
  MarketingWalletAddr?: string;
}
```

The frontend currently overrides the displayed implementation address with a
static verified fact when the API lags. Runtime contract calls still use
`CosmicGameAddr` from the API.

### Required Updates

- `CosmicGameAddr` must be the proxy
  `0x6a714Ae7B5b6eA520F6BCA23d2E609C4Fd5863F2` on Arbitrum One.
- `ImplementationAddr` must be read from the EIP-1967 implementation slot and
  currently equal `0x50eB3d05d2C463949DE9238D419385594f7AdB97`.
- Include `ContractAddrsSourceBlockNumber` and
  `ContractAddrsSourceBlockTimeStamp` if possible.
- Remove or clearly deprecate stale static duration fields such as
  `RoundStartCSTAuctionLength` if they no longer represent the current dynamic
  contract value.

### Acceptance Criteria

- `/contracts` does not need to override stale API implementation data.
- The frontend can compare API contract addresses to the live proxy slot.
- Runtime writes never target a stale or non-proxy protocol address.

## Endpoint: Current Special Allocation Winners

The existing requirements for special allocation data are documented in
`docs/special-allocation-api-requirements.md`.

For this contract upgrade, confirm the endpoint still includes or adds:

```ts
interface CurrentSpecialWinnersV2 {
  LastCstBidderAddress: string;
  LastCstBidderLastBidTime?: number;
  LastCstBidEventLogId?: number;
  RoundNum: number;
  SourceBlockNumber?: number;
  SourceBlockTimeStamp: number;
}
```

These fields support the Final CST Gesture display and let the frontend avoid
deriving contract-sensitive state from unrelated dashboard timestamps.

## Optional Endpoint: GET /contracts/runtime_status

A small diagnostics endpoint would make production verification easier.

```ts
interface ContractRuntimeStatus {
  ChainId: number;
  ProtocolProxyAddress: string;
  ImplementationAddress: string;
  ImplementationMatchesExpected: boolean;

  CstDutchAuctionDuration: string;
  CstDutchAuctionElapsedDuration: string;
  NextCstBidPriceWei: string;
  ExpectedBidCstRewardAmountWei: string;

  SourceBlockNumber: number;
  SourceBlockTimeStamp: number;
}
```

This endpoint would power an operator-only or public “Live Contract Check” UI
and make ABI/API drift visible before users encounter failed transactions.

## Frontend Compatibility Notes

- The frontend should keep direct contract reads for transaction-critical values
  such as `getNextCstBidPrice()` and `getBidCstRewardAmount()`.
- The API should provide the same values for display and indexing, with source
  block metadata for freshness.
- The frontend should treat API values as display data unless they match the
  current contract read or are explicitly documented as indexed historical data.
- Tests should include non-static CST durations such as `43200`, not only `3600`.

## Backend Test Checklist

- Unit test `GET /bid/cst_price` against mocked contract reads where duration is
  `43200` and elapsed time is greater than duration.
- Unit test dynamic duration changes when `cstDutchAuctionDurationChangeDivisor`
  changes.
- Integration test dashboard `ImplementationAddr` against the EIP-1967 slot.
- Integration test `CSTPrice` against `getNextCstBidPrice()`.
- Integration test `ExpectedBidCstRewardAmountWei` against
  `getBidCstRewardAmount()`.
- Regression test that deprecated selectors which revert on the upgraded proxy
  are not required for successful API responses.
