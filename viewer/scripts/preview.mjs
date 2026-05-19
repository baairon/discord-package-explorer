import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");

function runShell(cmd, env) {
  const r = spawnSync(cmd, {
    stdio: "inherit",
    shell: true,
    cwd: REPO_ROOT,
    env: { ...process.env, ...(env ?? {}) },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function runNode(scriptPath, env) {
  const r = spawnSync(process.execPath, [scriptPath], {
    stdio: "inherit",
    cwd: REPO_ROOT,
    env: { ...process.env, ...(env ?? {}) },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

runNode(join(__dirname, "build-demo-snapshot.mjs"));
runShell("npm --prefix viewer run build", { VITE_DEMO: "1" });
runShell("npm --prefix viewer run preview");
