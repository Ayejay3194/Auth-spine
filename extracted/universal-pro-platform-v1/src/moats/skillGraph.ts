import type { ID } from "../core/types.js";

export class SkillGraph {
  private skills = new Map<ID, Record<string, number>>();

  bump(proId: ID, skill: string, delta: number) {
    const s = this.skills.get(proId) ?? {};
    s[skill] = (s[skill] ?? 0) + delta;
    this.skills.set(proId, s);
  }

  bestFor(skill: string): ID | null {
    let best: ID | null = null;
    let max = -Infinity;
    for (const [id, map] of this.skills.entries()) {
      const score = map[skill] ?? 0;
      if (score > max) { max = score; best = id; }
    }
    return best;
  }
}
