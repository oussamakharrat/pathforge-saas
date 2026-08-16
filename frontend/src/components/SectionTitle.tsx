import { FLAME, CARBON } from '../lib/constants';

export function SectionTitle({ label, title, subtitle }: { label?: string; title: string; subtitle?: string }) {
  return (
    <div className="anim-fade-in-up mb-10 text-center">
      {label && (
        <p className="anim-fade anim-delay-1 mb-3 text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: FLAME }}>
          {label}
        </p>
      )}
      <h2 className="anim-fade anim-delay-2 mb-3 text-3xl font-semibold tracking-tight md:text-4xl" style={{ color: CARBON }}>
        {title}
      </h2>
      {subtitle && (
        <p className="anim-fade anim-delay-3 mx-auto max-w-2xl text-sm leading-6 text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}
