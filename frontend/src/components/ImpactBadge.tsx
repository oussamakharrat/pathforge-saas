import { Link } from "lucide-react";
import { FLAME } from "../lib/constants";

export function ImpactBadge({ label, count, onClick }: { label: string; count: number; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all hover:opacity-80"
      style={{ backgroundColor: "rgba(241,80,37,0.06)", color: FLAME, border: `1px solid rgba(241,80,37,0.12)` }}>
      <Link className="w-3 h-3" />
      {count} {label}
    </button>
  );
}
