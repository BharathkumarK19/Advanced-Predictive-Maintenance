import { Menu, MoonStar, SunMedium, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppSettings } from "../../context/AppSettingsContext";
import { formatDateTime } from "../../utils/format";

type NavbarProps = {
  onMenuClick: () => void;
};

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { theme, toggleTheme } = useAppSettings();
  const [currentTime, setCurrentTime] = useState(() => new Date().toISOString());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 px-4 py-4 backdrop-blur lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
        <button
          type="button"
          className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-200 hover:bg-slate-800 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open sidebar menu"
        >
            <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Enterprise Operations</p>
          <h2 className="truncate text-lg font-semibold text-white">
            Advanced Predictive Maintenance Dashboard
          </h2>
        </div>

        <div className="hidden rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 sm:block">
          {formatDateTime(currentTime)}
        </div>

        <button
          type="button"
          className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-200 hover:bg-slate-800"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
        </button>

        <button
          type="button"
          className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-200 hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-industrial-500 to-emerald-500 text-sm font-semibold text-white shadow-lg shadow-industrial-900/20">
          AP
        </div>
      </div>
    </header>
  );
};
