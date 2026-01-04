import fs from "node:fs";
import path from "node:path";

const patterns = [
  /sk_(live|test)_[0-9a-zA-Z]{10,}/g,
  /whsec_[0-9a-zA-Z]{10,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----/g,
];

const ignore = new Set(["node_modules",".git","dist","build",".next"]);
const hits = [];

function safeRead(p) {
  try {
    const ext = path.extname(p).toLowerCase();
    if ([".png",".jpg",".jpeg",".gif",".zip",".pdf",".woff",".woff2",".mp4"].includes(ext)) return null;
    return fs.readFileSync(p, "utf8");
  } catch { return null; }
}

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignore.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile()) {
      const t = safeRead(p);
      if (!t) continue;
      for (const re of patterns) {
        const m = t.match(re);
        if (m) hits.push({ file: p, match: m[0].slice(0, 80) });
      }
    }
  }
}

walk(process.cwd());

if (hits.length) {
  console.log("Potential secret leaks found:");
  for (const h of hits) console.log(`- ${h.file}: ${h.match}`);
  process.exit(1);
}
console.log("Secret scan: clean");
