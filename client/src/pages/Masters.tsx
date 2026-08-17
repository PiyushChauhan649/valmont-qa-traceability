import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MASTER_TABLES,
  newRow,
  type MasterData,
  type MasterKey,
  type MasterRow,
} from "@/lib/master-store";
import { deleteMasterRow, getMasterData, saveMasterRow } from "@/lib/api";

const EMPTY_MASTER_DATA: MasterData = Object.fromEntries(
  MASTER_TABLES.map((t) => [t.key, []]),
) as unknown as MasterData;

function MasterTable({
  tableKey,
  rows,
  onSave,
  onRemove,
  pending,
}: {
  tableKey: MasterKey;
  rows: MasterRow[];
  onSave: (key: MasterKey, row: MasterRow) => void;
  onRemove: (id: string) => void;
  pending: boolean;
}) {
  const def = MASTER_TABLES.find((t) => t.key === tableKey)!;
  const [draft, setDraft] = useState<Record<string, MasterRow>>({});
  // Rows created locally (via "Add") that haven't been saved to the server yet.
  const [pendingNewRows, setPendingNewRows] = useState<MasterRow[]>([]);

  function localRow(r: MasterRow): MasterRow {
    return draft[r.id] ?? r;
  }

  function setField(id: string, patch: Partial<MasterRow>, base: MasterRow) {
    setDraft((d) => ({ ...d, [id]: { ...localRow(base), ...patch } }));
  }

  function save(id: string, base: MasterRow) {
    const r = localRow(base);
    if (!r.name.trim()) {
      toast.error(`${def.singular} name is required`);
      return;
    }
    onSave(tableKey, r);
    setPendingNewRows((rows) => rows.filter((x) => x.id !== id));
    setDraft((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });
  }

  function addRow() {
    const r = newRow();
    setPendingNewRows((rows) => [...rows, r]);
  }

  function remove(id: string) {
    setPendingNewRows((rows) => rows.filter((x) => x.id !== id));
    if (rows.some((x) => x.id === id)) onRemove(id);
  }

  const allRows = [...rows, ...pendingNewRows];

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{def.label}</h2>
          <p className="text-sm text-muted-foreground">{def.hint}</p>
        </div>
        <Button size="sm" onClick={addRow}>
          <Plus className="size-4" /> Add {def.singular.toLowerCase()}
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr className="label-caps">
              <th className="px-3 py-2">{def.nameLabel}</th>
              <th className="px-3 py-2">{def.codeLabel ?? "Code"}</th>
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2 text-center">Active</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allRows.map((base) => {
              const r = localRow(base);
              const isNew = pendingNewRows.some((x) => x.id === base.id);
              const dirty = isNew || !!draft[base.id];
              return (
                <tr key={base.id}>
                  <td className="px-3 py-1.5">
                    <Input
                      className="h-8"
                      value={r.name}
                      onChange={(e) => setField(base.id, { name: e.target.value }, base)}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      className="h-8"
                      value={r.code ?? ""}
                      onChange={(e) => setField(base.id, { code: e.target.value }, base)}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      className="h-8"
                      value={r.notes ?? ""}
                      onChange={(e) => setField(base.id, { notes: e.target.value }, base)}
                    />
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <Switch
                      checked={r.active}
                      onCheckedChange={(v) => setField(base.id, { active: v }, base)}
                    />
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!dirty || pending}
                        onClick={() => save(base.id, base)}
                        title="Save"
                      >
                        <Save className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={pending}
                        onClick={() => remove(base.id)}
                        title="Delete"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {allRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No {def.label.toLowerCase()} yet. Add the first one above.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Masters() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<MasterKey>("products");

  const { data = EMPTY_MASTER_DATA } = useQuery({
    queryKey: ["masters"],
    queryFn: () => getMasterData(),
  });

  const saveMutation = useMutation({
    mutationFn: (input: { key: MasterKey; row: MasterRow }) => saveMasterRow({ data: input }),
    onSuccess: (next, vars) => {
      queryClient.setQueryData(["masters"], next);
      toast.success(`${MASTER_TABLES.find((t) => t.key === vars.key)?.singular} saved`);
    },
    onError: () => toast.error("Could not save — please try again"),
  });

  const removeMutation = useMutation({
    mutationFn: (input: { id: string }) => deleteMasterRow({ data: input }),
    onSuccess: (next) => {
      queryClient.setQueryData(["masters"], next);
      toast.success("Removed");
    },
    onError: () => toast.error("Could not delete — please try again"),
  });

  const counts = useMemo(
    () =>
      Object.fromEntries(MASTER_TABLES.map((t) => [t.key, data[t.key].length])) as Record<
        MasterKey,
        number
      >,
    [data],
  );

  return (
    <AppShell
      title="Master Data"
      subtitle="Shared reference lists used across every record and dropdown"
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as MasterKey)}>
        <TabsList className="flex h-auto flex-wrap gap-1 bg-transparent p-0">
          {MASTER_TABLES.map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className="rounded-md border border-border bg-card data-[state=active]:border-primary"
            >
              {t.label}
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {counts[t.key]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {MASTER_TABLES.map((t) => (
          <TabsContent key={t.key} value={t.key} className="mt-4">
            <MasterTable
              tableKey={t.key}
              rows={data[t.key]}
              onSave={(key, row) => saveMutation.mutate({ key, row })}
              onRemove={(id) => removeMutation.mutate({ id })}
              pending={saveMutation.isPending || removeMutation.isPending}
            />
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  );
}
