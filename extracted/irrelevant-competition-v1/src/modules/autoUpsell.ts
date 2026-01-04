export class AutoUpsellEngine {
  suggest(weeks: number): string | null {
    return weeks > 8 ? "Add-on service" : null;
  }
}
