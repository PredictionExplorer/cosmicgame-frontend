# Cosmic Signature Frontend

A Next.js web application for the Cosmic Signature blockchain game on Arbitrum. Players bid with ETH for a chance to win prizes, collect NFTs, and participate in staking and raffles.

## Tech Stack

- **Framework:** Next.js (Pages Router) with TypeScript
- **UI:** React 18, MUI 5, Emotion
- **Web3:** ethers.js v5, @web3-react (MetaMask, WalletConnect)
- **Data:** Axios via API proxy, polling-based updates
- **Charts:** Kendo React Charts
- **Contract Types:** TypeChain (ethers-v5)

## Prerequisites

- Node.js 18+
- Yarn (or npm)
- A Web3 wallet (e.g. MetaMask) for blockchain features

## Getting Started

1. **Clone and install:**

   ```bash
   git clone <repo-url>
   cd cosmicgame-frontend
   yarn install
   ```

   This also runs `postinstall` which generates TypeScript types from contract ABIs.

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

| Script                        | Description                                  |
| ----------------------------- | -------------------------------------------- |
| `yarn dev`                    | Start development server                     |
| `yarn build`                  | Create production build                      |
| `yarn start`                  | Run production server                        |
| `yarn lint`                   | Run ESLint                                   |
| `yarn compile-contract-types` | Generate TypeScript types from contract ABIs |

## Environment Variables

| Variable                         | Required      | Default             | Description                                                 |
| -------------------------------- | ------------- | ------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_NETWORK`            | No            | `sepolia`           | Network: `local`, `sepolia`, or `mainnet`                   |
| `NEXT_PUBLIC_INFURA_KEY`         | Yes (mainnet) | —                   | Infura API key for Arbitrum mainnet RPC                     |
| `NEXT_PUBLIC_RPC_URL`            | No            | Per-network default | Override the RPC endpoint                                   |
| `NEXT_PUBLIC_API_URL`            | No            | Per-network default | Override the backend API URL                                |
| `PROXY_ALLOWED_HOSTS`            | No            | —                   | Comma-separated extra hostnames for the API proxy allowlist |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | No            | —                   | Google Analytics 4 measurement ID                           |

## Project Structure

```
├── components/       React components
├── config/           App configuration (networks, chains, theme, nav)
├── connectors/       Web3 wallet connectors
├── contexts/         React context providers
├── contracts/        Solidity ABI JSON files (types/ are generated)
├── hooks/            Custom React hooks (contract interactions, Web3)
├── pages/            Next.js file-based routes + API routes
├── public/           Static assets (fonts, images, audio)
├── services/         API client
├── styles/           Global CSS
└── utils/            Utility functions
```

## Networks

The app supports three networks configured in `config/networks.ts`:

- **local** — Local Hardhat node (chain ID 31337)
- **sepolia** — Arbitrum Sepolia testnet (chain ID 421614)
- **mainnet** — Arbitrum One (chain ID 42161)

Contract addresses are defined per-network. Switch networks via the `NEXT_PUBLIC_NETWORK` env var.
