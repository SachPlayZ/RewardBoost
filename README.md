## Quest Rewards Platform

End-to-end template for running on-chain quest campaigns with a modern web app and a production-ready smart contract. This monorepo includes:

- contracts/: Foundry-based Solidity project for `QuestRewardsContract`
- web/: Next.js 15 application (React 19, TypeScript, Tailwind, Prisma, AWS S3, RainbowKit/Wagmi/Viem)

### Key Features

- On-chain quest campaigns: create, fund, and distribute rewards (SEI or USDC)
- Distribution methods: Lucky Draw and Equal Distribution
- Platform fee vault: internal vault holds fees; owner can withdraw
- Participant tracking: quest scores, total quest points and earnings
- Next.js App Router APIs for campaigns, submissions, uploads, and social integrations
- Postgres + Prisma schema for campaigns, tasks, submissions, and user profiles

### Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- Web3: RainbowKit, Wagmi, Viem, Ethers v6, `@sei-js/sei-global-wallet`
- Backend/API: Next.js Route Handlers, Prisma, PostgreSQL
- Storage: AWS S3 (uploads via signed URLs)
- Contracts: Solidity ^0.8.20, Foundry, OpenZeppelin 4.9.x

---

## Repository Layout

```
pointer-landing-template/
  contracts/        # Foundry project for QuestRewardsContract
  web/              # Next.js app, Prisma schema, APIs, UI
```

Notable web directories:

- `web/app/` App Router routes and pages
- `web/app/api/` API route handlers (campaigns, uploads, knowledge-base, twitter)
- `web/components/` UI components and campaign wizard steps
- `web/lib/` utilities, contract ABIs, and client helpers
- `web/prisma/` Prisma schema and migrations

---

## Prerequisites

- Node.js 20+ (LTS recommended)
- pnpm, npm, or yarn
- PostgreSQL 14+
- Foundry (for contracts): `curl -L https://foundry.paradigm.xyz | bash && foundryup`

---

## Quick Start (Web App)

1. Install dependencies

```bash
cd web
pnpm install # or npm install / yarn
```

2. Configure environment

```bash
cp env.example .env.local
# Edit .env.local with your values (see Environment Variables)
```

3. Setup database (PostgreSQL)

```bash
pnpm prisma generate
pnpm prisma migrate dev
# or pnpm db:migrate
```

4. Run the app

```bash
pnpm dev
# http://localhost:3000
```

Build/start:

```bash
pnpm build
pnpm start
```

Notes:

- `web/next.config.mjs` ignores ESLint and TS build errors; adjust for production if needed.
- Images are set to `unoptimized: true` by default.

---

## Environment Variables

### Web App (`web/.env.local`)

Base template is in `web/env.example`:

- Database
  - `DATABASE_URL` (Postgres connection string)
  - `DATABASE_DIRECT_URL` (optional direct URL)
- App
  - `NEXT_PUBLIC_APP_URL`
- Blockchain
  - `NEXT_PUBLIC_QUEST_REWARDS_CONTRACT_ADDRESS`
  - `NEXT_PUBLIC_RPC_URL_SEI_TESTNET`
  - `NEXT_PUBLIC_RPC_URL_SEI_MAINNET`
  - `OWNER_PRIVATE_KEY` (server-side usage for on-chain actions; keep secret)
  - `SEI_RPC_URL`
- AWS S3
  - `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
- AI/Integrations (optional)
  - `RIVALZ_SECRET_TOKEN` (knowledge base and tweet generation)
  - `GROQ_API_KEY` (fallback for content generation)
- Social (optional)
  - `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`

### Contracts (`contracts/.env`)

Base template is in `contracts/env.deployment.example`:

- `PRIVATE_KEY` (deployer)
- `RPC_URL` (SEI RPC) and `CHAIN_ID` (e.g., 1329 for testnet)
- `USDC_ADDRESS` (SEI testnet USDC)
- Optional verification: `ETHERSCAN_API_KEY`, `BLOCK_EXPLORER_URL`

Never commit secrets. Use `.env.local` for web and `.env` for contracts.

---

## Database Schema (Prisma)

Location: `web/prisma/schema.prisma`

Core models:

- `Campaign`: campaign metadata, lifecycle, chain sync fields
- `Task`: quest tasks (X follow/post/custom), per-campaign
- `Submission`: user submissions, verification metadata, uniqueness constraints
- `UserProfile`: wallet-linked profile, optional Twitter fields

Run migrations:

```bash
cd web
pnpm prisma migrate dev
```

View data:

```bash
pnpm prisma studio
```

---

## Smart Contracts

Location: `contracts/`

- Language/Tooling: Solidity ^0.8.20, Foundry, OpenZeppelin
- Contract: `QuestRewardsContract.sol`
  - Distribution methods: `LuckyDraw`, `EqualDistribution`
  - Internal platform fee vault with `withdrawPlatformFees()`
  - Supported tokens: SEI (native via address(0)) and USDC (SEI testnet address embedded)
  - Campaign lifecycle and participant tracking

### Build & Test

```bash
cd contracts
forge install
forge build
forge test -v
```

### Deployment (SEI Testnet)

1. Prepare environment

```bash
cd contracts
cp env.deployment.example .env
# set PRIVATE_KEY and other values
```

2. Validate setup

```bash
bash check-deployment-setup.sh
```

3. Deploy with debug script

```bash
bash deploy-to-sei-debug.sh
```

This runs the Foundry script `script/DeployQuestRewards.sol:DeployQuestRewards`, saves a `sei-deployment-*.json`, and prints the deployed address.

4. Update the web app

Set `NEXT_PUBLIC_QUEST_REWARDS_CONTRACT_ADDRESS` in `web/.env.local` to the deployed address. Restart the dev server.

Direct Foundry command (alternative):

```bash
forge script script/DeployQuestRewards.sol:DeployQuestRewards \
  --rpc-url https://evm-rpc-testnet.sei-apis.com \
  --broadcast
```

---

## Web3 Integration

- Wallets: RainbowKit with `@sei-js/sei-global-wallet`
- Libraries: Wagmi + Viem + Ethers v6
- Contract ABI and helpers: see `web/lib/contracts/`
- Hooks: see `web/hooks/use-quest-contract.ts`

Ensure your RPC and contract address env vars are configured. For native SEI rewards, the contract uses address(0) internally.

---

## API Surface (selected)

Route handlers live under `web/app/api/*`. Examples include:

- `api/campaigns/*`: create, update, participate, status, etc.
- `api/upload/route.ts`: S3 signed URL generation
- `api/knowledge-base/*`: KB upload/status and tweet generation
- `api/twitter/*`: manual link/verify endpoints

Inspect code in `web/app/api` for exact request/response shapes.

---

## Scripts

Web (`web/package.json`):

- `dev`: start Next.js dev server
- `build`: `prisma generate && next build`
- `start`: start production server
- `db:*`: prisma helpers (`generate`, `migrate`, `push`, `studio`)

Contracts:

- `forge build`, `forge test`
- `bash check-deployment-setup.sh`
- `bash deploy-to-sei-debug.sh`

---

## Deployment

### Web

- Any Node hosting or Vercel works. Ensure env vars are present and Postgres is reachable.
- Build runs `prisma generate`. Run migrations separately as part of your CI/CD before starting the app.

### Contracts

- Use the scripts above for SEI testnet/mainnet. For other EVM chains, update RPC, chain IDs, and (if needed) token addresses.

---

## Troubleshooting

- Database: `P1001`/connection refused → check `DATABASE_URL`, Postgres is running and network/firewall rules allow connections.
- Prisma migrate errors → clear shadow DB, ensure permissions, or use `prisma db push` for non-prod.
- SEI RPC unreachable → verify `SEI_RPC_URL` and firewall; try `curl -s <rpc>/` and the JSON-RPC `eth_blockNumber` check from `check-deployment-setup.sh`.
- Insufficient funds → faucet: `https://faucet.sei-apis.com/`.
- Private key format → the deploy script auto-adds `0x` prefix; keep the key in `.env` and never commit.
- Next build ignores type/eslint errors → adjust `web/next.config.mjs` for stricter builds in production.
- S3 upload fails → validate IAM credentials, bucket region, and CORS on the bucket.

---

## Security Notes

- The Lucky Draw implementation uses `block.prevrandao` for randomness; for production-grade randomness, integrate Chainlink VRF.
- Keep all private keys and access tokens outside of version control.

---

## License

MIT. See license headers in source files. Review and adapt before production use.

---

## Contributing

1. Fork and branch off `main`
2. Implement changes with clear commits
3. Run tests and ensure lints build cleanly
4. Open a pull request with context and screenshots where relevant
