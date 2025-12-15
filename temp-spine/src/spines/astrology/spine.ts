import { Spine, Intent, Extraction, AssistantContext, FlowStep } from "../../core/types.js";
import { detectByPatterns } from "../../core/intent.js";
import { requireFields } from "../../core/entities.js";
import { patterns } from "./intents.js";

/**
 * Astrology Spine
 * 
 * Provides astrological chart readings, transit analysis, and compatibility reports.
 * Based on Solari system - retrieval-based, not prescriptive, emphasizes patterns over predictions.
 * 
 * Principles:
 * - Observational only, no prophecy
 * - Reference material grounded
 * - No therapy language
 * - User has full control
 * - Privacy-first
 */
export const spine: Spine = {
  name: "astrology",
  description: "Astrological chart readings, transits, and compatibility analysis using reference-based interpretations",

  detectIntent(text: string, ctx: AssistantContext): Intent[] {
    return detectByPatterns(text, patterns);
  },

  extractEntities(intent: Intent, text: string, ctx: AssistantContext): Extraction {
    const entities: Record<string, unknown> = {};
    const missing: string[] = [];

    // Extract planets
    const planetMatch = text.match(/\b(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|ascendant|midheaven|asc|mc)\b/i);
    if (planetMatch) {
      entities.planet = planetMatch[1].toLowerCase();
    }

    // Extract signs
    const signMatch = text.match(/\b(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\b/i);
    if (signMatch) {
      entities.sign = signMatch[1].toLowerCase();
    }

    // Extract house numbers
    const houseMatch = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s*house\b/i) || text.match(/\bhouse\s*(\d{1,2})\b/i);
    if (houseMatch) {
      const house = parseInt(houseMatch[1], 10);
      if (house >= 1 && house <= 12) {
        entities.house = house;
      }
    }

    // Check for required fields based on intent
    switch (intent.name) {
      case "get_chart":
        // No additional entities needed
        break;

      case "read_placement":
        // Need at least planet or house
        if (!entities.planet && !entities.house) {
          missing.push("planet or house");
        }
        break;

      case "daily_transit":
        // No additional entities needed, uses current date
        break;

      case "compatibility":
        // Would need other person's chart data
        if (!text.includes("with")) {
          missing.push("other person's sign or birth data");
        }
        break;

      case "house_interpretation":
        if (!entities.house) {
          missing.push("house number (1-12)");
        }
        break;

      case "aspect_explanation":
        if (!entities.planet) {
          missing.push("planet or aspect type");
        }
        break;
    }

    return { entities, missing };
  },

  buildFlow(intent: Intent, extraction: Extraction, ctx: AssistantContext): FlowStep[] {
    const steps: FlowStep[] = [];

    // Ask for missing info
    if (extraction.missing.length > 0) {
      steps.push({
        kind: "ask",
        prompt: `To give you an accurate reading, I need: ${extraction.missing.join(", ")}. Please provide that information.`,
        missing: extraction.missing,
      });
      return steps;
    }

    // Build flow based on intent
    switch (intent.name) {
      case "get_chart":
        steps.push({
          kind: "execute",
          action: "astrology.getChart",
          sensitivity: "low",
          tool: "getAstrologyChart",
          input: extraction.entities,
        });
        break;

      case "read_placement":
        steps.push({
          kind: "execute",
          action: "astrology.readPlacement",
          sensitivity: "low",
          tool: "readAstrologyPlacement",
          input: extraction.entities,
        });
        break;

      case "daily_transit":
        steps.push({
          kind: "execute",
          action: "astrology.dailyTransit",
          sensitivity: "low",
          tool: "getDailyTransit",
          input: {
            ...extraction.entities,
            date: ctx.nowISO,
          },
        });
        break;

      case "compatibility":
        steps.push({
          kind: "execute",
          action: "astrology.compatibility",
          sensitivity: "low",
          tool: "getCompatibility",
          input: extraction.entities,
        });
        break;

      case "house_interpretation":
        steps.push({
          kind: "execute",
          action: "astrology.houseInterpretation",
          sensitivity: "low",
          tool: "interpretHouse",
          input: extraction.entities,
        });
        break;

      case "aspect_explanation":
        steps.push({
          kind: "execute",
          action: "astrology.aspectExplanation",
          sensitivity: "low",
          tool: "explainAspect",
          input: extraction.entities,
        });
        break;

      default:
        steps.push({
          kind: "respond",
          message: `I can help with chart readings, placement interpretations, daily transits, compatibility analysis, house meanings, and aspect explanations. What would you like to know?`,
        });
    }

    return steps;
  },
};
