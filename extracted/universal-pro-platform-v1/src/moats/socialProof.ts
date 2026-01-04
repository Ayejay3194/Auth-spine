export class SocialProof {
  build(input: {
    professionalName: string;
    bookingsThisWeek?: number;
    popularSlotLabel?: string;
    followersOverlapCount?: number;
    typicalReturnWeeks?: number;
  }): string[] {
    const lines: string[] = [];
    if (input.bookingsThisWeek != null) lines.push(`${input.bookingsThisWeek} people booked with ${input.professionalName} this week`);
    if (input.popularSlotLabel) lines.push(`This is a popular time slot: ${input.popularSlotLabel}`);
    if (input.followersOverlapCount != null) lines.push(`${input.followersOverlapCount} of your followers also book with them`);
    if (input.typicalReturnWeeks != null) lines.push(`Clients who book this come back in ~${input.typicalReturnWeeks} weeks`);
    return lines;
  }
}
