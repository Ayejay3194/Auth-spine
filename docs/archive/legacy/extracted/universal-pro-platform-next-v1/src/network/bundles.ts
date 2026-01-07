export interface BundleRule {
  id: string;
  name: string;
  verticals: string[];
  tags: string[];
}

export const defaultBundleRules: BundleRule[] = [
  { id: "wedding_prep", name: "Wedding Prep", verticals: ["beauty", "fitness"], tags: ["wedding", "prep"] },
  { id: "new_business_launch", name: "New Business Launch", verticals: ["consulting"], tags: ["business", "launch"] },
  { id: "home_refresh", name: "Home Refresh", verticals: ["home_services"], tags: ["home", "refresh"] }
];

export function suggestBundles(input: { clientVerticalHistory: string[] }) {
  const set = new Set(input.clientVerticalHistory);
  return defaultBundleRules.filter((b) => b.verticals.some((v) => set.has(v)));
}
