#!/usr/bin/env node
import { parseArgs } from "node:util";
import {
  runHTTPStreamableServer,
  runSSEServer,
  runStdioServer,
} from "./server";

/**
 * 🧠 Smart entrypoint: detects environment (Zeabur / local CLI)
 * Zeabur → HTTP streamable
 * Local CLI → stdio/sse/streamable modes via args
 */
async function main() {
  // ✅ [1] Zeabur / Cloud Mode: auto-detect by PORT or ZEABUR env
  if (process.env.ZEABUR || process.env.PORT) {
    const host = process.env.HOST || "0.0.0.0";
    const port = Number(process.env.PORT) || 8080;
    const endpoint = "/mcp";

    console.log(`🚀 Detected Zeabur environment`);
    console.log(`✅ Starting MCP Server on http://${host}:${port}${endpoint}`);

    await runHTTPStreamableServer(host, port, endpoint);
    return;
  }

  // ✅ [2] Local CLI Mode (original MCP-Server-Chart behavior)
  const { values } = parseArgs({
    options: {
      transport: {
        type: "string",
        short: "t",
        default: "stdio",
      },
      host: {
        type: "string",
        short: "h",
        default: "localhost",
      },
      port: {
        type: "string",
        short: "p",
        default: "1122",
      },
      endpoint: {
        type: "string",
        short: "e",
        default: "", // handled per transport type
      },
      help: {
        type: "boolean",
        short: "H",
      },
    },
  });

  if (values.help) {
    console.log(`
MCP Server Chart CLI

Options:
  --transport, -t  Transport protocol: "stdio", "sse", or "streamable" (default: "stdio")
  --host, -h       Host for SSE or Streamable (default: localhost)
  --port, -p       Port for SSE or Streamable (default: 1122)
  --endpoint, -e   Endpoint for transport (default depends on type)
  --help, -H       Show this help message
    `);
    process.exit(0);
  }

  const transport = (values.transport || "stdio").toLowerCase();

  if (transport === "sse") {
    const port = Number.parseInt(values.port as string, 10);
    const endpoint = values.endpoint || "/sse";
    const host = values.host || "localhost";
    console.log(`🔸 Starting SSE server at http://${host}:${port}${endpoint}`);
    await runSSEServer(host, port, endpoint);
  } else if (transport === "streamable") {
    const port = Number.parseInt(values.port as string, 10);
    const endpoint = values.endpoint || "/mcp";
    const host = values.host || "localhost";
    console.log(`🔸 Starting HTTP Streamable server at http://${host}:${port}${endpoint}`);
    await runHTTPStreamableServer(host, port, endpoint);
  } else {
    console.log(`🔸 Starting STDIO transport`);
    await runStdioServer();
  }
}

main().catch((err) => {
  console.error("❌ MCP Server failed to start:", err);
  process.exit(1);
});
