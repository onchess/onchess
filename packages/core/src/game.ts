import { getRatingDelta } from "./elo.js";
import { Game, Player, State } from "./state.js";

export const terminateGame = (
    state: State,
    game: Game,
    whitePlayer: Player,
    blackPlayer: Player,
    result: 1 | 0 | 0.5,
    rakeDivider: bigint,
) => {
    const winner =
        result === 1 ? whitePlayer : result === 0 ? blackPlayer : null;

    // distribute pot
    const pot = BigInt(game.pot);
    if (winner) {
        const rake = pot / rakeDivider;
        const prize = pot - rake;
        winner.balance = (BigInt(winner.balance) + prize).toString();
        state.rake = (BigInt(state.rake) + rake).toString();
    } else {
        const prize = pot / 2n;
        whitePlayer.balance = (BigInt(whitePlayer.balance) + prize).toString();
        blackPlayer.balance = (BigInt(blackPlayer.balance) + prize).toString();
        // do not take rake from draws
    }
    game.pot = "0";

    // update elo
    const delta = getRatingDelta(
        whitePlayer.rating,
        blackPlayer.rating,
        result,
        20,
    );
    whitePlayer.rating += delta;
    blackPlayer.rating -= delta;
};
