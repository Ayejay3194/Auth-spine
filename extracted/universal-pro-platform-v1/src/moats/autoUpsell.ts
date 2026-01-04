export class AutoUpsell {
  suggest(input: { lastRelatedServiceWeeksAgo: number; candidateAddOnName: string }): string | null {
    if (input.lastRelatedServiceWeeksAgo >= 8) return `Want to add ${input.candidateAddOnName}? It’s been a while.`;
    return null;
  }
}
