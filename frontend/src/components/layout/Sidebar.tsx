import { X, LayoutDashboard, Activity, History, Monitor, Server, Settings2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useHealth } from "../../hooks/useHealth";
import { StatusBadge } from "../common/StatusBadge";

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/prediction", label: "Live Prediction", icon: Activity },
  { to: "/history", label: "Prediction History", icon: History },
  { to: "/monitoring", label: "Monitoring", icon: Monitor },
  { to: "/system", label: "System Status", icon: Server },
  { to: "/settings", label: "Settings", icon: Settings2 },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-1",
    isActive
      ? "bg-industrial-600/15 text-industrial-300 ring-1 ring-industrial-500/30"
      : "text-slate-300 hover:bg-slate-800/70 hover:text-white",
  );

export const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
  const { data: health } = useHealth();
  const connected = health?.status.toLowerCase() === "healthy";

  return (
    <>
      <aside className="hidden w-72 border-r border-slate-800 bg-slate-950/80 px-4 py-5 lg:flex lg:flex-col">
        <div className="mb-8">
          <p className="section-title">Industrial IoT</p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">
            Advanced Predictive Maintenance Dashboard
          </h1>
        </div>
        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => clsx(linkClass({ isActive }), "group")}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-industrial-500/30">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-100">FastAPI Backend</p>
              <p className="mt-1 text-xs text-slate-400">{connected ? "Heartbeat active" : "Waiting for backend"}</p>
            </div>
            <StatusBadge label={connected ? "Connected" : "Disconnected"} tone={connected ? "success" : "danger"} />
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70"
            aria-label="Close sidebar overlay"
            onClick={onClose}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[85vw] max-w-xs flex-col border-r border-slate-800 bg-slate-950 px-4 py-5 shadow-2xl shadow-black/40">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="section-title">Industrial IoT</p>
                <h2 className="mt-2 text-lg font-semibold text-white">Predictive Maintenance</h2>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={onClose}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => clsx(linkClass({ isActive }), "group")} onClick={onClose}>
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
};
