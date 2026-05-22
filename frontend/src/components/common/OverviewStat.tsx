import clsx from 'clsx';
import type { ReactNode } from 'react';

export const OverviewStat = ({
  label,
  value,
  hint,
  tone = 'default'
}: {
  label: string;
  value: ReactNode;
  hint: string;
  tone?: 'default' | 'success' | 'warning' | 'critical' | 'primary';
}) => {
  const tones = {
    default: 'border-slate-200/80',
    success: 'border-success/20 bg-success/[0.04]',
    warning: 'border-warning/20 bg-warning/[0.05]',
    critical: 'border-critical/20 bg-critical/[0.04]',
    primary: 'border-primary/20 bg-primary/[0.04]'
  } as const;

  return (
    <div
      className={clsx(
        'rounded-[24px] border bg-white/88 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] ring-1 ring-white/80 backdrop-blur-sm',
        tones[tone]
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dim">{label}</p>
      <p className="mt-4 font-mono text-[30px] tracking-[-0.04em] text-text">{value}</p>
      <p className="mt-2 text-sm text-muted">{hint}</p>
    </div>
  );
};
