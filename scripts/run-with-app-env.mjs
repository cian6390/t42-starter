import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const app = process.env.T42_ENV_APP ?? "studio";
const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Usage: node scripts/run-with-app-env.mjs <command> [args...]");
  console.error("Loads apps/<app>/.env first (default app: studio, override: T42_ENV_APP).");
  process.exit(1);
}

const envPath = resolve(rootDir, "apps", app, ".env");

if (!existsSync(envPath)) {
  console.error(`Missing ${envPath}`);
  console.error(`Copy apps/${app}/.env.example to apps/${app}/.env and fill in values.`);
  process.exit(1);
}

loadEnvFile(envPath);

const result = spawnSync(command, args, {
  cwd: rootDir,
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
