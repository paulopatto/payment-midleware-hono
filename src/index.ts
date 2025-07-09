import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();
const PORT = process.env.PORT ?? 8080;

app.get("/", (c) => c.text("Hello Node.js!"));
app.get("/health", (c) =>
  c.json({
    services: [
      {
        api: { status: "UP" },
        workers: { status: "OK" },
        payment_processor_default: { status: "UP" },
        payment_processor_fallback: { status: "UP" },
      },
    ],
  }),
);
app.get("/payments-summary", (c) => c.json({ status: "OK" }));
app.post("/payments", (c) =>
  c.json({ status: "created" }, 201, { headers: [`Location: ::uuid::`] }),
);

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

