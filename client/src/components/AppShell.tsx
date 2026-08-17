import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  FileBarChart2,
  FolderOpen,
  Factory,
  Database,
} from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/new-record", label: "New Record", icon: FilePlus2 },
  { to: "/reports", label: "Reports", icon: FileBarChart2 },
  { to: "/documents", label: "Documents", icon: FolderOpen },
  { to: "/masters", label: "Master Data", icon: Database },
] as const;

const linkBase =
  "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
const linkActive =
  "flex items-center gap-3 rounded-md px-3 py-2 text-sm bg-sidebar-accent text-sidebar-accent-foreground font-medium";

const mobileLinkBase = "whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground";
const mobileLinkActive =
  "whitespace-nowrap rounded-md px-3 py-1.5 text-sm bg-secondary text-secondary-foreground font-medium";

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-4">
          <span className="grid size-9 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Factory className="size-5" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Valmont Structures</div>
            <div className="text-[11px] text-sidebar-foreground/60">Traceability System</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => (isActive ? linkActive : linkBase)}
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-sidebar-border px-5 py-3 text-[11px] text-sidebar-foreground/50">
          Australia Projects · AS/NZS 1594
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            <div className="flex items-center gap-2">{actions}</div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 md:hidden">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) => (isActive ? mobileLinkActive : mobileLinkBase)}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-5 py-6">{children}</main>
      </div>
    </div>
  );
}
