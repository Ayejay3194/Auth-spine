export class GhostBookingEngine {
  detectIntent(message: string): boolean {
    return /(need|want|should|get).*hair|nails|cut|color/i.test(message);
  }
}
