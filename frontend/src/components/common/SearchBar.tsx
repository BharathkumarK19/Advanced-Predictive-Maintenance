import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const SearchBar = ({ value, onChange, placeholder = "Search..." }: SearchBarProps) => (
  <label className="flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-slate-300">
    <Search className="h-4 w-4 shrink-0 text-slate-400" />
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
    />
  </label>
);
