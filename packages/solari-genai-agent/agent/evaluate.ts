export interface Evaluation {
  success: boolean;
  notes: string[];
}

export function evaluate(result: any): Evaluation {
  const notes: string[] = [];
  if (!result.ok) notes.push("generation_failed");
  if (result.confidence?.label === "LOW") notes.push("low_confidence");
  return { success: notes.length === 0, notes };
}
