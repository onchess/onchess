# @onchess/decoder

An input/output decoder for the Cartesi Node Explorer, written against the
[`@deroll/decoder`](https://www.npmjs.com/package/@deroll/decoder) kit. It turns
OnChess inputs (game moves, ERC-20 deposits) and outputs (payout vouchers) into
readable summaries instead of raw hex.

## Use it

Register the decoder by URL on the application's **Overview** page in the
explorer.

Published package, served through a CDN that resolves `@deroll/decoder` and
`viem` on the fly:

```
https://esm.sh/@onchess/decoder
```

…or straight from GitHub source — the explorer supplies `@deroll/decoder` via an
import map, so nothing needs to be published:

```
gh:onchess/onchess@main/packages/decoder/src/index.ts
```

Explorer: <https://tuler.github.io/luke/apps/onchess>

## Browser bundle

The decoder runs in the browser, so `build` (bun, `--target=browser`) emits a
single ~5 KB ESM module:

- the onchain `ABI` is imported from **`@onchess/core/abi`** — a viem-only
  subpath — and **bundled in**, because `@onchess/core` is not published.
  (Importing the package barrel `@onchess/core` would drag deroll, Redux Toolkit
  and chess.js into the browser; the subpath avoids all of it.)
- `@deroll/decoder` and `viem` stay **external** — both are published, so a CDN
  like esm.sh resolves them.

```bash
bun run --filter @onchess/decoder build  # bun build -> dist/index.js (browser ESM)
bun run --filter @onchess/decoder test   # vitest against the real @deroll/decoder
bun run --filter @onchess/decoder lint
```

## Publish

Published publicly to npm (`publishConfig.access: "public"`); only `dist/`
ships. `@onchess/core` is a **dev** dependency — its ABI is bundled into the dist
— so installers resolve only `@deroll/decoder` and `viem`.

## Keep in sync

The `ABI` comes from `@onchess/core`, so it never drifts. The only inlined data
is the per-chain **settlement tokens**, mirrored from
`apps/backend/src/config.ts`. `src/index.test.ts` exercises the decode logic so
regressions surface as test failures.
