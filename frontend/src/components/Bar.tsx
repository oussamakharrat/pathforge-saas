import { cn } from "../lib/utils";
import { FLAME, ALABASTER } from "../lib/constants";

export function Bar({ pct, color = FLAME, h = 4, className = "" }: { pct: number; color?: string; h?: number; className?: string }) {
  return (
    <div className={cn("w-full rounded-full overflow-hidden", className)} style={{ height: h, backgroundColor: ALABASTER }}>
      <div className="h-full rounded-full tr-bar" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
    </div>
  );
}
