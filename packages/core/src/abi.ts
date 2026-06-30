import { parseAbi } from "viem";

// The onchain API: the function signatures the frontend encodes as inputs and
// the backend decodes against (see app.ts). Kept in its own module — depending
// only on viem — so it can be shared with browser consumers (e.g. the explorer
// decoder in packages/decoder) without pulling in the rest of core.
export const ABI = parseAbi([
    "function create(uint256 bet, string timeControl, uint32 minRating, uint32 maxRating) returns (address)",
    "function cancel(address challenge)",
    "function join(address challenge)",
    "function move(address game, string move)",
    "function resign(address game)",
    "function claim(address game)",
    "function withdraw(uint256 amount)",
    "function withdrawRake()",
    "function setRakeDivider(uint32 rake)",
    "function shutdown()",
    "function transferOwnership(address newOwner)",
    "function upgrade(address dapp)",
]);
