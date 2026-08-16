import { FLAME, CARBON, DUST, ALABASTER } from "../lib/constants";
import { cn } from "../lib/utils";

export function Chip({ children, variant = "default", className }: { children: React.ReactNode; variant?: "default" | "flame" | "green" | "amber" | "ghost"; className?: string }) {
  const s: Record<string, { bg: string; color: string; border?: string }> = {
    default: { bg: ALABASTER, color: CARBON },
    flame: { bg: "rgba(241,80,37,0.12)", color: FLAME },
    green: { bg: "rgba(16,185,129,0.12)", color: "#059669" },
    amber: { bg: "rgba(245,158,11,0.12)", color: "#D97706" },
    ghost: { bg: "transparent", color: "#6B6F6B", border: `1px solid ${DUST}` },
  };
  const st = s[variant];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide tr-interactive", className)}
      style={{ backgroundColor: st.bg, color: st.color, border: st.border }}>
      {children}
    </span>
  );
}
