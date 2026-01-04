export class ReferralService {
  async createReferral(_input: { fromProfessionalId: string; toProfessionalId: string; clientId: string; note?: string }) {
    return { ok: true as const };
  }
}
