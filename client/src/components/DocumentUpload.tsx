import { useRef, useState } from "react";
import { Eye, FileUp, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentViewer } from "@/components/DocumentViewer";
import type { DocRef } from "@/lib/tracker-store";

const MAX_INLINE = 900 * 1024;

function readAsDataUrl(file: File) {
  return new Promise<string | undefined>((resolve) => {
    if (file.size > MAX_INLINE) return resolve(undefined);
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : undefined);
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}

export function DocumentUpload({
  docs,
  onChange,
  documentTypes,
  nextDocId,
  orderRef,
  hint = "Drawings, mill test certificates, lab reports, inspection formats (PDF, XLSX, JPG)",
}: {
  docs: DocRef[];
  onChange: (docs: DocRef[]) => void;
  /** Options from the Document Types master table, used to tag each upload. */
  documentTypes: string[];
  /** Generates the next unique document ID, e.g. DOC-0007. */
  nextDocId: () => string;
  /** SO / Lot this upload should be tagged with for traceability. */
  orderRef?: { soNo?: string | undefined; lotNo?: string | undefined };
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<DocRef | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const added: DocRef[] = [];
    for (const file of Array.from(files)) {
      added.push({
        id: nextDocId(),
        name: file.name,
        size: file.size,
        type: file.type || "file",
        docType: documentTypes[0] ?? "Other",
        addedAt: new Date().toISOString(),
        dataUrl: await readAsDataUrl(file),
        soNo: orderRef?.soNo,
        lotNo: orderRef?.lotNo,
      });
    }
    onChange([...docs, ...added]);
  }

  function updateDocType(id: string, docType: string) {
    onChange(docs.map((d) => (d.id === id ? { ...d, docType } : d)));
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/40 hover:border-primary/50"
        }`}
      >
        <FileUp className="mx-auto size-6 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium text-foreground">
          Drop documents here or click to upload
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {docs.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
          {docs.map((d, i) => (
            <li key={d.id} className="flex flex-wrap items-center gap-3 bg-card px-3 py-2 text-sm">
              <Paperclip className="size-4 shrink-0 text-muted-foreground" />
              <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                {d.id}
              </Badge>
              <button
                type="button"
                onClick={() => setPreview(d)}
                className="min-w-0 flex-1 truncate text-left hover:underline"
                title="Preview"
              >
                {d.name}
              </button>
              <Select value={d.docType} onValueChange={(v) => updateDocType(d.id, v)}>
                <SelectTrigger className="h-8 w-48 shrink-0 text-xs">
                  <SelectValue placeholder="Document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="shrink-0 text-xs text-muted-foreground">
                {(d.size / 1024).toFixed(0)} KB
              </span>
              <Button type="button" variant="ghost" size="icon" onClick={() => setPreview(d)}>
                <Eye className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onChange(docs.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <DocumentViewer doc={preview} onOpenChange={(open) => !open && setPreview(null)} />
    </div>
  );
}
