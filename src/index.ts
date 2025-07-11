import { serve } from "@hono/node-server";
import { env } from "./env";
import app from "./app";

const PORT = env.PORT;

const server = serve(
  { fetch: app.fetch, port: Number(PORT) },
  ({ address, port }) => {
    console.log(`Server is running on ${address}:${port}...`);
    console.log(`Press [ctrl] + C (^C) to exit.`);
  },
);

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

