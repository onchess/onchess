import { describe, expect, test } from "vitest";
import { isValid, parseTimeControl, startTime } from "../src/time.js";

describe("timeControl", () => {
    test("isValid", () => {
        expect(isValid("3600+10")).toBe(true);
        expect(isValid("3600")).toBe(true);
        expect(isValid("3600+")).toBe(false);
        expect(isValid("3600+10+10")).toBe(false);
        expect(isValid("3600+10+")).toBe(false);
        expect(isValid("T3600")).toBe(false);
        expect(isValid("0.5")).toBe(false);
        expect(isValid("1000 ")).toBe(false);
        expect(isValid(" 1000")).toBe(false);
        expect(isValid("")).toBe(false);
    });

    test("parseTimeControl", () => {
        expect(parseTimeControl("3600+10")).toEqual([3600, 10]);
        expect(parseTimeControl("3600")).toEqual([3600, 0]);
        expect(parseTimeControl("3600+")).toEqual([0, 0]);
        expect(parseTimeControl("3600+10+10")).toEqual([0, 0]);
        expect(parseTimeControl("3600+10+")).toEqual([0, 0]);
        expect(parseTimeControl("T3600")).toEqual([0, 0]);
        expect(parseTimeControl("0.5")).toEqual([0, 0]);
        expect(parseTimeControl("1000 ")).toEqual([0, 0]);
        expect(parseTimeControl(" 1000")).toEqual([0, 0]);
        expect(parseTimeControl("")).toEqual([0, 0]);
    });

    test("startTime", () => {
        expect(startTime("3600+10")).toBe(3600);
        expect(startTime("3600")).toBe(3600);
        expect(startTime("3600+")).toBe(0);
        expect(startTime("3600+10+10")).toBe(0);
        expect(startTime("3600+10+")).toBe(0);
        expect(startTime("T3600")).toBe(0);
        expect(startTime("0.5")).toBe(0);
        expect(startTime("1000 ")).toBe(0);
        expect(startTime(" 1000")).toBe(0);
        expect(startTime("")).toBe(0);
    });
});
