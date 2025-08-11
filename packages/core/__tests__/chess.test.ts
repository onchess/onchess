import { Chess } from "chess.js";
import { describe, it } from "vitest";

describe("chess", () => {
    it("should create and load an empty pgn", () => {
        const chess = new Chess();
        chess.loadPgn(chess.pgn());
    });

    it("should load a pgn with a resignation", () => {
        const chess = new Chess();
        chess.setHeader("White", "p1");
        chess.setHeader("Black", "p2");
        chess.setHeader("Event", "Casual Game");
        chess.setHeader("Site", "Test");
        chess.setHeader("Date", "2025.08.01");
        chess.move("e3");
        chess.move("e5");
        chess.setComment("White resigns");
        chess.setHeader("Result", "0-1");
        const pgn = chess.pgn();
        chess.loadPgn(pgn);
    });
});
