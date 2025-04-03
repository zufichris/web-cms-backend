import { execSync } from "child_process";

const command = `npx eslint "src/**/*" "scripts/**/*"`;

try {
  const output = execSync(command, { stdio: "pipe" });
  if (output.toString().trim() === "") {
    console.log("Linting passed with no issues.");
  } else {
    console.log("Linting passed:", output.toString());
  }
  //eslint-disable-next-line
} catch (error: any) {
  if (error.status === 1) {
    console.error("Linting issues found:\n", error.stdout.toString());
  } else {
    console.error("ESLint error:\n", error.stderr.toString());
  }
  process.exit(1);
}
