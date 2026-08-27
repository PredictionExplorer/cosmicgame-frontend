# Local game-state test harness

`scripts/harness` runs a complete local Cosmic Signature universe — the real
contracts on a local Hardhat chain, the real Go indexer and API, and this
frontend in **testing mode** — driven by a **director** process that makes
gestures, completes cycles, retrieves allocations, and anchors NFTs on a
wall-clock schedule. It exists so the frontend can be developed and tested
against every game state on demand, with zero mocks in the data path.

```
┌────────────────────── scripts/harness ──────────────────────┐
│  orchestrator (up/down)        director (scenarios)         │
│        │                            │ control API :8686     │
└────────┼────────────────────────────┼───────────────────────┘
         ▼                            ▼ gestures / finalize / time
  Hardhat node :8545  ◄────────────────┘
         │ events                ▲ RPC (writes via burner wallet)
         ▼                       │
   cg-etl ──► Postgres ──► apiserver :8099 ──► next dev :3000
                                        (proxied /api/cosmicgame)
```

## Prerequisites

- The two sibling repos, cloned next to this one (paths overridable):
  - `../Cosmic-Signature` (contracts, Hardhat) — or `COSMIC_CONTRACTS_DIR`
  - `../augur-explorer` (RWCG backend: indexer + API) — or `RWCG_BACKEND_DIR`
- Docker (for Postgres; the orchestrator starts Docker Desktop on macOS if
  it's not running)
- Go ≥ 1.26 (builds the backend binaries once; prebuilt `bin/` is reused)
- solc 0.8.34 via `solc-select` if the contracts repo has no compiled
  `artifacts/` yet (one-time compile)

CI pins both sibling repos in [`harness.lock.json`](../harness.lock.json);
local runs use your working copies as-is. Bumping the lock file is the
deliberate, reviewed way to adopt contract/backend changes.

## Quick start

```bash
npm run dev:testing        # boot everything + Next.js, stream logs, Ctrl-C stops all
```

First boot takes ~30–60 s (deploy, seeding, indexing). You get:

- the app at `http://localhost:3000` in testing mode, with the amber
  **Harness** panel (bottom-right) for scenario switching, one-shot gestures,
  finalization, pause/resume, and the burner-wallet persona switcher;
- a burner wallet that auto-connects — no MetaMask needed, personas are
  Hardhat's well-known dev accounts;
- ~8 backdated historical cycles (galleries, statistics, and history pages
  are populated with realistic past dates) and an `ambient` scenario making
  gestures at wall-clock speed.

Common variations:

```bash
npm run harness -- up --scenario final-ten          # boot pinned near the endgame
npm run harness -- up --pace fast --seed-cycles 2   # minimal, test-shaped world
npm run harness -- up --detach --no-frontend        # backend only, run `next dev` yourself
npm run harness -- down                             # stop everything (DB volume kept)
npm run harness -- reset                            # wipe + fresh universe
npm run harness -- status                           # process + director status
```

Driving a running stack:

```bash
npm run harness -- scenario gesture-battle   # switch the long-running behavior
npm run harness -- phase ready-to-finalize   # one-shot jump, then leave it alone
npm run harness -- gesture --as Lyra --kind cst -m "A small mark on the spiral."
npm run harness -- finalize
npm run harness -- pause / resume
```

## Scenarios

| Scenario                                                                                                                                           | Behavior                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `ambient` (default)                                                                                                                                | Endless organic activity: gestures with varied cadence and kinds, cycles finalize, allocations retrieved, anchoring turnover. |
| `opening-soon`, `waiting-first-gesture`, `live`, `approach`, `final-hour`, `final-ten`, `final-minute`, `ready-to-finalize`, `exclusivity-expired` | Pin the UI in one `lib/cycleState.ts` phase; the director re-drives the game whenever the phase drifts.                       |
| `gesture-battle`                                                                                                                                   | Two personas trade rapid gestures (chat/ticker stress).                                                                       |
| `attachments-showcase`                                                                                                                             | Fills the live cycle with ERC-20 and NFT attachments.                                                                         |
| `anchoring-heavy`                                                                                                                                  | Builds anchoring positions across personas, then ambient.                                                                     |
| `quiet`                                                                                                                                            | No automatic activity — you (or tests) drive everything.                                                                      |

## Paces

Game durations are reconfigured through owner setters between cycles:

| Pace             | Gesture extension | Initial countdown | Cycle feel                                |
| ---------------- | ----------------- | ----------------- | ----------------------------------------- |
| `demo` (default) | 90 s              | 6 min             | A full cycle plays out in minutes.        |
| `fast`           | 20 s              | 75 s              | Test-shaped; states reachable in seconds. |
| `realtime`       | 1 h               | 24 h              | Production-shaped timings.                |

**Wall-clock integrity:** the frontend compares on-chain timestamps against
`Date.now()`, so the harness never leaves the chain clock ahead of the wall
clock. Live states are reached with shortened durations, not forward time
warps; countdowns you see are real.

## Backdated history seeding

On every `up`, the chain's genesis clock starts N days in the past
(`--seed-cycles`, default 8; minimum 1). The director replays complete
cycles at a daily cadence — organic gesture gaps, occasional open
finalizations after the exclusivity window, partial retrievals, anchoring —
then advances the chain clock up to "now" and continues live. History pages
show realistic past dates.

The genesis cycle intentionally runs on the deployed **V1** game; after it
finalizes, the proxy is upgraded to **CosmicSignatureGameV2** (the version on
Arbitrum One — its reinitializer requires a completed first cycle, exactly
like production history). Gesture calls are V1/V2-adaptive, mirroring
`utils/cosmicGameContractCompat.ts`.

## Personas

Eight named participants (Nova, Lyra, Orion, Vega, Atlas, Callisto, Quasar,
Selene) map to Hardhat's public dev accounts #1–#9 (skipping #6, the Public
Goods recipient; #0 is the protocol owner). Each has a behavior profile
(CST/RandomWalk affinity, chattiness, tempo) and all activity is driven by a
seeded RNG (`HARNESS_RNG_SEED`) for reproducible runs.

## The harness in the test suite

`e2e/harness/harness.spec.ts` is a Playwright project that runs against the
harness on every `npm run test:e2e` (and alone via `npm run test:e2e:harness`):
real burner-wallet transactions, real indexer roundtrips, per-phase rendering,
and the full endgame. Design rules:

- One serial spec file — the game world is shared and mutable.
- No wall-clock guessing: specs wait on the control API (chain state) and on
  `awaitIndexed` (backend API state) before asserting UI.
- Setup reuses a healthy running stack (pinning it to `quiet` and restoring
  your scenario afterwards) or boots a dedicated one on port 3100 and tears
  it down.
- CI runs it as the `harness-e2e` job with sibling repos pinned by
  `harness.lock.json`; the mocked-API e2e job sets `HARNESS_E2E=0`.

## Environment knobs

| Variable                                                                                                    | Default                                    | Purpose                                            |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------- |
| `COSMIC_CONTRACTS_DIR` / `RWCG_BACKEND_DIR`                                                                 | `../Cosmic-Signature`, `../augur-explorer` | Sibling repo locations                             |
| `HARNESS_CHAIN_PORT` / `HARNESS_DB_PORT` / `HARNESS_API_PORT` / `HARNESS_WEB_PORT` / `HARNESS_CONTROL_PORT` | 8545 / 55432 / 8099 / 3000 / 8686          | Ports                                              |
| `HARNESS_RNG_SEED`                                                                                          | fixed                                      | Deterministic persona activity                     |
| `HARNESS_COMPOSE_PROJECT`                                                                                   | `cosmic-harness`                           | Docker Compose namespace                           |
| `HARNESS_E2E`                                                                                               | `1`                                        | Set `0` to exclude the harness Playwright projects |

The orchestrator injects the frontend env (`NEXT_PUBLIC_NETWORK=local`, local
RPC/API URLs, `NEXT_PUBLIC_HARNESS=1`) into its `next dev` child — your
`.env.local` is untouched, and the harness dev server uses a separate Next
dist dir (`.harness/next`), so a regular `npm run dev` can coexist.

## Troubleshooting

- **Logs** live in `.harness/logs/` (`chain`, `deploy`, `upgrade`, `db`,
  `indexer`, `api`, `director`, `web`). The indexer additionally writes its
  own files under `~/ae_logs/`.
- **"A harness stack appears to be running already"** — `npm run harness -- down`
  (or `status` to inspect).
- **Gesture/finalize selector errors after a contracts-repo update** — the
  deployed game's ABI drifted from `contracts/*.json`. Pin the contracts repo
  to the ref in `harness.lock.json`, or refresh the frontend ABIs.
- **Docker not running** — the orchestrator starts Docker Desktop on macOS
  and waits; elsewhere start the daemon manually.
- **Fresh universe wanted** — `npm run harness -- reset` (wipes the DB volume;
  the chain is in-memory and always fresh per `up`).

## Relationship to `NEXT_PUBLIC_UX_SCENARIO`

The lightweight client-side mock (`lib/uxCycleScenarios.ts`,
`?uxScenario=final-ten`) still exists for quick pixel work without any
infrastructure. The harness is the source of truth for real end-to-end
behavior; the orchestrator clears `NEXT_PUBLIC_UX_SCENARIO` in testing mode
so the two never fight.
