/**
 * Multi-language NLP Pipeline (Advanced-ish)
 * This is lightweight routing + normalization, so you can plug in real models later.
 */
export type Lang = "en" | "es" | "fr" | "pt" | "unknown";

export function detectLang(text: string): Lang {
  // silly heuristic: enough to route pipelines, not to publish a paper.
  const t = text.toLowerCase();
  if (/[áéíóúñ¿¡]/.test(t)) return "es";
  if (/[çàâêîôûëïüœ]/.test(t)) return "fr";
  if (/[ãõç]/.test(t)) return "pt";
  if (/[a-z]/.test(t)) return "en";
  return "unknown";
}

export function normalize(text: string): string {
  return text.normalize("NFKC").replace(/\s+/g, " ").trim();
}
