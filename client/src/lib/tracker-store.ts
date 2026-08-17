import { DIMENSIONAL_CHECKS } from "./tracker-schema";

export interface DocRef {
  /** Unique document ID, e.g. DOC-0001. Stable identifier used for traceability and search. */
  id: string;
  name: string;
  size: number;
  type: string;
  /** Master "documentTypes" category this upload was tagged with (e.g. Mill Test Certificate). */
  docType: string;
  addedAt: string;
  dataUrl?: string | undefined;
  recordId?: string | undefined;
  /** Denormalized order/lot tag, so the document stays traceable even shown outside its record. */
  soNo?: string | undefined;
  lotNo?: string | undefined;
}

export interface CheckObservation {
  observed?: string | undefined;
  result?: string | undefined;
}

export interface TraceRecord {
  id: string;
  createdAt: string;
  values: Record<string, string>;
  checks: Record<string, CheckObservation>;
  docs: DocRef[];
}

/**
 * Generates a short, human-friendly, unique document ID like DOC-0007, based
 * on all docs across all currently-loaded records. Used for optimistic client
 * IDs when attaching a file before the record has been saved to the server
 * (e.g. mid-way through the New Record wizard). The server independently
 * assigns/validates IDs the same way via nextDocIdFromDb.
 */
export function nextDocId(allRecords: TraceRecord[]): string {
  let max = 0;
  for (const r of allRecords) {
    for (const d of r.docs) {
      const m = /^DOC-(\d+)$/.exec(d.id ?? "");
      if (m) max = Math.max(max, Number(m[1]));
    }
  }
  return `DOC-${String(max + 1).padStart(4, "0")}`;
}

export function emptyChecks(): Record<string, CheckObservation> {
  return Object.fromEntries(DIMENSIONAL_CHECKS.map((c) => [c.sr, {}]));
}

export function num(v?: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function toCsv(records: TraceRecord[], keys: Array<{ key: string; label: string }>) {
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const head = keys.map((k) => esc(k.label)).join(",");
  const body = records
    .map((r) =>
      keys.map((k) => esc(k.key === "createdAt" ? r.createdAt : (r.values[k.key] ?? ""))).join(","),
    )
    .join("\n");
  return `${head}\n${body}`;
}
