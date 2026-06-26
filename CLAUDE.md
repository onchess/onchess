# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

OnChess is an onchain chess game on the [Base](https://base.org) chain, built as a [Cartesi](https://cartesi.io) rollups dApp. Players deposit an ERC-20 token (USDC on mainnet), bet on games, and the winner takes the pot minus a house rake. Ranking uses ELO. See `README.md` for game rules and time controls.

## Monorepo layout

bun workspaces + Turborepo. Three workspaces:

- **`packages/core`** (`@onchess/core`) — the deterministic game logic and state machine. This is the heart of the project. Pure and isomorphic: the **same code runs both inside the Cartesi Machine (backend) and in the browser (frontend)**.
- **`apps/backend`** (`@onchess/backend`) — a thin [deroll](https://github.com/tuler/deroll) app that wires `@onchess/core` into the Cartesi rollups runtime. Runs inside a RISC-V Cartesi Machine.
- **`apps/web`** (`@onchess/web`) — Next.js 15 / React 19 frontend.

`packages/typescript-config` holds the shared `@repo/typescript-config`.

## Core architecture (read this before touching game logic)

The game is a **Redux Toolkit slice** (`packages/core/src/index.ts`). State shape is in `state.ts` (`State` = config, lobby of `Challenge`s, in-progress `Game`s keyed by address, `Player`s, rake, vouchers). Each onchain action is a reducer in `reducers/` (create, join, move, resign, claim, cancel, deposit, withdraw, plus owner-only: setRakeDivider, withdrawRake, shutdown, transferOwnership, upgrade).

**The onchain API is the `ABI` constant in `app.ts`** — a `parseAbi([...])` of function signatures (`create`, `move`, `join`, etc.). This single ABI is the contract between the two sides:

- **Backend** (`createChess` in `app.ts`): receives Cartesi advance requests, decodes the payload against `ABI` into a Redux action, dispatches it through the store, then emits the **entire new state** as a Cartesi `Notice` (JSON string), plus a second Notice with the processed action, plus any `Voucher`s generated (e.g. token withdrawals). ERC-20 deposits are detected separately via `@deroll/wallet` and turned into `deposit` actions.
- **Frontend** instantiates the *same* slice (`providers/state.tsx`) but hydrates from the latest Notice fetched from the Cartesi node — `hooks/state.tsx`'s `useLatestState` polls `useProcessedInputCount` + `useOutputs` and parses the Notice JSON back into `State`. The UI can optimistically dispatch the same reducers locally. The frontend encodes user actions as `InputBox.addInput` transactions in `apps/web/src/calls/index.ts`, reusing the same `ABI`.

### Non-obvious invariants

- **Determinism is mandatory.** Core runs inside a deterministic Cartesi Machine. Never use wall-clock time or randomness in core — use `metadata.block_timestamp` and `metadata.input_index` from the action payload. Game/challenge addresses are derived deterministically (`keccak256` of input_index + sender in `create.ts`).
- **Money is stored as decimal strings** (serialized `bigint`) throughout `State` — `balance`, `bet`, `pot`, `rake`. Convert with `BigInt(...)` for math, `.toString()` back. Never use JS numbers for token amounts.
- **Addresses are checksummed** with `getAddress()` before use as record keys.
- **Reducers don't throw on user error.** They validate and set `player.message = createError(...)` (see `message.ts`), then `return`. Immer drafts are mutated directly (RTK convention).
- **Chess state lives as PGN strings** (`game.pgn`), reconstructed with `new Chess(); chess.loadPgn(...)` on each move. Clocks (`whiteTime`/`blackTime`) are decremented by `block_timestamp - updatedAt`; running out of time terminates the game. Termination logic (pot distribution, rake, ELO update) is centralized in `game.ts`'s `terminateGame`.
- **ESM with explicit `.js` import extensions** even when importing `.ts` files (`from "./state.js"`). `@onchess/core` is `"type": "module"`.

## Commands

All from repo root unless noted. Package manager is **bun** (v1.3); Node >= 20. Use `bun run <script>` (not bare `bun build`/`bun test`, which invoke bun's own bundler/test runner instead of the package scripts).

```bash
bun install         # install workspace deps -> bun.lock
bun run build       # turbo build (all workspaces; core builds first via ^build)
bun run dev         # turbo dev (web on next dev; core in tsup --watch)
bun run lint        # turbo lint -> biome check in each workspace
bun run test        # turbo test (depends on build); core uses vitest
```

Scoped / single-target (bun's `--filter`, or call `turbo` directly):

```bash
bun run --filter '@onchess/core' build   # tsup -> dist (cjs + esm + d.ts)
bun run --filter '@onchess/web' dev      # Next dev server
bun run --filter '@onchess/web' storybook  # Storybook on :6006
bun run --filter '@onchess/web' codegen  # wagmi generate -> src/hooks/contracts.tsx
```

Single test (vitest, from `packages/core`):

```bash
cd packages/core && bunx vitest run __tests__/reducers/move.test.ts
cd packages/core && bunx vitest run -t "out of time"   # by test name
```

Tests live in `packages/core/__tests__/` (only core is tested).

### Backend / Cartesi build

The backend ships as a Cartesi Machine snapshot, not a normal Node process. Build with the Cartesi CLI per chain:

```bash
cartesi build --config cartesi.base.toml          # mainnet (CHAIN_ID 8453)
cartesi build --config cartesi.base-sepolia.toml  # testnet (CHAIN_ID 84532)
```

The `Dockerfile` (bun + turbo) `turbo prune`s the workspace, installs with `bun install --linker=hoisted`, runs `turbo build`, then stages a `rootfs` with the esbuild bundle **plus the `@tuler/node-libcmt` native addon and its `node-gyp-build` loader**. The backend uses deroll v2, which talks to the rollup device via that native addon (no HTTP server / `rollup-init`; entrypoint is plain `node index.js`). esbuild marks the addon `--external` (it can't bundle a `.node` binary), so it must be copied next to the bundle — the hoisted linker keeps it as a real top-level dir, and it ships a `linux-riscv64` prebuild that `node-gyp-build` selects at runtime. CI (`.github/workflows/backend.yaml`) builds both chains on every push and publishes snapshot tarballs as a GitHub Release on `v*` tags. Per-chain config (owner, token, rake, ELO K) is in `apps/backend/src/config.ts`, selected by `CHAIN_ID` env var.

## Tooling conventions

- **Biome** is the linter and formatter (`biome.json`), not ESLint/Prettier-for-code. **4-space indentation, double quotes.** Run `bun run lint` (= `biome check`). Imports are organized on save (`.vscode/settings.json` + Biome assist). Markdown still uses `.prettierrc.json` / markdownlint.
- The web app reads all config from `NEXT_PUBLIC_*` env vars (see `apps/web/.env`). Key ones: `NEXT_PUBLIC_CHAIN_ID` (selects chain in `providers/wallet.tsx`), `NEXT_PUBLIC_JAW_API_KEY` (JAW wallet API key from [dashboard.jaw.id](https://dashboard.jaw.id)), `NEXT_PUBLIC_CARTESI_RPC_URL`, `NEXT_PUBLIC_RPC_URL`, `NEXT_PUBLIC_PAYMASTER_URL`.
- Frontend stack: Next.js App Router (`src/app/`), Mantine UI, **wagmi v3 + viem**, Redux Toolkit (shared with core), Storybook for component development. The wallet is **[JAW](https://jaw.id) (`@jaw.id/wagmi`)** — passkey-based ERC-4337 smart accounts, gas sponsored by a paymaster. It's the sole wallet connector, wired in `providers/wallet/config.ts` via `jaw()`; `providers/wallet/useWalletConnect.ts` exposes the unified connect/disconnect (JAW has no separate register/login). The Cartesi state layer is `@cartesi/wagmi` / `@cartesi/viem` (their wagmi-v3 `2.0.0-alpha.*` line).
- **No dependency `overrides`.** Note `bun install` warns about a peer mismatch: `@jaw.id/wagmi` caps `@tanstack/react-query` at `<5.100.10`, but the declared `^5.89.0` range resolves to a newer 5.101.x. The build is green regardless; if the JAW wallet hooks misbehave at runtime, pin `@tanstack/react-query` to `5.100.9` via a root `override`.
