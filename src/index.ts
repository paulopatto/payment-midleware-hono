import { serve } from "@hono/node-server";
import app from "./app";

const PORT = process.env.PORT ?? 8080;

console.log(`Server is running. Listening on port ${PORT}...`);
console.log(`Press [ctrl] + C (^C) to exit.`);

const server = serve({ fetch: app.fetch, port: Number(PORT) });

// graceful shutdown
process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});

