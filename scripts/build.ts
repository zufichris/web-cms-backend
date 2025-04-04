import { execSync } from "child_process";

try {
  execSync("tsc -p tsconfig.json", { stdio: "inherit" });
  console.log("Build succeeded");
} catch {
  console.error("Build failed");
  process.exit(1);
}
