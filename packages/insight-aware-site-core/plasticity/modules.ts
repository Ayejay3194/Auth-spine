export const PERSONALIZEABLE_MODULES = [
  "TodaySnapshot",
  "PressureWindow",
  "DefenseStyle",
  "RepairScript",
  "DecisionTiming",
  "GroupDynamics",
] as const;

export type ModuleId = typeof PERSONALIZEABLE_MODULES[number];

export function moduleIndex(id: string): number {
  return PERSONALIZEABLE_MODULES.indexOf(id as any);
}

export function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}
