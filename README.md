# Cosmic Signature Frontend

The web frontend for Cosmic Signature — a procedural on-chain art protocol on Arbitrum. Participants make gestures during Performance Cycles, explore deterministic three-body NFT art, anchor tokens, and review protocol allocations.

The app serves two hosts from one codebase: the marketing site (`cosmicsignature.com`) and the live dApp (`app.cosmicsignature.com`). Host routing lives in `proxy.ts`; the marketing shell deliberately excludes the Web3 stack to keep its bundle small.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript 5.9 (strict)
- **UI:** React 19, Tailwind CSS v4, Radix UI primitives (shadcn-style components in `components/ui/`), Framer Motion, lucide-react icons
- **Web3:** wagmi v3, viem v2, RainbowKit v2; typed ABIs generated with `@wagmi/cli`
- **Data:** TanStack React Query v5 for all data fetching, Axios for HTTP, Zod for runtime API validation
- **Charts:** Recharts
- **3D / effects:** three.js + react-three-fiber (marketing hero), tsparticles (app backdrop, idle-deferred)
- **Testing:** Jest + React Testing Library (unit), Playwright (E2E), jest-axe / axe-core (a11y)
- **Quality:** ESLint 9 (flat config), Prettier, Husky, lint-staged, commitlint, Sentry

## Prerequisites

- Node.js 20+ (see `.nvmrc`)
- npm 10+ (bundled with Node)
- A Web3 wallet (e.g. MetaMask) for blockchain features

## Getting Started

1. **Clone and install:**

   ```bash
   git clone <repo-url>
   cd cosmicgame-frontend
   npm ci
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your values (see [Environment Variables](#environment-variables)).

3. **Start development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. **Production build:**

   ```bash
   npm run build
   npm run start
   ```

## Scripts

| Script                       | Description                                                              |
| ---------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`                | Start development server                                                 |
| `npm run dev:testing`        | Boot the full local game harness + app in testing mode (docs/harness.md) |
| `npm run harness`            | Harness CLI: `up`, `down`, `status`, `scenario`, `phase`, `pace`, …      |
| `npm run build`              | Create production build                                                  |
| `npm run start`              | Run production server                                                    |
| `npm run lint`               | Run ESLint (zero warnings allowed)                                       |
| `npm run type-check`         | Run the TypeScript compiler without emitting                             |
| `npm run test`               | Run unit tests (Jest)                                                    |
| `npm run test:coverage`      | Run unit tests with coverage report                                      |
| `npm run test:seo`           | Run the SEO test subset (unit + raw-HTML e2e)                            |
| `npm run test:e2e`           | Run end-to-end tests (Playwright), including the harness tier            |
| `npm run test:e2e:harness`   | Run only the full-stack harness e2e tier (real chain + indexer)          |
| `npm run test:e2e:locales`   | Run every locale's smoke/QA suites plus routing, a11y, and wallet E2E    |
| `npm run test:e2e:ui`        | Run E2E tests with Playwright UI                                         |
| `npm run test:e2e:headed`    | Run E2E tests in headed browser                                          |
| `npm run analyze`            | Production build with bundle analyzer                                    |
| `npm run bundle:budget`      | Check full app-home initial JS gzip payload against budget (post-build)  |
| `npm run contracts:generate` | Regenerate typed ABIs from `contracts/*.json`                            |
| `npm run lexicon:scan`       | Enforce the banned-vocabulary lexicon in every locale's copy             |
| `npm run i18n:parity`        | Per-locale catalog report (translated %, values identical to English)    |
| `npm run i18n:strict`        | CI gate: key parity, ICU syntax, placeholders, plural categories         |
| `npm run terminology:check`  | Glossary drift gate for every translated locale                          |
| `npm run i18n:check`         | `i18n:strict` + `terminology:check` + `lexicon:scan` (pre-push runs it)  |
| `npm run white-paper:pdf`    | Regenerate the per-locale white-paper PDFs (pandoc + tectonic)           |

## Environment Variables

| Variable                               | Required      | Default             | Description                                           |
| -------------------------------------- | ------------- | ------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_NETWORK`                  | No            | `sepolia`           | Network: `local`, `sepolia`, or `mainnet`             |
| `NEXT_PUBLIC_INFURA_KEY`               | Yes (mainnet) | —                   | Infura API key for Arbitrum mainnet RPC               |
| `NEXT_PUBLIC_RPC_URL`                  | No            | Per-network default | Override the RPC endpoint                             |
| `NEXT_PUBLIC_API_URL`                  | No            | Per-network default | Backend API URL (must include `/api/cosmicgame`)      |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes           | —                   | WalletConnect project ID from cloud.walletconnect.com |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID`       | No            | —                   | Google Analytics 4 measurement ID                     |
| `NEXT_PUBLIC_SENTRY_DSN`               | No            | —                   | Sentry DSN for error reporting                        |
| `COSMICGAME_API_UPSTREAM`              | No            | —                   | Enables same-origin `/api/cosmicgame/*` proxying      |

## Project Structure

```
├── app/              Next.js App Router pages, layouts, API routes, OG images
├── components/
│   ├── ui/           Design system (Radix wrappers: button, card, tooltip, skeleton, ...)
│   ├── common/       Shared game UI (ConnectWalletButton, GestureStatus, Allocation)
│   ├── home/         Homepage sections (observatory/ control desk: CycleClock,
│   │                 participant intel, GesturePanel, AllocationLedger, ActionDock)
│   ├── layout/       Header, Footer, ErrorBoundary
│   ├── nft/          NFT display (NFTTrait, NFTImage, LatestNFTs, grids)
│   ├── anchoring/    Anchoring (staking) tables and actions
│   ├── attachments/  Attached NFT / ERC-20 showcases
│   ├── tables/       Data tables (gestures, allocations, recipients, ...)
│   ├── landing-v2/   Marketing-site sections
│   └── statistics/   Protocol statistics views
├── config/           App configuration (wagmi, networks, chains, constants, nav)
├── contexts/         React context providers (contract addresses, API data, system mode)
├── contracts/        Solidity ABI JSON files + generated typed ABIs (generated.ts, abis.ts)
├── content/          Typed page copy (landing, learn articles, statistics copy)
├── e2e/              Playwright end-to-end test specs
├── hooks/            Custom React hooks (contract interactions, React Query API hooks)
├── lib/              Fonts, host routing, SEO routes, utilities
├── public/           Static assets (fonts, images)
├── scripts/          CLI tooling (bundle budget, lexicon scan, IndexNow)
├── services/api/     API client with typed domain modules (rounds, tokens, anchoring, ...)
├── styles/           Global CSS, design tokens, typography
└── utils/            Utility modules (format, urls, errors, seo, jsonLd)
```

## Architecture

- **Data fetching:** All backend reads go through React Query hooks in `hooks/useApiQuery.ts` (caching, polling, focus refetch). The HTTP layer in `services/api/` uses Axios with an envelope-validating interceptor; list endpoints accept an optional `ApiPageWindow` for server-side pagination (`pagedPath` in `services/api/client.ts`).
- **Contracts:** ABIs are generated into `contracts/generated.ts` via `npm run contracts:generate` (wagmi CLI). `contracts/abis.ts` re-exports them widened to viem's `Abi` for existing call sites; import from `contracts/generated` for fully literal types.
- **Live updates:** `hooks/useLiveGameDataRefresh.ts` watches the on-chain `BidPlaced` event, invalidates live queries, and dispatches a `cosmic:gesture-placed` window event that drives UI pulses (gesture chat, latest-gesture ticker).
- **Gesture Message Chat:** The home-page chat panel is current-cycle scoped and reuses `useGestureListByCycle(round, 'desc')`; see `docs/gesture-message-chat.md`.
- **Error handling:** Errors are reported to Sentry via `utils/errors.ts`. Wallet errors use `isUserRejection()` to silently handle user-cancelled transactions.
- **SEO:** Per-page metadata via `createMetadata()` (`utils/seo.ts`), JSON-LD via `utils/jsonLd.tsx`, host-aware sitemap/robots, dynamic OG images.
- **State:** Wallet state via wagmi, server state via React Query, shared app state via React contexts.

## Networks

The app supports three networks configured in `config/networks.ts`:

- **local** — Local Hardhat node (chain ID 31337)
- **sepolia** — Arbitrum Sepolia testnet (chain ID 421614)
- **mainnet** — Arbitrum One (chain ID 42161)

Contract addresses come from the backend dashboard API at runtime (`contexts/ContractAddressesContext.tsx`). Switch networks via the `NEXT_PUBLIC_NETWORK` env var.

## Development

### Linting

```bash
npm run lint
```

ESLint uses the modern flat config format (`eslint.config.mjs`) with `eslint-config-next/core-web-vitals`, strict TypeScript rules, and import ordering. The repo enforces zero warnings.

### Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint. All commit messages must follow the format:

```
type(scope): description
```

Common types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `ci`.

### Dependencies

The project installs with npm only (`packageManager` pins it; npm ignores a `resolutions` field, so pins belong in `overrides`). npm's default peer-dependency semantics apply: do not reintroduce `legacy-peer-deps` or `--force`; a genuine peer mismatch is settled with a targeted override, as below.

```bash
npm run deps:audit
```

`deps:audit` runs on pre-push and in CI and fails when any of the following holds:

- an advisory is reachable from a production dependency, at any severity;
- a high or critical advisory is reachable anywhere, including development tooling (moderate and low tooling advisories are printed, not blocking);
- the lockfile violates a declared range (`npm ls --all` reports `invalid` or `missing`);
- a nested override that names a root dependency drifts from the root's spec.

There is no standing list of accepted advisories. Fix them in this order, and stop at the first step that works:

1. `npm update <package>` — when the patched release is inside the range the consumer already declares. This is the whole fix most of the time.
2. Bump the consuming package — when a newer release of the consumer declares a patched range.
3. Pin in `overrides` — only when the consumer pins the vulnerable version itself. Add a row to the table below so the pin can be retired when upstream catches up.
4. `audit-exceptions.json` at the repo root — last resort, when no patched release exists anywhere. The file does not exist while the tree is clean. Each entry needs `id`, `package`, `reason`, and `expires` (a calendar date at most 90 days out for tooling, 30 for production scope); expired, stale, or mistyped entries fail the gate, so the list cannot rot.

```json
[
  {
    "id": "GHSA-xxxx-xxxx-xxxx",
    "package": "some-tool",
    "reason": "Reached only through the e2e runner; upstream fix is in review at <link>.",
    "expires": "2026-10-01"
  }
]
```

Every override is a debt with a reason and a retirement condition:

| Override                         | Why it exists                                                                                                                                     | Retire when                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `@noble/hashes`                  | Dedupes the wallet stack onto one copy; `@base-org/account` and `@walletconnect/relay-auth` pin older 1.x releases that would otherwise nest.     | Both consumers declare a range that meets at one version.         |
| `axios`                          | `@coinbase/cdp-sdk` (via `@base-org/account`) pins `axios@1.16.0` exactly, which carries a high advisory; the app's own axios is already patched. | `@coinbase/cdp-sdk` declares a patched axios range.               |
| `@rainbow-me/rainbowkit > wagmi` | RainbowKit 2.x declares `wagmi@^2.9.0` as a peer and the app runs wagmi 3; the override repeats the root spec so npm places one wagmi.            | RainbowKit publishes a release whose peer range includes wagmi 3. |

### Testing

Unit tests use Jest with React Testing Library. E2E tests use Playwright against Desktop Chrome and Mobile Chrome viewports, plus a full-stack **harness tier** that runs the real contracts on a local chain with the real indexer/API (see [docs/harness.md](docs/harness.md)).

```bash
npm run test              # unit tests
npm run test:coverage     # unit tests with coverage
npm run test:e2e          # end-to-end tests (mocked-API projects + harness tier)
npm run test:e2e:harness  # harness tier only
```

### Local game-state harness (testing mode)

`npm run dev:testing` boots a complete local Cosmic Signature universe — Hardhat chain, deployed contracts, the Go indexer + API, a scenario "director" with a controlled virtual clock, and this app in testing mode with a burner wallet and an in-app control panel. Named scenarios put the real chain and UI in any cycle phase on demand. Full guide: [docs/harness.md](docs/harness.md).
