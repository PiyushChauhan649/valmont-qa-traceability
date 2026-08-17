import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./lib/db.js";
import { mastersRouter } from "./routes/masters.js";
import { recordsRouter } from "./routes/records.js";

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
// Documents are stored as base64 data URLs inline on the record, so allow a
// generously sized JSON body (mirrors the ~900KB MAX_INLINE cutoff the
// client already enforces per-file, plus room for several attachments).
app.use(express.json({ limit: "15mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/masters", mastersRouter);
app.use("/api/records", recordsRouter);

// 404 for unknown API routes
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// Central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
