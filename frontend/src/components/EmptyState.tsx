import { CARBON } from "../lib/constants";
import { Card } from "./Card";
import { Btn } from "./Btn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <Card className={`p-8 md:p-10 text-center ${className}`} hover={false}>
      {icon && (
        <div className="mb-4 flex justify-center [&>svg]:opacity-30">
          {icon}
        </div>
      )}
      <h3 className="text-[15px] font-black mb-1.5" style={{ color: CARBON }}>
        {title}
      </h3>
      <p className="text-[13px] text-muted-foreground mb-5 max-w-xs mx-auto leading-relaxed">
        {description}
      </p>
      {action && (
        <Btn size="sm" onClick={action.onClick}>
          {action.label}
        </Btn>
      )}
    </Card>
  );
}
