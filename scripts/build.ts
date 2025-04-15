import { execSync } from "child_process";
import { existsSync } from "fs";
import path from "path";

try {
  const installed = existsSync(path.resolve(__dirname, "..", "node_modules"));
  if (!installed) {
    console.log("installing Packages\n");
    execSync("npm install", { stdio: "inherit" });
  }
  console.log("Building.....\n")
  execSync("rm -rf build && tsc -p tsconfig.json", { stdio: "inherit" });
} catch {
  console.error("Build failed");
  process.exit(1);
}
