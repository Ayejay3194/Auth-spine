import type { VerticalConfig, VerticalKey } from "./types";

import beauty from "./configs/beauty.json";
import fitness from "./configs/fitness.json";
import consulting from "./configs/consulting.json";
import education from "./configs/education.json";
import home_services from "./configs/home_services.json";
import health from "./configs/health.json";

const configs: VerticalConfig[] = [beauty, fitness, consulting, education, home_services, health];

export function listVerticals() {
  return configs.map((c) => ({ vertical: c.vertical, label: c.label }));
}

export function getVertical(key: VerticalKey): VerticalConfig | null {
  return configs.find((c) => c.vertical === key) ?? null;
}
