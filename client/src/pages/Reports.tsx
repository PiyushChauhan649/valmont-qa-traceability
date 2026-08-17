import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, Eye, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DocumentViewer } from "@/components/DocumentViewer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_FIELDS, DIMENSIONAL_CHECKS, STEPS } from "@/lib/tracker-schema";
import { toCsv, type DocRef, type TraceRecord } from "@/lib/tracker-store";
import { deleteTraceRecord, getRecords } from "@/lib/api";

export function Reports() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState<TraceRecord | null>(null);
  const [docPreview, setDocPreview] = useState<DocRef | null>(null);

  const { data: records = [] } = useQuery({
    queryKey: ["records"],
    queryFn: () => getRecords(),
  });

  const removeMutation = useMutation({
    mutationFn: (input: { id: string }) => deleteTraceRecord({ data: input }),
    onSuccess: (next) => {
      queryClient.setQueryData(["records"], next);
      toast.success("Record deleted");
    },
    onError: () => toast.error("Could not delete — please try again"),
  });

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        const hay = Object.values(r.values).join(" ").toLowerCase();
        const matchQ = !query || hay.includes(query.toLowerCase());
        const matchS = status === "all" || (r.values["conclusion"] || "Pending") === status;
        return matchQ && matchS;
      }),
    [records, query, status],
  );

  function exportCsv() {
    const keys = [
      { key: "createdAt", label: "Created At" },
      ...ALL_FIELDS.map((f) => ({ key: f.key, label: f.label })),
    ];
    const blob = new Blob([toCsv(filtered, keys)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `traceability-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  }

  function remove(id: string) {
    removeMutation.mutate({ id });
  }

  return (
    <AppShell
      title="Reports"
      subtitle={`${filtered.length} of ${records.length} traceability records`}
      actions={
        <Button onClick={exportCsv} variant="outline">
          <Download className="size-4" /> Export CSV
        </Button>
      }
    >
      <div className="panel flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search SO, heat, coil, invoice, report no…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Lot Accepted">Lot Accepted</SelectItem>
            <SelectItem value="Lot Rejected">Lot Rejected</SelectItem>
            <SelectItem value="Concession Accepted">Concession Accepted</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="panel mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr className="label-caps">
              <th className="px-4 py-2">SO No.</th>
              <th className="px-4 py-2">Lot</th>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Heat / Coil</th>
              <th className="px-4 py-2">Grade</th>
              <th className="px-4 py-2">Offer / Acc / Rej</th>
              <th className="px-4 py-2">Final Report</th>
              <th className="px-4 py-2">Invoice</th>
              <th className="px-4 py-2">Docs</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-muted/40">
                <td className="px-4 py-2 font-mono">
                  <button type="button" className="hover:underline" onClick={() => setOpen(r)}>
                    {r.values["soNo"]}
                  </button>
                </td>
                <td className="px-4 py-2">{r.values["lotNo"] || "—"}</td>
                <td className="px-4 py-2">{r.values["product"]}</td>
                <td className="px-4 py-2 font-mono text-xs">
                  {r.values["heatNo"] || "—"} / {r.values["coilNo"] || "—"}
                </td>
                <td className="px-4 py-2">{r.values["grade"] || "—"}</td>
                <td className="px-4 py-2 font-mono text-xs">
                  {r.values["offerQty"] || 0} / {r.values["acceptedQty"] || 0} /{" "}
                  {r.values["rejectedQty"] || 0}
                </td>
                <td className="px-4 py-2 font-mono text-xs">
                  {r.values["finalReportNo"] ? (
                    <button type="button" className="hover:underline" onClick={() => setOpen(r)}>
                      {r.values["finalReportNo"]}
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-2 font-mono text-xs">{r.values["invoiceNo"] || "—"}</td>
                <td className="px-4 py-2">{r.docs.length}</td>
                <td className="px-4 py-2">
                  <Badge
                    variant={
                      r.values["conclusion"] === "Lot Accepted"
                        ? "default"
                        : r.values["conclusion"] === "Lot Rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {r.values["conclusion"] || "Pending"}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-right">
                  <Button variant="ghost" size="icon" onClick={() => setOpen(r)}>
                    <Eye className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">
                  No records match your filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {open?.values["soNo"]} · Lot {open?.values["lotNo"] || "—"}
            </DialogTitle>
            <DialogDescription>{open?.values["product"]}</DialogDescription>
          </DialogHeader>
          {open ? (
            <div className="space-y-5">
              {STEPS.map((s) => (
                <div key={s.id}>
                  <h3 className="label-caps">{s.title}</h3>
                  <dl className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                    {s.fields.map((f) => (
                      <div
                        key={f.key}
                        className="flex justify-between gap-3 border-b border-border/60 py-1"
                      >
                        <dt className="text-xs text-muted-foreground">{f.label}</dt>
                        <dd className="text-right text-xs font-medium">
                          {open.values[f.key] || "—"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
              {Object.keys(open.checks).length ? (
                <div>
                  <h3 className="label-caps">Dimensional Checks</h3>
                  <table className="mt-2 w-full text-xs">
                    <tbody className="divide-y divide-border">
                      {DIMENSIONAL_CHECKS.filter((c) => open.checks[c.sr]?.observed).map((c) => (
                        <tr key={c.sr}>
                          <td className="py-1">{c.parameter}</td>
                          <td className="py-1 font-mono">{c.specified}</td>
                          <td className="py-1 font-mono">{open.checks[c.sr]?.observed}</td>
                          <td className="py-1">{open.checks[c.sr]?.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {open.docs.length ? (
                <div>
                  <h3 className="label-caps">Documents</h3>
                  <ul className="mt-2 space-y-1.5 text-xs">
                    {open.docs.map((d) => (
                      <li key={d.id} className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {d.id}
                        </Badge>
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => setDocPreview(d)}
                        >
                          {d.name}
                        </button>
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          {d.docType || "Other"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <DocumentViewer
        doc={docPreview}
        onOpenChange={(v) => !v && setDocPreview(null)}
        contextLabel={
          docPreview
            ? `${open?.values["soNo"]} / Lot ${open?.values["lotNo"] || "—"} · ${docPreview.docType}`
            : undefined
        }
      />
    </AppShell>
  );
}
