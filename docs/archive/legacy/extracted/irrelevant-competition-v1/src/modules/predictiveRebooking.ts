export class PredictiveRebookingEngine {
  suggestNext(date: string): string {
    const d = new Date(date);
    d.setDate(d.getDate() + 42);
    return d.toISOString();
  }
}
