import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentViewer } from "@/components/DocumentViewer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { nextDocId, type DocRef } from "@/lib/tracker-store";
import { activeOptions, type MasterData, MASTER_TABLES } from "@/lib/master-store";
import { getMasterData, getRecords, updateTraceRecordDocs } from "@/lib/api";

const EMPTY_MASTER_DATA: MasterData = Object.fromEntries(
  MASTER_TABLES.map((t) => [t.key, []]),
) as unknown as MasterData;

type LibraryDoc = DocRef & { recordSo: string; recordLot: string; product: string };

export function Documents() {
  const queryClient = useQueryClient();
  const [selectedOverride, setSelectedOverride] = useState<string>("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [preview, setPreview] = useState<LibraryDoc | null>(null);

  const { data: records = [] } = useQuery({
    queryKey: ["records"],
    queryFn: () => getRecords(),
  });
  const { data: master = EMPTY_MASTER_DATA } = useQuery({
    queryKey: ["masters"],
    queryFn: () => getMasterData(),
  });

  const selected = selectedOverride || (records[0]?.id ?? "");
  const active = useMemo(() => records.find((r) => r.id === selected), [records, selected]);
  const documentTypes = useMemo(() => activeOptions(master, "documentTypes"), [master]);

  const docsMutation = useMutation({
    mutationFn: (input: { id: string; docs: DocRef[] }) => updateTraceRecordDocs({ data: input }),
    onSuccess: (next) => {
      queryClient.setQueryData(["records"], next);
      toast.success("Documents updated");
    },
    onError: () => toast.error("Could not update documents — please try again"),
  });

  function updateDocs(docs: DocRef[]) {
    if (!selected) return;
    docsMutation.mutate({ id: selected, docs });
  }

  const allDocs: LibraryDoc[] = useMemo(
    () =>
      records.flatMap((r) =>
        r.docs.map((d) => ({
          ...d,
          recordId: d.recordId ?? r.id,
          recordSo: r.values["soNo"] ?? "",
          recordLot: r.values["lotNo"] ?? "",
          product: r.values["product"] ?? "",
        })),
      ),
    [records],
  );

  const filteredDocs = useMemo(
    () =>
      allDocs.filter((d) => {
        const hay = `${d.name} ${d.id} ${d.recordSo} ${d.recordLot} ${d.docType}`.toLowerCase();
        const matchQ = !query || hay.includes(query.toLowerCase());
        const matchT = typeFilter === "all" || d.docType === typeFilter;
        return matchQ && matchT;
      }),
    [allDocs, query, typeFilter],
  );

  return (
    <AppShell title="Documents" subtitle="Attach certificates and reports to any lot">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-base font-semibold">Upload to a lot</h2>
          <div className="mt-4 space-y-1.5">
            <Label className="text-xs">Traceability record</Label>
            <Select value={selected} onValueChange={setSelectedOverride}>
              <SelectTrigger>
                <SelectValue placeholder="Select record" />
              </SelectTrigger>
              <SelectContent>
                {records.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.values["soNo"]} · Lot {r.values["lotNo"] || "—"} · {r.values["product"]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4">
            {active ? (
              <DocumentUpload
                docs={active.docs}
                onChange={updateDocs}
                documentTypes={documentTypes}
                nextDocId={() => nextDocId(records)}
                orderRef={{ soNo: active.values["soNo"], lotNo: active.values["lotNo"] }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Create a record first to attach documents.
              </p>
            )}
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-base font-semibold">Document library</h2>
          <p className="text-sm text-muted-foreground">{allDocs.length} files across all lots</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="relative min-w-40 flex-1">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-xs"
                placeholder="Search doc ID, name, SO…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All document types</SelectItem>
                {documentTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ul className="mt-4 divide-y divide-border">
            {filteredDocs.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                  {d.id}
                </Badge>
                <button
                  type="button"
                  onClick={() => setPreview(d)}
                  className="min-w-0 flex-1 truncate text-left hover:underline"
                >
                  {d.name}
                </button>
                <Badge variant="secondary" className="shrink-0 text-[10px] font-normal">
                  {d.docType || "Other"}
                </Badge>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {d.recordSo || "—"} / {d.recordLot || "—"}
                </span>
              </li>
            ))}
            {filteredDocs.length === 0 ? (
              <li className="py-10 text-center text-sm text-muted-foreground">
                {allDocs.length === 0
                  ? "No documents uploaded yet."
                  : "No documents match your filters."}
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <DocumentViewer
        doc={preview}
        onOpenChange={(open) => !open && setPreview(null)}
        contextLabel={
          preview
            ? `${preview.recordSo} / Lot ${preview.recordLot || "—"} · ${preview.docType}`
            : undefined
        }
      />
    </AppShell>
  );
}
