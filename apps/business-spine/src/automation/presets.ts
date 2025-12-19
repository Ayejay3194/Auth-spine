import type { Rule } from "./engine";

export function defaultPresets(providerId: string): Rule[] {
  return [
    {
      id: "preset_welcome_email",
      name: "Welcome email (new client)",
      trigger: "client.created",
      enabled: true,
      config: { kind: "send", channel: "email", templateKey: "welcome" }
    },
    {
      id: "preset_review_request",
      name: "Review request (2 hours after completion)",
      trigger: "booking.completed",
      enabled: true,
      config: { kind: "send", channel: "sms", templateKey: "review_request" }
    },
    {
      id: "preset_rebook_nudge",
      name: "Rebook nudge (6 weeks after completion)",
      trigger: "booking.completed",
      enabled: true,
      config: { kind: "task", title: "Queue rebooking nudge (6 weeks)" }
    },
    {
      id: "preset_no_show_followup",
      name: "No-show follow-up",
      trigger: "booking.no_show",
      enabled: true,
      config: { kind: "send", channel: "sms", templateKey: "no_show_followup" }
    }
  ];
}
