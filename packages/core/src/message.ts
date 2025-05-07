import type { Message } from "./state.js";

type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

/**
 * Creates a new message
 * @param param data of message
 * @returns new message
 */
export const createMessage = (param: Optional<Message, "ttl">): Message => {
    return {
        type: param.type ?? "error",
        text: param.text,
        timestamp: param.timestamp,
        ttl: param.ttl ?? 600,
    };
};

/**
 * Creates a new error message
 * @param param data of message
 * @returns new message
 */
export const createError = (
    param: Optional<Message, "ttl" | "type">,
): Message => createMessage({ ...param, type: "error" });
