import { exec } from "child_process";
exec(
  'npx prettier --write "src/**/*.ts"  "scripts/**/*.ts"',
  function (error, stdout, stderr) {
    if (error) {
      console.error(`Error Formatting \n ${stderr}`, error);
      process.exit(1);
    }
    console.info("Files Formatted:\n".concat(stdout));
  },
);
