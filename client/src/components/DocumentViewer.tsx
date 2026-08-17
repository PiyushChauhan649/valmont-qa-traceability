import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DocRef } from "@/lib/tracker-store";

function isImage(doc: DocRef) {
  return doc.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(doc.name);
}

function isPdf(doc: DocRef) {
  return doc.type === "application/pdf" || /\.pdf$/i.test(doc.name);
}

/**
 * Popup preview for a single document. Renders PDFs and images inline via an
 * <iframe>/<img>; other file types fall back to a "no inline preview" notice
 * with a download action. Controlled: pass `doc` and clear it via onOpenChange.
 */
export function DocumentViewer({
  doc,
  onOpenChange,
  contextLabel,
}: {
  doc: DocRef | null;
  onOpenChange: (open: boolean) => void;
  /** Optional secondary line, e.g. "SQ128071 / Lot 1 · Mill Test Certificate" */
  contextLabel?: string | undefined;
}) {
  return (
    <Dialog open={!!doc} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span className="truncate">{doc?.name}</span>
            {doc ? (
              <Badge variant="outline" className="font-mono text-[10px]">
                {doc.id}
              </Badge>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            {contextLabel ??
              (doc ? `${doc.docType || "Document"} · ${(doc.size / 1024).toFixed(0)} KB` : "")}
          </DialogDescription>
        </DialogHeader>

        {doc ? (
          <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-muted/30">
            {doc.dataUrl && isPdf(doc) ? (
              <iframe title={doc.name} src={doc.dataUrl} className="h-[65vh] w-full" />
            ) : doc.dataUrl && isImage(doc) ? (
              <div className="flex h-full items-center justify-center p-4">
                <img
                  src={doc.dataUrl}
                  alt={doc.name}
                  className="max-h-[60vh] max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                <FileText className="size-8" />
                {doc.dataUrl
                  ? "No inline preview for this file type."
                  : "File is too large for inline storage — no preview available."}
              </div>
            )}
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            {doc?.recordId ? `Linked record: ${doc.recordId}` : null}
          </span>
          {doc?.dataUrl ? (
            <Button asChild size="sm" variant="outline">
              <a href={doc.dataUrl} download={doc.name}>
                <Download className="size-4" /> Download
              </a>
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
