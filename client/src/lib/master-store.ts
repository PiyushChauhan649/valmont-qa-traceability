/**
 * Master Tables
 * Central, editable reference data used across the traceability system:
 * Products, Customers, Suppliers, Grades, Machines, Operators and Document Types.
 * Every record is a simple { id, name, ...extra } row that select fields and
 * document tagging resolve against, instead of the values being hard-coded.
 *
 * Data is persisted server-side (MongoDB, see server/src/models/MasterRow.js)
 * and reached through the REST client in src/lib/api.ts. This file only holds
 * the shared types/table defs and small pure helpers used by the client UI.
 */

export interface MasterRow {
  id: string;
  name: string;
  code?: string | undefined;
  notes?: string | undefined;
  active: boolean;
}

export type MasterKey =
  "products" | "customers" | "suppliers" | "grades" | "machines" | "operators" | "documentTypes";

export type MasterData = Record<MasterKey, MasterRow[]>;

export interface MasterTableDef {
  key: MasterKey;
  label: string;
  singular: string;
  nameLabel: string;
  codeLabel?: string;
  hint: string;
}

export const MASTER_TABLES: MasterTableDef[] = [
  {
    key: "products",
    label: "Products",
    singular: "Product",
    nameLabel: "Product name",
    codeLabel: "QAD Part No.",
    hint: "Product / SKU catalogue offered against sales orders",
  },
  {
    key: "customers",
    label: "Customers",
    singular: "Customer",
    nameLabel: "Customer name",
    codeLabel: "Customer code",
    hint: "Buyers that sales orders and lots are raised against",
  },
  {
    key: "suppliers",
    label: "Suppliers",
    singular: "Supplier",
    nameLabel: "Supplier / mill name",
    codeLabel: "Vendor code",
    hint: "Raw material mills and vendors supplying coil / heats",
  },
  {
    key: "grades",
    label: "Grades",
    singular: "Grade",
    nameLabel: "Grade",
    codeLabel: "Standard",
    hint: "Steel grades used for raw material classification",
  },
  {
    key: "machines",
    label: "Machines",
    singular: "Machine",
    nameLabel: "Machine name",
    codeLabel: "Machine code",
    hint: "Production lines / machines used to manufacture lots",
  },
  {
    key: "operators",
    label: "Operators",
    singular: "Operator",
    nameLabel: "Operator name",
    codeLabel: "Employee ID",
    hint: "Machine operators and inspectors recorded against lots",
  },
  {
    key: "documentTypes",
    label: "Document Types",
    singular: "Document Type",
    nameLabel: "Document type",
    codeLabel: "Short code",
    hint: "Categories used to tag every uploaded certificate / report",
  },
];

export function activeOptions(data: MasterData, key: MasterKey): string[] {
  return data[key].filter((r) => r.active).map((r) => r.name);
}

export function newRow(): MasterRow {
  return { id: crypto.randomUUID(), name: "", code: "", active: true };
}
