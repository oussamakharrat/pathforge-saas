import { Route } from "lucide-react";
import { CARBON } from "../lib/constants";

export function BrandLogo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  const textColor = light ? "white" : CARBON;

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-2xl border"
        style={{
          width: compact ? 38 : 42,
          height: compact ? 38 : 42,
          background: light
            ? "linear-gradient(135deg, rgba(241,80,37,0.96), rgba(255,155,106,0.92))"
            : "linear-gradient(135deg, #F15025 0%, #FF9B6A 100%)",
          borderColor: light ? "rgba(255,255,255,0.08)" : "rgba(241,80,37,0.08)",
          boxShadow: light
            ? "inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 18px rgba(241,80,37,0.18)"
            : "inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 18px rgba(241,80,37,0.12)"
        }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{ backgroundImage: "radial-gradient(circle at 28% 24%, white 0%, transparent 18%)" }}
        />
        <Route className="relative z-10 w-4.5 h-4.5 text-white" strokeWidth={1.9} />
      </div>
      {!compact && (
        <span
          className="text-[13px] font-black tracking-[0.22em] uppercase"
          style={{ color: textColor }}
        >
          PathForge
        </span>
      )}
    </div>
  );
}
