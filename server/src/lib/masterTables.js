/**
 * Master table keys. Mirrors the `MASTER_TABLES` definitions in
 * client/src/lib/master-store.ts — the server only needs the keys (for
 * validation + seeding), the full label/hint metadata lives client-side.
 */
export const MASTER_KEYS = [
  "products",
  "customers",
  "suppliers",
  "grades",
  "machines",
  "operators",
  "documentTypes",
];
