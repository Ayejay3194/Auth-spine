import type { Environment, Incident, Severity } from "../ops/types";
import type { IIncidentNotifier } from "./notifier";
import { stableId } from "../utils/stable_id";

export type EscalationRule = {
  severity: Severity;
  titleIncludes?: string;
  notify: boolean;
};

export const DEFAULT_ESCALATION: EscalationRule[] = [
  { severity: "critical", notify: true },
  { severity: "high", notify: true },
  { severity: "medium", notify: true },
  { severity: "low", notify: false },
  { severity: "info", notify: false }
];

export async function maybeNotify(params: {
  env: Environment;
  severity: Severity;
  title: string;
  details: string;
  notifier: IIncidentNotifier;
  rules?: EscalationRule[];
  context?: Record<string, any>;
}) {
  const rules = params.rules ?? DEFAULT_ESCALATION;
  const should = rules.some(r => r.notify && r.severity === params.severity && (!r.titleIncludes || params.title.includes(r.titleIncludes)));
  if (!should) return;

  const incident: Incident = {
    id: stableId(`incident:${params.env}:${params.severity}:${params.title}:${new Date().toISOString()}`),
    tsISO: new Date().toISOString(),
    env: params.env,
    severity: params.severity,
    title: params.title,
    details: params.details,
    context: params.context
  };
  await params.notifier.notify(incident);
}
