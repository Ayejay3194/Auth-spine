export type AdminAlert = {
  tsISO: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  title: string;
  detail: string;
  context?: Record<string, any>;
};

export interface IAdminNotifier {
  send(alert: AdminAlert): Promise<void>;
}
