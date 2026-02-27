import { TodaySnapshot } from "./todaySnapshot.js";
import { PressureWindow } from "./pressureWindow.js";
import { DefenseStyle } from "./defenseStyle.js";
import { DecisionTiming } from "./decisionTiming.js";
import { GroupDynamics } from "./groupDynamics.js";
import { RepairScript } from "./repairScript.js";

export { TodaySnapshot, PressureWindow, DefenseStyle, DecisionTiming, GroupDynamics, RepairScript };

export const MODULE_REGISTRY = {
  TodaySnapshot,
  PressureWindow,
  DefenseStyle,
  DecisionTiming,
  GroupDynamics,
  RepairScript,
} as const;
