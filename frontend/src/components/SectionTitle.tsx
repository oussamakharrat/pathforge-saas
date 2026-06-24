import { FLAME, CARBON } from "../lib/constants";

export function SectionTitle({ label, title, subtitle }: { label?: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-10">
      {label && <p className="text-[11px] font-semibold uppercase tracking-[0.24em] mb-3" style={{ color: FLAME }}>{label}</p>}
      <h2 className="text-3xl md:text-4xl font-semibold mb-3 tracking-tight" style={{ color: CARBON }}>{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-6">{subtitle}</p>}
    </div>
  );
}
