export type ToolName = "calcEphemeris" | "scoreCompatibility" | "rankNearbyStylists";

export async function runTool(tool: ToolName, args: any) {
  // Replace stubs with your real engines
  switch (tool) {
    case "calcEphemeris": return { ok:true, note:"stub", args };
    case "scoreCompatibility": return { ok:true, score:0.73, note:"stub", args };
    case "rankNearbyStylists": return { ok:true, results:[], note:"stub", args };
    default: throw new Error(`Unknown tool: ${tool}`);
  }
}
