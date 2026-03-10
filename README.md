# Cosmic Signature Frontend

A Next.js web application for the Cosmic Signature blockchain game on Arbitrum. Players bid with ETH for a chance to win prizes, collect NFTs, and participate in staking and raffles.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript 5.9
- **UI:** React 19, MUI 7, Tailwind CSS v4
- **Web3:** wagmi v3, viem v2, RainbowKit v2, Porto (WebAuthn account abstraction)
- **Data:** TanStack React Query v5 for all data fetching, Axios via API proxy
- **Charts:** Kendo React Charts
- **Testing:** Jest (unit), Playwright (E2E)
- **Quality:** ESLint 9 (flat config), Prettier, Husky, lint-staged, commitlint

## Prerequisites

- Node.js 20+ (see `.nvmrc`)
- Yarn
- A Web3 wallet (e.g. MetaMask) for blockchain features

## Getting Started

1. **Clone and install:**

   ```bash
   git clone <repo-url>
   cd cosmicgame-frontend
   yarn install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your values (see [Environment Variables](#environment-variables)).

3. **Start development server:**

   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. **Production build:**

   ```bash
   yarn build
   yarn start
   ```

## Scripts

| Script                 | Description                         |
| ---------------------- | ----------------------------------- |
| `yarn dev`             | Start development server            |
| `yarn build`           | Create production build             |
| `yarn start`           | Run production server               |
| `yarn lint`            | Run ESLint                          |
| `yarn test`            | Run unit tests (Jest)               |
| `yarn test:coverage`   | Run unit tests with coverage report |
| `yarn test:e2e`        | Run end-to-end tests (Playwright)   |
| `yarn test:e2e:ui`     | Run E2E tests with Playwright UI    |
| `yarn test:e2e:headed` | Run E2E tests in headed browser     |

## Environment Variables

| Variable                               | Required      | Default             | Description                                                 |
| -------------------------------------- | ------------- | ------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_NETWORK`                  | No            | `sepolia`           | Network: `local`, `sepolia`, or `mainnet`                   |
| `NEXT_PUBLIC_INFURA_KEY`               | Yes (mainnet) | —                   | Infura API key for Arbitrum mainnet RPC                     |
| `NEXT_PUBLIC_RPC_URL`                  | No            | Per-network default | Override the RPC endpoint                                   |
| `NEXT_PUBLIC_API_URL`                  | No            | Per-network default | Override the backend API URL                                |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes           | —                   | WalletConnect project ID from cloud.walletconnect.com       |
| `PROXY_ALLOWED_HOSTS`                  | No            | —                   | Comma-separated extra hostnames for the API proxy allowlist |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID`       | No            | —                   | Google Analytics 4 measurement ID                           |
| `NEXT_PUBLIC_SENTRY_DSN`               | No            | —                   | Sentry DSN for error reporting                              |

## Project Structure

```
├── app/              Next.js App Router pages, layouts, and API routes
├── components/
│   ├── common/       Shared UI components (VideoPlayerDialog, BiddingStatus, etc.)
│   ├── donations/    Donation-related components
│   ├── home/         Homepage sections (DonatedTokensSection, WinningHistorySection)
│   ├── layout/       Header, Footer, ErrorBoundary
│   ├── nft/          NFT display (NFTTrait, NFTImage, LatestNFTs, PaginationGrid)
│   ├── staking/      Staking tables and actions
│   ├── styled/       MUI styled components
│   ├── tables/       Data tables (bidding, charity, raffle, etc.)
│   └── tokens/       Token-related components
├── config/           App configuration (wagmi, networks, constants, nav, styles)
├── contexts/         React context providers (API data, staking, system mode, notifications)
├── contracts/        Solidity ABI JSON files and typed ABI barrel
├── e2e/              Playwright end-to-end test specs
├── hooks/            Custom React hooks (contract interactions, Web3, React Query API hooks)
├── public/           Static assets (fonts, images)
├── services/api/     API client with typed domain modules (rounds, tokens, staking, etc.)
├── styles/           Global CSS
└── utils/            Utility modules (format, urls, wallet, endurance, errors, seo)
```

## Architecture

- **Data Fetching:** All API calls go through React Query hooks defined in `hooks/useApiQuery.ts`, providing automatic caching, background refetching, and deduplication. The API layer in `services/api/` handles HTTP requests via Axios.
- **Error Handling:** All errors are reported to Sentry via `utils/errors.ts`. Wallet errors use `isUserRejection()` to silently handle user-cancelled transactions.
- **SEO:** OpenGraph metadata is generated per-page using `createMetadata()` from `utils/seo.ts`.
- **State:** Wallet state via wagmi, server state via React Query, shared app state via React contexts.

## Networks

The app supports three networks configured in `config/networks.ts`:

- **local** — Local Hardhat node (chain ID 31337)
- **sepolia** — Arbitrum Sepolia testnet (chain ID 421614)
- **mainnet** — Arbitrum One (chain ID 42161)

Contract addresses are defined per-network. Switch networks via the `NEXT_PUBLIC_NETWORK` env var.

## Development

### Linting

```bash
yarn lint
```

ESLint uses the modern flat config format (`eslint.config.mjs`) with `eslint-config-next/core-web-vitals`, strict TypeScript rules, and import ordering.

### Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint. All commit messages must follow the format:

```
type(scope): description
```

Common types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `ci`.

### Testing

Unit tests use Jest with React Testing Library. E2E tests use Playwright against Desktop Chrome and Mobile Chrome viewports.

```bash
yarn test              # unit tests
yarn test:coverage     # unit tests with coverage
yarn test:e2e          # end-to-end tests
```
