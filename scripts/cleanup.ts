import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const pathsToRemove = ["logs", "build", "node_modules", "package-lock.json"];

async function confirmRemoval(): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(
      "The following will be deleted? (y/n): \n".concat(pathsToRemove.join("\n")),
      (answer) => {
        resolve(answer.toLowerCase() === "y");
      },
    );
  });
}

async function removeDirectory(dir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(`rm -rf ${dir}`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function cleanCache(): Promise<void> {
  return new Promise((resolve, reject) => {
    exec("npm cache clean --force", (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  console.log("Starting cleanup process...");

  const shouldProceed = await confirmRemoval();
  if (!shouldProceed) {
    console.log("Cleanup aborted by user.");
    process.exit(0);
  }

  for (const p of pathsToRemove) {
    const dir = path.resolve(__dirname, "..", p);
    if (fs.existsSync(dir)) {
      try {
        await removeDirectory(dir);
        console.log(`Successfully removed: ${p}`);
      } catch (error) {
        console.error(`Error removing ${p}:`, error);
        process.exit(1);
      }
    } else {
      console.log(`Directory not found: ${p}`);
    }
  }

  try {
    await cleanCache();
    console.log("NPM cache cleaned successfully.");
  } catch (error) {
    console.error("Error cleaning NPM cache:", error);
    process.exit(1);
  }

  console.log("Cleanup process completed.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
