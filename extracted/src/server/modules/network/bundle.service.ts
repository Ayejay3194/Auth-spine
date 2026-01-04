export class BundleService {
  async createBundle(_input: { name: string; serviceIds: string[]; priceCents: number; split: Record<string, number> }) {
    return { ok: true as const };
  }
}
