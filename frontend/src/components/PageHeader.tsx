import { CARBON } from "../lib/constants";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: CARBON }}>{title}</h1>
        {subtitle && <p className="text-[13px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
