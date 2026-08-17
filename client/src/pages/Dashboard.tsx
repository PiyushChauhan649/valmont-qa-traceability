import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FilePlus2, PackageCheck, CircleAlert, Boxes, Truck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { num } from "@/lib/tracker-store";
import { getRecords } from "@/lib/api";

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Boxes;
  tone?: "primary" | "success" | "warning" | "destructive";
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between">
        <span className="label-caps">{label}</span>
        <span className={`grid size-8 place-items-center rounded-md ${tones[tone]}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold text-foreground">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

export function Dashboard() {
  const { data: records = [] } = useQuery({
    queryKey: ["records"],
    queryFn: () => getRecords(),
  });

  const stats = useMemo(() => {
    const offered = records.reduce((a, r) => a + num(r.values["offerQty"] || r.values["qty"]), 0);
    const accepted = records.reduce((a, r) => a + num(r.values["acceptedQty"]), 0);
    const rejected = records.reduce((a, r) => a + num(r.values["rejectedQty"]), 0);
    const hold = records.reduce((a, r) => a + num(r.values["holdQty"]), 0);
    const dispatched = records.reduce((a, r) => a + num(r.values["dispatchQty"]), 0);
    const byProduct = Object.entries(
      records.reduce<Record<string, number>>((acc, r) => {
        const key = (r.values["product"] || "Unspecified").split(" - ")[0]!;
        acc[key] = (acc[key] ?? 0) + num(r.values["qty"]);
        return acc;
      }, {}),
    ).map(([name, qty]) => ({ name, qty }));
    const status = [
      { name: "Accepted", value: accepted },
      { name: "Rejected", value: rejected },
      { name: "Hold", value: hold },
    ].filter((s) => s.value > 0);
    return { offered, accepted, rejected, hold, dispatched, byProduct, status };
  }, [records]);

  const colors = ["var(--chart-3)", "var(--chart-4)", "var(--chart-2)"];

  return (
    <AppShell
      title="Traceability Dashboard"
      subtitle="Australia Projects · Valmont Structures Pvt Ltd"
      actions={
        <Button asChild>
          <Link to="/new-record">
            <FilePlus2 className="size-4" /> New record
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi
          label="Lots recorded"
          value={String(records.length)}
          sub="Traceability entries"
          icon={Boxes}
        />
        <Kpi
          label="Offered qty"
          value={String(stats.offered)}
          sub="Nos submitted to QC"
          icon={PackageCheck}
        />
        <Kpi
          label="Accepted"
          value={String(stats.accepted)}
          sub={`${stats.offered ? ((stats.accepted / stats.offered) * 100).toFixed(1) : "0.0"}% acceptance`}
          icon={PackageCheck}
          tone="success"
        />
        <Kpi
          label="Rejected / hold"
          value={`${stats.rejected} / ${stats.hold}`}
          sub="Needs disposition"
          icon={CircleAlert}
          tone="destructive"
        />
        <Kpi
          label="Dispatched"
          value={String(stats.dispatched)}
          sub="Nos shipped"
          icon={Truck}
          tone="warning"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="panel p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Quantity by product</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byProduct}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }} />
                <Bar dataKey="qty" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-4">
          <h2 className="text-sm font-semibold">Inspection outcome</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.status}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                >
                  {stats.status.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel mt-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Recent lots</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/reports">View all reports</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left">
              <tr className="label-caps">
                <th className="px-4 py-2">SO No.</th>
                <th className="px-4 py-2">Lot</th>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Heat / Coil</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.slice(0, 6).map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 font-mono">{r.values["soNo"]}</td>
                  <td className="px-4 py-2">{r.values["lotNo"] || "—"}</td>
                  <td className="px-4 py-2">{r.values["product"]}</td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {r.values["heatNo"]} / {r.values["coilNo"]}
                  </td>
                  <td className="px-4 py-2 font-mono">{r.values["qty"]}</td>
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
                  <td className="px-4 py-2">{r.values["dispatchDate"] || "—"}</td>
                </tr>
              ))}
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No records yet — start with a new traceability record.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
