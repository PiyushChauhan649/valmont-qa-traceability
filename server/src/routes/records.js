import { Router } from "express";
import { randomUUID } from "node:crypto";
import { TraceRecord } from "../models/TraceRecord.js";

export const recordsRouter = Router();

function toClientRecord(r) {
  return {
    id: r._id,
    createdAt: r.createdAt,
    values: r.values ?? {},
    checks: r.checks ?? {},
    docs: r.docs ?? [],
  };
}

async function listRecords() {
  const rows = await TraceRecord.find().sort({ createdAt: -1 }).lean();
  return rows.map((r) => toClientRecord({ ...r, _id: r._id }));
}

// GET /api/records
recordsRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await listRecords());
  } catch (err) {
    next(err);
  }
});

// GET /api/records/next-doc-id
recordsRouter.get("/next-doc-id", async (_req, res, next) => {
  try {
    const rows = await TraceRecord.find({}, { docs: 1 }).lean();
    let max = 0;
    for (const r of rows) {
      for (const d of r.docs ?? []) {
        const m = /^DOC-(\d+)$/.exec(d.id ?? "");
        if (m) max = Math.max(max, Number(m[1]));
      }
    }
    res.json({ nextDocId: `DOC-${String(max + 1).padStart(4, "0")}` });
  } catch (err) {
    next(err);
  }
});

// POST /api/records  (full TraceRecord payload: { id, createdAt, values, checks, docs })
recordsRouter.post("/", async (req, res, next) => {
  try {
    const data = req.body ?? {};
    if (!data.values || typeof data.values !== "object") {
      return res.status(400).json({ error: "Record 'values' are required" });
    }
    await TraceRecord.create({
      _id: data.id || randomUUID(),
      createdAt: data.createdAt || new Date().toISOString(),
      values: data.values,
      checks: data.checks ?? {},
      docs: data.docs ?? [],
    });
    res.status(201).json(await listRecords());
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: "A record with this id already exists" });
    }
    next(err);
  }
});

// PATCH /api/records/:id/docs  { docs: DocRef[] }
recordsRouter.patch("/:id/docs", async (req, res, next) => {
  try {
    const { docs } = req.body ?? {};
    if (!Array.isArray(docs)) {
      return res.status(400).json({ error: "'docs' must be an array" });
    }
    const record = await TraceRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }
    record.docs = docs;
    await record.save();
    res.json(await listRecords());
  } catch (err) {
    next(err);
  }
});

// DELETE /api/records/:id
recordsRouter.delete("/:id", async (req, res, next) => {
  try {
    await TraceRecord.findByIdAndDelete(req.params.id);
    res.json(await listRecords());
  } catch (err) {
    next(err);
  }
});
