import { CARBON } from '../lib/constants';
import { Card } from './Card';
import { Btn } from './Btn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <Card className={`anim-pop p-8 text-center md:p-10 ${className}`} hover={false}>
      {icon && (
        <div className="anim-fade anim-delay-1 mb-4 flex justify-center [&>svg]:opacity-30">
          {icon}
        </div>
      )}
      <h3 className="anim-fade anim-delay-2 mb-1.5 text-[15px] font-black" style={{ color: CARBON }}>
        {title}
      </h3>
      <p className="anim-fade anim-delay-3 mx-auto mb-5 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && (
        <div className="anim-fade anim-delay-4">
          <Btn size="sm" onClick={action.onClick}>
            {action.label}
          </Btn>
        </div>
      )}
    </Card>
  );
}
