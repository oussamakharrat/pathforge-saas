import { cn } from "../lib/utils";

export function Card({ children, className = "", onClick, hover = true, style }: {
  children: React.ReactNode; className?: string; onClick?: () => void; hover?: boolean; style?: React.CSSProperties;
}) {
  return (
    <div onClick={onClick} style={style}
      className={cn(
        "bg-card text-card-foreground border border-border/80 rounded-xl transition-all duration-300 shadow-sm",
        hover && onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30",
        hover && !onClick && "hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20",
        className
      )}>
      {children}
    </div>
  );
}
