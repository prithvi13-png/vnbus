const { spawn } = require("node:child_process");

const isWindows = process.platform === "win32";
const pnpm = isWindows ? "pnpm.cmd" : "pnpm";
const node = process.execPath;

let tscProcess;
let apiProcess;
let apiStarted = false;
let shuttingDown = false;

function run(command, args, options = {}) {
  return spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: options.stdio ?? "inherit",
    shell: false,
  });
}

function buildWorkspaceDependencies() {
  return new Promise((resolve, reject) => {
    const build = run(pnpm, ["--dir", "../..", "--filter", "@vnbus/api^...", "build"]);

    build.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Workspace dependency build failed with exit code ${code ?? "unknown"}`));
    });

    build.on("error", reject);
  });
}

function startApi() {
  if (apiStarted || shuttingDown) {
    return;
  }

  apiStarted = true;
  apiProcess = run(node, ["--watch", "dist/main.js"]);
}

function stopChildren() {
  shuttingDown = true;
  apiProcess?.kill("SIGTERM");
  tscProcess?.kill("SIGTERM");
}

async function main() {
  await buildWorkspaceDependencies();

  tscProcess = run(pnpm, ["exec", "tsc", "-p", "tsconfig.build.json", "--watch", "--preserveWatchOutput"], {
    stdio: "pipe",
  });

  tscProcess.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    process.stdout.write(text);

    if (text.includes("Found 0 errors. Watching for file changes.")) {
      startApi();
    }
  });
  tscProcess.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });
  tscProcess.on("exit", (code) => {
    if (!shuttingDown) {
      apiProcess?.kill("SIGTERM");
      process.exitCode = code ?? 1;
    }
  });
}

process.on("SIGINT", () => {
  stopChildren();
  process.exit(130);
});
process.on("SIGTERM", () => {
  stopChildren();
  process.exit(143);
});

main().catch((error) => {
  console.error(error);
  stopChildren();
  process.exit(1);
});
