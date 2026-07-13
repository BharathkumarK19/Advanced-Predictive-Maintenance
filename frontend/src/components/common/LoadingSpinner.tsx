export const LoadingSpinner = ({ label = "Loading..." }: { label?: string }) => (
  <div className="flex min-h-48 items-center justify-center">
    <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 px-5 py-4 text-slate-300">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-industrial-400 border-t-transparent" />
      <span>{label}</span>
    </div>
  </div>
);

