import type { Module } from "./moduleTypes.js";
import { clamp } from "../utils/math.js";

interface SpeakerEvent {
  speakerId: string;
  timestamp: number;
  duration: number;
  sentiment: number;
}

interface TurnMetrics {
  totalTurns: number;
  avgTurnDuration: number;
  turnBalance: number; // 0-1, 1 = perfectly balanced
  interruptions: number;
  silences: number[];
}

export const GroupDynamics: Module = (ctx) => {
  // Real group dynamics analysis
  const events: SpeakerEvent[] = ctx.events || [];
  const metrics = computeTurnMetrics(events);
  
  const dom = ctx.vibe.dominance;
  const warm = ctx.vibe.warmth;
  const def = ctx.vibe.defensiveness;

  // Multi-dimensional pattern analysis
  const patterns: string[] = [];
  
  // Turn-taking patterns
  if (metrics.turnBalance < 0.3) {
    patterns.push("One speaker dominates. Others are disengaged or deferential.");
  } else if (metrics.turnBalance > 0.7) {
    patterns.push("Balanced participation. Ideas flow between speakers.");
  } else {
    patterns.push("Uneven participation. Some voices louder than others.");
  }
  
  // Interruption patterns
  if (metrics.interruptions > 3) {
    patterns.push("High interruption rate. Competition for airspace.");
  } else if (metrics.interruptions === 0 && events.length > 5) {
    patterns.push("Polite turn-taking. Possible hesitation to challenge.");
  }
  
  // Emotional dynamics
  const pattern =
    dom > 0.62 && warm < 0.50 ? "Command-and-control vibe. People comply, then quietly resent." :
    dom < 0.45 && def > 0.55 ? "Withdraw/ghost loop risk. Silence becomes a weapon." :
    warm > 0.62 && def < 0.45 ? "Repair-friendly room. Say the honest thing while it's safe." :
    metrics.interruptions > 2 ? "Contested space. Ideas compete, feelings may bruise." :
    metrics.turnBalance > 0.6 && warm > 0.5 ? "Collaborative flow. Constructive friction." :
    "Mixed signals. Keep statements short, ask clean questions.";

  // Compute confidence from multiple signals
  const signalStrength = metrics.totalTurns > 0 ? 
    clamp(metrics.totalTurns / 10, 0.3, 1.0) : 0.35;
  const conf = clamp(0.35 + 0.65 * ctx.vibe.confidence * signalStrength, 0, 1);

  return {
    id: "GroupDynamics",
    title: "Group Dynamics",
    summary: "Interaction forecast from observable conversation signals.",
    bullets: [
      pattern,
      `Turn balance: ${(metrics.turnBalance * 100).toFixed(0)}% (${metrics.totalTurns} turns)`,
      metrics.interruptions > 0 ? `Interruptions: ${metrics.interruptions} (power struggle indicator)` : "Clean turn-taking",
      "Move: state intent, then ask one question that can't be dodged."
    ],
    receipts: ctx.user.preferences.receiptsDefault ? [
      `Dominance ${dom.toFixed(2)} | Warmth ${warm.toFixed(2)} | Defensiveness ${def.toFixed(2)}`,
      `Turns: ${metrics.totalTurns} | Balance: ${(metrics.turnBalance * 100).toFixed(0)}% | Interruptions: ${metrics.interruptions}`
    ] : undefined,
    confidence: conf,
    metrics // Include raw metrics for downstream processing
  };
};

function computeTurnMetrics(events: SpeakerEvent[]): TurnMetrics {
  if (events.length === 0) {
    return {
      totalTurns: 0,
      avgTurnDuration: 0,
      turnBalance: 0.5,
      interruptions: 0,
      silences: []
    };
  }

  // Sort by timestamp
  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  
  // Count speaker turns
  const speakerCounts: Record<string, number> = {};
  let currentSpeaker = sorted[0].speakerId;
  let turns = 1;
  
  for (const event of sorted) {
    if (event.speakerId !== currentSpeaker) {
      turns++;
      currentSpeaker = event.speakerId;
    }
    speakerCounts[event.speakerId] = (speakerCounts[event.speakerId] || 0) + 1;
  }
  
  // Calculate turn balance (Gini coefficient simplification)
  const counts = Object.values(speakerCounts);
  const total = counts.reduce((a, b) => a + b, 0);
  const mean = total / counts.length;
  const variance = counts.reduce((acc, c) => acc + Math.pow(c - mean, 2), 0) / counts.length;
  const balance = clamp(1 - (variance / (mean * mean + 0.01)), 0, 1);
  
  // Detect interruptions (turns < 2 seconds after previous)
  let interruptions = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].timestamp - (sorted[i-1].timestamp + sorted[i-1].duration);
    if (gap < -0.5) { // Negative gap = overlap
      interruptions++;
    }
  }
  
  // Calculate average turn duration
  const avgDuration = sorted.reduce((acc, e) => acc + e.duration, 0) / sorted.length;
  
  // Detect silences (gaps > 3 seconds)
  const silences: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].timestamp - (sorted[i-1].timestamp + sorted[i-1].duration);
    if (gap > 3) {
      silences.push(gap);
    }
  }
  
  return {
    totalTurns: turns,
    avgTurnDuration: avgDuration,
    turnBalance: balance,
    interruptions,
    silences
  };
}
