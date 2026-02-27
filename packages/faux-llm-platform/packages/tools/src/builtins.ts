import type { ToolFn } from "./types";

export const calcTool: ToolFn = async (args) => {
  const expr = String(args["expression"] ?? "");
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) return { ok: false, error: "invalid_expression" };
  // eslint-disable-next-line no-new-func
  const val = Function(`"use strict"; return (${expr});`)();
  if (typeof val !== "number" || !Number.isFinite(val)) return { ok: false, error: "not_a_number" };
  return { ok: true, result: { value: val } };
};

export const echoTool: ToolFn = async (args) => ({ ok: true, result: args });
