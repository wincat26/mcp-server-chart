import express from "express";
import { createServer } from "http";

/**
 * SSE transport
 */
export async function runSSEServer(
  host = "localhost",
  port = 1122,
  endpoint = "/sse"
): Promise<void> {
  const app = express();

  app.get(endpoint, (_, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("data: SSE Server Active\n\n");
  });

  app.get("/", (_, res) => {
    res.send("<h2>✅ SSE Server Running</h2>");
  });

  app.listen(port, host, () => {
    console.log(`✅ SSE Server listening at http://${host}:${port}${endpoint}`);
  });
}

/**
 * HTTP Streamable transport (Zeabur / cloud use)
 */
export async function runHTTPStreamableServer(
  host = "0.0.0.0",
  port = 8080,
  endpoint = "/mcp"
): Promise<void> {
  const app = express();
  app.use(express.json());

  // 🟢 Root page
  app.get("/", (_, res) => {
    res.send(`
      <h2>✅ MCP Server Chart 已啟動</h2>
      <p>請使用 Claude Desktop 或其他 MCP Client 連線到：<code>${endpoint}</code></p>
    `);
  });

  // 🟢 Health check
  app.get("/health", (_, res) => {
    res.status(200).json({ status: "ok" });
  });

  // 🟢 MCP endpoint
  app.post(endpoint, (req, res) => {
    console.log("📩 Received MCP Request:", req.body);
    res.json({
      message: "🧩 MCP endpoint received request successfully",
      input: req.body,
    });
  });

  const server = createServer(app);
  server.listen(port, host, () => {
    console.log(`✅ Streamable HTTP Server listening on http://${host}:${port}${endpoint}`);
  });
}

/**
 * STDIO transport (local CLI)
 */
export async function runStdioServer(): Promise<void> {
  console.log("🖥 STDIO transport ready — waiting for input...");
  process.stdin.on("data", (chunk) => {
    console.log("📨 Received:", chunk.toString());
  });
}
