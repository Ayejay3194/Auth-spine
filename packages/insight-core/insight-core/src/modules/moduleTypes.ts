import type { NowContext } from "../types/context.js";

export type ModuleResult = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  receipts?: string[];
  confidence: number; // 0..1
  cta?: { label: string; href: string };
};

export type Module = (ctx: NowContext) => ModuleResult;
