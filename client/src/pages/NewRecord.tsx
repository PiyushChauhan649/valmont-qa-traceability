import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { DocumentUpload } from "@/components/DocumentUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIMENSIONAL_CHECKS, STEPS, type FieldDef } from "@/lib/tracker-schema";
import { nextDocId, type CheckObservation, type DocRef, type TraceRecord } from "@/lib/tracker-store";
import { activeOptions, type MasterData, MASTER_TABLES } from "@/lib/master-store";
import { createTraceRecord, getMasterData, getRecords } from "@/lib/api";

const EMPTY_MASTER_DATA: MasterData = Object.fromEntries(
  MASTER_TABLES.map((t) => [t.key, []]),
) as unknown as MasterData;

const STEP_IDS = [...STEPS.map((s) => s.id), "checks", "docs"];

function Field({
  field,
  value,
  onChange,
  options,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.key} className="text-xs font-medium">
        {field.label}
        {field.required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {field.type === "select" ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={field.key}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "textarea" ? (
        <Textarea
          id={field.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <Input
          id={field.key}
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export function NewRecord() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState<Record<string, CheckObservation>>({});
  const [docs, setDocs] = useState<DocRef[]>([]);

  const { data: master = EMPTY_MASTER_DATA } = useQuery({
    queryKey: ["masters"],
    queryFn: () => getMasterData(),
  });
  const { data: records = [] } = useQuery({
    queryKey: ["records"],
    queryFn: () => getRecords(),
  });

  const saveMutation = useMutation({
    mutationFn: (record: TraceRecord) => createTraceRecord({ data: record }),
    onSuccess: (next) => {
      queryClient.setQueryData(["records"], next);
      toast.success("Traceability record saved");
      void navigate("/reports");
    },
    onError: () => toast.error("Could not save the record — please try again"),
  });

  function fieldOptions(f: FieldDef): string[] {
    return f.masterKey ? activeOptions(master, f.masterKey) : (f.options ?? []);
  }

  const documentTypes = useMemo(() => activeOptions(master, "documentTypes"), [master]);

  const total = STEP_IDS.length;
  const current = STEPS[step];
  const progress = Math.round(((step + 1) / total) * 100);

  const missing = useMemo(() => {
    if (!current) return [];
    return current.fields.filter((f) => f.required && !values[f.key]).map((f) => f.label);
  }, [current, values]);

  function next() {
    if (missing.length) {
      toast.error(`Please fill: ${missing.join(", ")}`);
      return;
    }
    setStep((s) => Math.min(s + 1, total - 1));
  }

  function submit() {
    if (!values["soNo"] || !values["qty"] || !values["product"]) {
      toast.error("SO No., Qty and Product are required");
      setStep(0);
      return;
    }
    saveMutation.mutate({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      values,
      checks,
      docs,
    });
  }

  return (
    <AppShell
      title="New Traceability Record"
      subtitle="All Order Tracker fields in one guided form"
      actions={
        <Button variant="outline" onClick={submit} disabled={saveMutation.isPending}>
          <Save className="size-4" /> Save now
        </Button>
      }
    >
      <div className="panel p-4">
        <div className="flex flex-wrap items-center gap-2">
          {[...STEPS.map((s) => s.title), "Dimensional Checks", "Documents"].map((title, i) => (
            <button
              key={title}
              type="button"
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-colors ${
                i === step
                  ? "border-primary bg-primary text-primary-foreground"
                  : i < step
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              <span className="grid size-4 place-items-center rounded-full border border-current font-mono text-[10px]">
                {i < step ? <Check className="size-3" /> : i + 1}
              </span>
              {title}
            </button>
          ))}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="panel mt-4 p-5">
        {current ? (
          <>
            <h2 className="text-base font-semibold">{current.title}</h2>
            <p className="text-sm text-muted-foreground">{current.hint}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {current.fields.map((f) => (
                <div
                  key={f.key}
                  className={f.type === "textarea" ? "sm:col-span-2 lg:col-span-3" : ""}
                >
                  <Field
                    field={f}
                    value={values[f.key] ?? ""}
                    onChange={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
                    options={fieldOptions(f)}
                  />
                </div>
              ))}
            </div>
          </>
        ) : STEP_IDS[step] === "checks" ? (
          <>
            <h2 className="text-base font-semibold">Dimensional Inspection</h2>
            <p className="text-sm text-muted-foreground">
              Z-Post first piece / final inspection format (VHSS/AS/002 & 003)
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr className="label-caps">
                    <th className="px-3 py-2">Sr.</th>
                    <th className="px-3 py-2">Parameter</th>
                    <th className="px-3 py-2">Specified</th>
                    <th className="px-3 py-2">Tolerance</th>
                    <th className="px-3 py-2">Instrument</th>
                    <th className="px-3 py-2">Observed</th>
                    <th className="px-3 py-2">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {DIMENSIONAL_CHECKS.map((c) => (
                    <tr key={c.sr}>
                      <td className="px-3 py-1.5 font-mono text-xs">{c.sr}</td>
                      <td className="px-3 py-1.5">{c.parameter}</td>
                      <td className="px-3 py-1.5 font-mono text-xs">{c.specified}</td>
                      <td className="px-3 py-1.5 font-mono text-xs">{c.tolerance}</td>
                      <td className="px-3 py-1.5 text-xs text-muted-foreground">{c.instrument}</td>
                      <td className="px-3 py-1.5">
                        <Input
                          className="h-8"
                          value={checks[c.sr]?.observed ?? ""}
                          onChange={(e) =>
                            setChecks((p) => ({
                              ...p,
                              [c.sr]: { ...p[c.sr], observed: e.target.value },
                            }))
                          }
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <Select
                          value={checks[c.sr]?.result ?? ""}
                          onValueChange={(v) =>
                            setChecks((p) => ({ ...p, [c.sr]: { ...p[c.sr], result: v } }))
                          }
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Accepted">Accepted</SelectItem>
                            <SelectItem value="Not Accepted">Not Accepted</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-base font-semibold">Supporting Documents</h2>
            <p className="text-sm text-muted-foreground">
              Attach mill test certificates, lab reports, drawings and signed inspection formats
            </p>
            <div className="mt-4">
              <DocumentUpload
                docs={docs}
                onChange={setDocs}
                documentTypes={documentTypes}
                nextDocId={() => nextDocId(records)}
                orderRef={{ soNo: values["soNo"], lotNo: values["lotNo"] }}
              />
            </div>
          </>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ChevronLeft className="size-4" /> Back
          </Button>
          <span className="text-xs text-muted-foreground">
            Step {step + 1} of {total}
          </span>
          {step === total - 1 ? (
            <Button onClick={submit} disabled={saveMutation.isPending}>
              <Save className="size-4" /> Save record
            </Button>
          ) : (
            <Button onClick={next}>
              Next <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
