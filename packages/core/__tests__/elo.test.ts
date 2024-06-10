import { describe, expect, test } from "vitest";
import { getRatingDelta } from "../src/elo.js";

describe("elo", () => {
    test("rating", () => {
        expect(getRatingDelta(1000, 1000, 1, 20)).toBe(10);
        expect(getRatingDelta(1000, 1000, 0, 20)).toBe(-10);
        expect(getRatingDelta(1000, 1000, 0.5, 20)).toBe(0);
        expect(getRatingDelta(1000, 1200, 1, 20)).toBe(15.2);
        expect(getRatingDelta(1000, 1200, 0, 20)).toBe(-4.8);
        expect(getRatingDelta(1000, 1200, 0.5, 20)).toBe(5.2);
        expect(getRatingDelta(1000, 1400, 1, 20)).toBe(18.4);
        expect(getRatingDelta(1000, 1400, 0, 20)).toBe(-1.6);
        expect(getRatingDelta(1000, 1400, 0.5, 20)).toBe(8.4);
    });
});
