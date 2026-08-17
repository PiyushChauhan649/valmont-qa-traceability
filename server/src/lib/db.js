import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { MasterRow } from "../models/MasterRow.js";
import { TraceRecord } from "../models/TraceRecord.js";
import { MASTER_KEYS } from "./masterTables.js";
import { seedMasterRows, seedTraceRecords } from "./seedData.js";

export async function connectDb() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/valmont_qa_traceability";
  await mongoose.connect(uri);
  console.log(`[db] connected to ${uri}`);
  await seedIfEmpty();
}

async function seedIfEmpty() {
  const masterCount = await MasterRow.countDocuments();
  if (masterCount === 0) {
    const seed = seedMasterRows();
    const docs = [];
    for (const key of MASTER_KEYS) {
      seed[key].forEach((r, i) => {
        docs.push({
          _id: randomUUID(),
          tableKey: key,
          name: r.name,
          code: r.code ?? null,
          notes: null,
          active: true,
          sortOrder: i,
        });
      });
    }
    await MasterRow.insertMany(docs);
    console.log(`[db] seeded ${docs.length} master rows`);
  }

  const recordCount = await TraceRecord.countDocuments();
  if (recordCount === 0) {
    const records = seedTraceRecords().map((r) => ({
      _id: r.id,
      createdAt: r.createdAt,
      values: r.values,
      checks: r.checks,
      docs: r.docs,
    }));
    await TraceRecord.insertMany(records);
    console.log(`[db] seeded ${records.length} trace records`);
  }
}
