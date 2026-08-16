import { cn } from "../lib/utils";

export function Field({ label, type = "text", placeholder = "", value, onChange, Left, Right, error, className = "", readOnly = false }: {
  label?: string; type?: string; placeholder?: string; value: string; onChange: (v: string) => void;
  Left?: React.ElementType; Right?: React.ReactNode; error?: string; className?: string; readOnly?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label className="text-[13px] font-semibold text-foreground">{label}</label>}
      <div className="relative">
        {Left && <Left className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />}
        <input type={type} value={value} placeholder={placeholder} readOnly={readOnly} onChange={e => onChange(e.target.value)}
          className={cn("w-full h-11 rounded-xl border text-[13px] bg-input-background text-foreground placeholder:text-muted-foreground tr-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60", Left ? "pl-10 pr-4" : "px-4", Right ? "!pr-10" : "", readOnly && "opacity-70 cursor-not-allowed", error ? "border-red-400 focus:ring-red-100 focus:border-red-400" : "border-border/80")} />
        {Right && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{Right}</div>}
      </div>
      {error && <p className="text-[11px] text-red-500 font-semibold">{error}</p>}
    </div>
  );
}
