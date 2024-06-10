import { PayloadAction } from "@reduxjs/toolkit";
import { Chess } from "chess.js";
import { concat, getAddress, keccak256, numberToHex, slice } from "viem";
import { matches } from "../matchmaking.js";
import { createError } from "../message.js";
import { CreateGamePayload } from "../payloads.js";
import { getPlayer } from "../players.js";
import { Game, LobbyItem, State } from "../state.js";
import { startTime, supportedTimeControls } from "../time.js";
import { hexToFraction } from "../util.js";

export default (state: State, action: PayloadAction<CreateGamePayload>) => {
    const { metadata } = action.payload;
    const { input_index, timestamp } = metadata;
    const msg_sender = getAddress(metadata.msg_sender);

    // get player (add player if not exists)
    const player = getPlayer(state, msg_sender);

    // get game parameters
    const { timeControl, minRating, maxRating } = action.payload;
    const bet = BigInt(action.payload.bet);
    const balance = BigInt(player.balance);

    // validate timeControl
    if (supportedTimeControls.indexOf(timeControl) < 0) {
        player.message = createError({
            text: `Unsupported time control: ${timeControl}`,
            timestamp,
        });
        return;
    }

    // TODO: validate bet

    // check if player has enough balance
    if (balance < bet) {
        // player don't have enough funds
        player.message = createError({
            text: "Not enough funds",
            timestamp,
        });
        return;
    }

    // subtract bet from player balance
    player.balance = (balance - bet).toString();

    // create lobby item
    const lobbyItem: LobbyItem = {
        bet: bet.toString(),
        createdAt: timestamp,
        player: msg_sender,
        timeControl,
        minRating,
        maxRating,
    };

    // run matchmaking
    const index = state.lobby.findIndex((item) =>
        matches(
            item,
            lobbyItem,
            state.players[item.player],
            state.players[lobbyItem.player],
        ),
    );
    if (index >= 0) {
        // matchmaking successful
        const opponent = state.lobby[index].player;

        // calculate game address
        const address = getAddress(
            slice(
                keccak256(
                    concat([numberToHex(input_index), msg_sender, opponent]),
                ),
                0,
                20,
            ),
        );

        // "random" color assignment
        // XXX: not really random, predictable, but that's ok
        const starter = hexToFraction(address);
        const white = starter > 0.5 ? msg_sender : opponent;
        const black = starter > 0.5 ? opponent : msg_sender;

        // create new chess.js game
        const chess = new Chess();
        chess.header("White", white);
        chess.header("Black", black);
        chess.header("Event", "Casual Game");
        chess.header("Site", "OnChess.xyz");

        // calculate initial clock
        const time = startTime(timeControl);

        // create game object
        const game: Game = {
            address,
            updatedAt: timestamp,
            white,
            black,
            whiteTime: time,
            blackTime: time,
            timeControl,
            pgn: chess.pgn(),
            pot: (bet * 2n).toString(), // 2x bet
        };
        state.games[address] = game;

        // remove matched lobby entry
        state.lobby.splice(index, 1);
    } else {
        // no matchmaking, add to end of lobby
        state.lobby.push(lobbyItem);
    }
};
