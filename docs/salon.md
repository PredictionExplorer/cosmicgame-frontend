# The Salon (V4 art auction)

The Salon is the site's surface for the V4 `CosmicSignatureArtAuction`
contract: when a Performance Cycle finalizes, the protocol imprints extra
Signature NFTs and places each one on an open English auction. This document
explains the contract's rules, how the frontend implements them, and how to
exercise every flow on a local chain.

> **Vocabulary.** The site never uses gambling-adjacent words, so the feature
> is written entirely in coined terms. This table is the translation layer
> between the UI/code and the Solidity:
>
> | Site term            | Contract term                      |
> | -------------------- | ---------------------------------- |
> | Salon                | `CosmicSignatureArtAuction`        |
> | lot                  | one auctioned NFT (`nftId`)        |
> | exhibit              | per-round batch (`NFTS_PER_BATCH`) |
> | offer                | bid                                |
> | patron (leading)     | bidder (`highestBidder`)           |
> | minimum next offer   | `minimumNextBid(nftId)`            |
> | conclude             | `settle(nftId)`                    |
> | retrieve (the piece) | `claimNft(nftId, recipient)`       |
> | returned offers      | refund credits (`refundCredits`)   |
> | cycle                | round                              |
>
> The same renaming exists per locale (zh 沙龙/报价, ja サロン/オファー,
> ko 살롱/오퍼, uk Салон/пропозиція, vi salon/chào giá); each locale's banned
> stems are machine-checked by `npm run lexicon:scan`.

## How the auction works (contract rules)

- **Registration.** Each finalized cycle registers a batch of
  `NFTS_PER_BATCH` (8) freshly imprinted Signatures. Lots are independent:
  each has its own clock and its own offers.
- **Opening.** A lot accepts offers only after `ELIGIBILITY_DELAY` (7 days)
  past its cycle's finalization. Before that the UI shows it as _upcoming_.
- **The clock starts at the first offer.** A lot has no deadline until
  someone makes an offer; the first offer starts the `AUCTION_DURATION`
  (48 h) window. An untouched lot stays open indefinitely — the UI phase is
  _awaiting the first offer_, and such a lot can never be concluded
  (`settle` reverts with `AuctionNotStarted`).
- **Raising.** Every offer must reach `minimumNextBid`: the cycle's opening
  amount when there are no offers yet, otherwise the leading offer plus
  one tenth (`MINIMUM_INCREASE_DIVISOR = 10`), rounded up.
- **Anti-sniping.** An offer landing near the close pushes the deadline out
  so at least `EXTENSION_DURATION` (10 min) remains.
- **Exact funding rule.** `bid(nftId, totalBidAmount)` is payable and strict
  about `msg.value`: a new patron sends the full total; the _current leader_
  raising their own offer sends only the difference
  (`total − previousOffer`). Anything else reverts with
  `IncorrectBidFunding`. Outbid patrons are not paid back inline — their
  ETH becomes a refund credit.
- **Conclusion.** After the window closes, _anyone_ may call `settle`. The
  proceeds strengthen the next cycle's allocation; the piece waits for the
  recipient.
- **Retrieval.** Only the final leading patron may `claimNft`, to any
  recipient address. Refund credits are withdrawn separately with
  `withdrawRefund(recipient)` at any time.

## Frontend architecture

Everything lives in three hooks plus one route; there is **no backend/API
dependency for auction state** — all of it is read from the chain.

| Piece                                                                     | Role                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks/useSalonContract.ts`                                               | Discovers the salon's address by calling `artAuction()` **on the game proxy itself** (the dashboard API does not publish it). On a V3 chain the getter is missing and the hook settles on "absent"; transport errors are retried, never cached as absence.                                                                                      |
| `hooks/useSalonLots.ts`                                                   | Reads every registered batch → `getAuction` + `minimumNextBid` per lot (multicall where available), grouped per cycle, polled every 12 s. Also reads the latest block timestamp and exposes the chain-vs-wall clock skew: **lot phases are judged on block time**, which matters on warped local chains and costs one `getBlock` in production. |
| `hooks/useSalonActions.ts`                                                | The four writes (offer, conclude, retrieve piece, withdraw returned offers) through the house `useTxFlow` path: chain guard → trusted-target check → simulation with decoded custom errors → write → receipt → toast. Before an offer it re-reads the lot and applies the exact funding rule above.                                             |
| `app/[locale]/(app)/salon/`                                               | The page: terms line rendered from live contract constants, a returned-offers strip when the connected wallet has credits, one section per cycle, one card per lot with phase-appropriate actions.                                                                                                                                              |
| `lib/writeTargets.ts`                                                     | `artAuction` joined `PROTOCOL_ADDRESS_GETTERS`, so the salon address is part of the on-chain trusted-target set that every write is checked against. Missing getters are skipped, keeping V3 chains working.                                                                                                                                    |
| `contracts/CosmicSignatureArtAuction.json`, `contracts/CosmicGameV4.json` | The auction ABI and the V4-only game fragment (folded into `CosmicGame.json` when V4 ships).                                                                                                                                                                                                                                                    |

A lot's phase is pure and unit-tested (`salonLotPhase`): `retrieved` →
`awaitingRetrieval` → `upcoming` → `awaitingFirstOffer` → `open` →
`concludable`.

Contract custom errors surface as friendly copy: `BidTooLow` /
`IncorrectBidFunding` → "offers moved" (someone outbid between render and
send), `AuctionEnded` / `AuctionAlreadySettled` → "lot closed",
`AuctionNotEligible` → "lot not open".

## Using it

The page is `/salon` (header link next to Gallery, footer under
Participate). Reading needs no wallet; placing an offer, concluding a lot,
or retrieving needs a connected wallet on the game's network.

- **Place an offer** on any lot that is open or awaiting its first offer:
  enter a total offer ≥ the shown minimum. If you are already leading, the
  form raises your own offer and your wallet only sends the difference.
- **Returned offers**: when someone outbids you, a strip appears at the top
  of the page with your credit and a retrieve button.
- **Conclude** appears on any closed lot — anyone may press it.
- **Retrieve the piece** appears on a concluded lot for its leading patron.

## Testing locally

Against a populated hardhat chain (`NEXT_PUBLIC_NETWORK=local`,
RPC `http://localhost:8545`, chain ID 31337):

1. Point MetaMask at the local RPC and import hardhat account keys.
2. Lots awaiting their first offer accept the cycle's opening amount
   (0.001 ETH in the populate script); the first offer starts the 48 h
   clock.
3. Offer from a second account to test outbidding and the returned-offers
   strip on the first.
4. To test **conclude**, advance chain time past the close:
   `await network.provider.send('evm_increaseTime', [172800])` plus a mine.
5. The populate script leaves ready-made states: a retrieved lot, and a
   concluded lot whose leading patron (hardhat account #4) can test
   retrieval.

Two local-chain quirks the page already accounts for: blocks mine on an
interval (confirmation toasts take a beat), and populate warps chain time
days ahead of wall time — phases follow block time, so the UI and the
contract always agree.

## On a V3 chain

The game proxy has no `artAuction()` getter, the discovery hook reports the
salon as absent, and the page shows a dedicated empty state. Nothing else
on the site changes, so the branch is safe to deploy ahead of the V4
contracts.
