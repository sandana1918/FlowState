import type { PropsWithChildren } from 'react';
import clsx from 'clsx';

export const GlassCard = ({
  children,
  className
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={clsx(
      'rounded-3xl border border-slate-200 bg-surface p-5 shadow-glass transition duration-200 hover:border-slate-300',
      className
    )}
  >
    {children}
  </div>
);
