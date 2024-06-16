import { AdvanceRequestData, App } from "@deroll/core";
import { isERC20Deposit, parseERC20Deposit } from "@deroll/wallet";
import { Action, combineSlices, configureStore } from "@reduxjs/toolkit";
import { decodeFunctionData, parseAbi, stringToHex } from "viem";
import chessSlice, { ChessSlice, Config } from "./index.js";

// game onchain API
export const ABI = parseAbi([
    "function create(uint256 bet, string timeControl, uint32 minRating, uint32 maxRating) returns (address)",
    "function cancel()",
    "function move(address game, string move)",
    "function resign(address game)",
    "function claim(address game)",
    "function withdraw(uint256 amount)",
    "function withdrawRake()",
    "function setRakeDivider(uint32 rake)",
    "function transferOwnership(address newOwner)",
]);

/**
 * Function to create a redux action from a Cartesi rollups advance request
 * @param chess chess slice
 * @returns new action
 */
const makeActionCreator = (config: Config, chess: ChessSlice) => {
    const {
        cancel,
        claim,
        create,
        deposit,
        move,
        resign,
        setRakeDivider,
        transferOwnership,
        withdraw,
        withdrawRake,
    } = chess.actions;

    return (data: AdvanceRequestData): Action | undefined => {
        const { metadata, payload } = data;

        // handle ERC-20 deposit
        if (isERC20Deposit(data)) {
            const parsed = parseERC20Deposit(data.payload);
            if (parsed.success && parsed.token === config.token.address) {
                return deposit({
                    metadata,
                    amount: parsed.amount.toString(),
                    sender: parsed.sender,
                });
            }
        }

        // handle other inputs
        const { args, functionName } = decodeFunctionData({
            abi: ABI,
            data: payload,
        });

        switch (functionName) {
            case "create": {
                const [bet, timeControl, minRating, maxRating] = args;
                return create({
                    metadata,
                    bet: bet.toString(),
                    timeControl,
                    minRating,
                    maxRating,
                });
            }

            case "cancel": {
                return cancel({ metadata });
            }

            case "move": {
                const [address, m] = args;
                return move({ metadata, address, move: m });
            }

            case "resign": {
                const [address] = args;
                return resign({ metadata, address });
            }

            case "claim": {
                const [address] = args;
                return claim({ metadata, address });
            }

            case "withdraw": {
                const [amount] = args;
                return withdraw({ metadata, amount: amount.toString() });
            }

            case "withdrawRake": {
                return withdrawRake({ metadata });
            }

            case "setRakeDivider": {
                const [value] = args;
                return setRakeDivider({ metadata, value });
            }

            case "transferOwnership": {
                const [newOwner] = args;
                return transferOwnership({ metadata, newOwner });
            }
        }
    };
};

export const createChess = (app: App, config: Config) => {
    // create chess slice
    const slice = chessSlice(config);

    // create a store
    const reducer = combineSlices(slice);
    const store = configureStore({ reducer });
    const actionCreator = makeActionCreator(config, slice);

    // add handler for game actions
    app.addAdvanceHandler(async (data) => {
        // create a redux action from the rollups advance request
        const action = actionCreator(data);

        if (action) {
            // keep track of vouchers before action processing
            const voucherCount = store.getState().chess.vouchers.length;

            // dispatch action to store
            const processedAction = store.dispatch(action);

            // get updated state
            const state = store.getState();

            // always create a notice with current state as a json string
            await app.createNotice({
                payload: stringToHex(JSON.stringify(state)),
            });

            // create second notice with processed action
            await app.createNotice({
                payload: stringToHex(JSON.stringify(processedAction)),
            });

            // submit vouchers created during action processing
            for (let i = voucherCount; i < state.chess.vouchers.length; i++) {
                await app.createVoucher(state.chess.vouchers[i]);
            }

            return "accept";
        } else {
            // if no action was created, reject the request
            return "reject";
        }
    });
};
