import http from "http";
import httpProxy from "http-proxy";

const API_KEY = process.env.API_KEY || "change-me";
const TARGET = "http://vllm:8000";
const proxy = httpProxy.createProxyServer({ target: TARGET, changeOrigin: true });

function unauthorized(res){
  res.statusCode=401;
  res.setHeader("content-type","application/json");
  res.end(JSON.stringify({error:"unauthorized"}));
}

http.createServer((req,res)=>{
  if (req.headers["x-api-key"] !== API_KEY) return unauthorized(res);
  proxy.web(req,res,{ target: TARGET });
}).listen(8080, ()=>console.log("proxy :8080 ->", TARGET));
