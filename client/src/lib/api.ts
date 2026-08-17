/**
 * Client-side API layer — talks to the Express + MongoDB backend over REST.
 * This replaces the old `server-fns.ts` (TanStack Start RPCs). Every
 * function keeps the same name/shape as before (including the
 * `fn({ data: ... })` calling convention) so the route/page components
 * barely had to change when the app was ported from TanStack Start to a
 * plain Vite + Express MERN stack.
 */
import type { MasterData, MasterKey, MasterRow } from "./master-store";
import type { DocRef, TraceRecord } from "./tracker-store";

const API_BASE = import.meta.env["VITE_API_BASE_URL"] || "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Master tables
// ---------------------------------------------------------------------------

export async function getMasterData(): Promise<MasterData> {
  return request<MasterData>("/masters");
}

export async function saveMasterRow(opts: {
  data: { key: MasterKey; row: MasterRow };
}): Promise<MasterData> {
  return request<MasterData>("/masters/row", {
    method: "POST",
    body: JSON.stringify(opts.data),
  });
}

export async function deleteMasterRow(opts: { data: { id: string } }): Promise<MasterData> {
  return request<MasterData>(`/masters/row/${encodeURIComponent(opts.data.id)}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// Traceability records
// ---------------------------------------------------------------------------

export async function getRecords(): Promise<TraceRecord[]> {
  return request<TraceRecord[]>("/records");
}

export async function getNextDocId(): Promise<string> {
  const { nextDocId } = await request<{ nextDocId: string }>("/records/next-doc-id");
  return nextDocId;
}

export async function createTraceRecord(opts: { data: TraceRecord }): Promise<TraceRecord[]> {
  return request<TraceRecord[]>("/records", {
    method: "POST",
    body: JSON.stringify(opts.data),
  });
}

export async function updateTraceRecordDocs(opts: {
  data: { id: string; docs: DocRef[] };
}): Promise<TraceRecord[]> {
  return request<TraceRecord[]>(`/records/${encodeURIComponent(opts.data.id)}/docs`, {
    method: "PATCH",
    body: JSON.stringify({ docs: opts.data.docs }),
  });
}

export async function deleteTraceRecord(opts: { data: { id: string } }): Promise<TraceRecord[]> {
  return request<TraceRecord[]>(`/records/${encodeURIComponent(opts.data.id)}`, {
    method: "DELETE",
  });
}
