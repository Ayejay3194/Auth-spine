import type { Incident } from "../ops/types.js";

export interface IIncidentNotifier {
  notify(incident: Incident): Promise<void>;
}
