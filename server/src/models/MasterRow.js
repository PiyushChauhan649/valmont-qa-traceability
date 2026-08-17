import mongoose from "mongoose";

const { Schema } = mongoose;

const masterRowSchema = new Schema(
  {
    _id: { type: String, required: true }, // uuid, matches client-generated MasterRow.id
    tableKey: {
      type: String,
      required: true,
      enum: ["products", "customers", "suppliers", "grades", "machines", "operators", "documentTypes"],
      index: true,
    },
    name: { type: String, required: true },
    code: { type: String, default: null },
    notes: { type: String, default: null },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { versionKey: false, _id: false },
);

export const MasterRow = mongoose.model("MasterRow", masterRowSchema);
