import { Router } from "express";
import { randomUUID } from "node:crypto";
import { MasterRow } from "../models/MasterRow.js";
import { MASTER_KEYS } from "../lib/masterTables.js";

export const mastersRouter = Router();

async function readMasterData() {
  const rows = await MasterRow.find().sort({ tableKey: 1, sortOrder: 1 }).lean();
  const data = Object.fromEntries(MASTER_KEYS.map((k) => [k, []]));
  for (const r of rows) {
    data[r.tableKey]?.push({
      id: r._id,
      name: r.name,
      code: r.code ?? undefined,
      notes: r.notes ?? undefined,
      active: !!r.active,
    });
  }
  return data;
}

// GET /api/masters
mastersRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await readMasterData());
  } catch (err) {
    next(err);
  }
});

// POST /api/masters/row  { key, row }
mastersRouter.post("/row", async (req, res, next) => {
  try {
    const { key, row } = req.body ?? {};
    if (!MASTER_KEYS.includes(key)) {
      return res.status(400).json({ error: `Unknown master table key: ${key}` });
    }
    if (!row || typeof row.name !== "string" || !row.name.trim()) {
      return res.status(400).json({ error: "Row name is required" });
    }

    const id = row.id || randomUUID();
    const existing = await MasterRow.findById(id);
    if (existing) {
      existing.name = row.name;
      existing.code = row.code ?? null;
      existing.notes = row.notes ?? null;
      existing.active = !!row.active;
      await existing.save();
    } else {
      const maxOrderDoc = await MasterRow.findOne({ tableKey: key }).sort({ sortOrder: -1 });
      const sortOrder = maxOrderDoc ? maxOrderDoc.sortOrder + 1 : 0;
      await MasterRow.create({
        _id: id,
        tableKey: key,
        name: row.name,
        code: row.code ?? null,
        notes: row.notes ?? null,
        active: !!row.active,
        sortOrder,
      });
    }
    res.json(await readMasterData());
  } catch (err) {
    next(err);
  }
});

// DELETE /api/masters/row/:id
mastersRouter.delete("/row/:id", async (req, res, next) => {
  try {
    await MasterRow.findByIdAndDelete(req.params.id);
    res.json(await readMasterData());
  } catch (err) {
    next(err);
  }
});
