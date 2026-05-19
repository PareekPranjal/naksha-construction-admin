import { spawn } from "node:child_process";
import net from "node:net";

const [, , mode, ...rest] = process.argv;
if (mode !== "dev" && mode !== "start") {
  console.error(`Usage: node scripts/run-next.mjs <dev|start>`);
  process.exit(1);
}

const preferred = [4001, 4002, 4003, 4004, 4005];

function tryPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => resolve(null));
    server.listen({ port, host: "0.0.0.0", exclusive: true }, () => {
      const { port: actual } = server.address();
      server.close(() => resolve(actual));
    });
  });
}

async function findPort() {
  for (const p of preferred) {
    const found = await tryPort(p);
    if (found) return found;
  }
  const random = await tryPort(0);
  if (random) return random;
  throw new Error("No free port available");
}

const port = await findPort();
console.log(`[run-next] starting next ${mode} on port ${port}`);

const child = spawn("next", [mode, "-p", String(port), ...rest], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
