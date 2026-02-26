import http from "http";
import { generateControlled, generateWithTools } from "./generate.js";

function readJson(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", c => data += c);
    req.on("end", () => { try { resolve(JSON.parse(data || "{}")); } catch(e){ reject(e); }});
  });
}

http.createServer(async (req,res)=>{
  if (req.method==="POST" && req.url==="/generate") {
    try{
      const body = await readJson(req);
      const mode = body.mode ?? "controlled";
      const modelBaseUrl = body.modelBaseUrl ?? "http://localhost:8080";
      const apiKey = body.apiKey;
      const input = body.input ?? body.userPrompt ?? "";
      const context = body.context;

      const out = (mode==="tools")
        ? await generateWithTools({ modelBaseUrl, apiKey, userPrompt: input, context, finalSchema: body.schemaName ?? "report" })
        : await generateControlled({ modelBaseUrl, apiKey, schemaName: body.schemaName ?? "report", userPrompt: input, context });

      res.statusCode = out.ok ? 200 : 400;
      res.setHeader("content-type","application/json");
      res.end(JSON.stringify(out));
    } catch(e:any){
      res.statusCode=500;
      res.setHeader("content-type","application/json");
      res.end(JSON.stringify({ok:false, error: e?.message ?? String(e)}));
    }
    return;
  }
  res.statusCode=404;
  res.end("not found");
}).listen(7777, ()=>console.log("runtime on http://localhost:7777"));
