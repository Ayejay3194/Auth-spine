import { execSync } from "node:child_process";

function run(cmd) {
  try { console.log("\n$", cmd); execSync(cmd, { stdio: "inherit" }); return true; }
  catch { console.error("FAILED:", cmd); return false; }
}

let ok = true;
ok = run("npm audit --audit-level=high") && ok;
ok = run("node tools/security/secret-scan.mjs") && ok;
process.exit(ok ? 0 : 1);
