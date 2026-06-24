import { cn } from "../lib/utils";

export function Btn({
  children, variant = "primary", size = "md", onClick, className = "", disabled = false, full = false, type = "button", style,
}: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "xs" | "sm" | "md" | "lg"; onClick?: () => void; className?: string; disabled?: boolean; full?: boolean; type?: "button" | "submit"; style?: React.CSSProperties;
}) {
  const V: Record<string, string> = {
    primary: "bg-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:shadow-sm hover:brightness-95 active:translate-y-0",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary active:scale-[0.98]",
    outline: "border border-border text-foreground hover:bg-secondary hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0",
    danger: "bg-destructive text-destructive-foreground hover:brightness-105 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
  };
  const S: Record<string, string> = {
    xs: "px-2.5 py-1 text-[11px] font-semibold",
    sm: "px-3.5 py-1.75 text-[12px] font-semibold",
    md: "px-4.5 py-2.5 text-[13px] font-semibold",
    lg: "px-6 py-3 text-[14px] font-semibold"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={style}
      className={cn("inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:pointer-events-none transform active:scale-95", V[variant], S[size], full && "w-full", className)}>
      {children}
    </button>
  );
}
