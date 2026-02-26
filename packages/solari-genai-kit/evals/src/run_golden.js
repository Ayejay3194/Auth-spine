import fetch from "node-fetch";
import fs from "fs";

const runtimeUrl = process.env.RUNTIME_URL || "http://localhost:7777/generate";
const modelBaseUrl = process.env.MODEL_BASE_URL || "http://localhost:8080";
const apiKey = process.env.API_KEY || undefined;

const goldens = JSON.parse(fs.readFileSync(new URL("./golden_prompts.json", import.meta.url)));

let pass=0, fail=0;
for (const g of goldens) {
  const res = await fetch(runtimeUrl, {
    method:"POST",
    headers:{"content-type":"application/json"},
    body: JSON.stringify({ mode:g.mode, schemaName:g.schemaName, modelBaseUrl, apiKey, input:g.input, context:g.context })
  });
  const body = await res.json().catch(()=>({}));
  if (body.ok) { console.log("PASS", g.name); pass++; }
  else { console.log("FAIL", g.name, body.error, body.errors||""); fail++; }
}
console.log({pass, fail});
process.exit(fail?1:0);
