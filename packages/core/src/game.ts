import { Chess } from "chess.js";
import { getRatingDelta } from "./elo.js";
import { Game, Player, State } from "./state.js";

export const terminateGame = (
    state: State,
    game: Game,
    chess: Chess,
    whitePlayer: Player,
    blackPlayer: Player,
    result: 1 | 0 | 0.5,
    rakeDivider: bigint,
) => {
    // adjust wins/losses/draws
    switch (result) {
        case 1:
            whitePlayer.wins++;
            blackPlayer.losses++;
            break;
        case 0:
            whitePlayer.losses++;
            blackPlayer.wins++;
            break;
        case 0.5:
            whitePlayer.draws++;
            blackPlayer.draws++;
            break;
    }

    // distribute pot
    const pot = BigInt(game.pot);
    if (result === 0.5) {
        const prize = pot / 2n;
        whitePlayer.balance = (BigInt(whitePlayer.balance) + prize).toString();
        blackPlayer.balance = (BigInt(blackPlayer.balance) + prize).toString();
        // do not take rake from draws
    } else {
        const winner = result === 1 ? whitePlayer : blackPlayer;
        const rake = pot / rakeDivider;
        const prize = pot - rake;
        winner.balance = (BigInt(winner.balance) + prize).toString();
        state.rake = (BigInt(state.rake) + rake).toString();
    }

    // remove money from the pot
    game.pot = "0";

    // update game result
    game.result = result;

    // update PGN
    const results = {
        1: "1-0",
        0: "0-1",
        0.5: "1/2-1/2",
    };
    game.pgn = `${chess.pgn()} ${results[result]}`;

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
