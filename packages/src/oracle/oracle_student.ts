import { OracleInput, OracleOutput } from "./contracts";

/**
 * Runtime oracle student: deterministic renderer.
 * It NEVER invents facts. It only rephrases provided claims with a style dial.
 */
export function oracleStudentRender(input: OracleInput): OracleOutput {
  const claim = pickTopClaim(input);
  const snark = input.dials.snark;
  const mystic = input.dials.mystic;

  const opener = styleOpen(snark, mystic, input.certaintyBudget);
  const line1 = `${opener} ${claim.text}`;
  const line2 = suggestAction(input, snark);
  const line3 = input.receipts.length ? `Receipts: ${input.receipts[0].label}` : "Receipts: none";
  const lines = [line1, line2, line3].filter(Boolean).slice(0,4);

  return {
    lines,
    moduleLink: guessModuleLink(claim),
    receiptsHint: input.receipts.length ? "Tap for receipts." : undefined,
  };
}

function pickTopClaim(input: OracleInput) {
  return (input.claims.slice().sort((a,b)=>b.confidence-a.confidence)[0]) ?? { text: "Signal is quiet. So are my opinions.", confidence: 0.3 };
}

function styleOpen(snark: number, mystic: number, certainty: number) {
  const base = certainty < 0.6 ? "Reading" : "Oracle update";
  const s = snark >= 2 ? "with attitude" : "with minimal drama";
  const m = mystic >= 2 ? "under a suspiciously meaningful sky" : "with boring accuracy";
  return `${base} ${s}, ${m}:`;
}

function suggestAction(input: OracleInput, snark: number) {
  const c = input.claims[0];
  if (!c) return "Do one small thing you can control. Humans love pretending.";
  const tag = (c.tags ?? [])[0] ?? "";
  if (tag.includes("conflict") && snark >= 2) return "If you pick a fight today, at least make it educational.";
  return "Pick one clean action and stop doom-scrolling your feelings.";
}

function guessModuleLink(claim: { text: string }) {
  const t = claim.text.toLowerCase();
  if (t.includes("conflict")) return "RelationshipLoop";
  if (t.includes("pressure")) return "PressureWindow";
  return "TodaySnapshot";
}
