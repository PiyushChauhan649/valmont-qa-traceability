import mongoose from "mongoose";

const { Schema } = mongoose;

const docRefSchema = new Schema(
  {
    id: { type: String, required: true }, // e.g. DOC-0001
    name: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    docType: { type: String, required: true },
    addedAt: { type: String, required: true },
    dataUrl: { type: String },
    recordId: { type: String },
    soNo: { type: String },
    lotNo: { type: String },
  },
  { _id: false },
);

const traceRecordSchema = new Schema(
  {
    _id: { type: String, required: true }, // uuid, matches client-generated TraceRecord.id
    createdAt: { type: String, required: true },
    // Free-form step field values (soNo, lotNo, product, heatNo, ...) — kept as a
    // loose object, same shape as the SQLite `values_json` column used to hold.
    values: { type: Schema.Types.Mixed, default: {} },
    // Dimensional-check observations keyed by check "sr" id.
    checks: { type: Schema.Types.Mixed, default: {} },
    docs: { type: [docRefSchema], default: [] },
  },
  { versionKey: false, _id: false },
);

export const TraceRecord = mongoose.model("TraceRecord", traceRecordSchema);
