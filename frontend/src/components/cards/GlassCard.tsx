import type { PropsWithChildren } from 'react';
import clsx from 'clsx';

export const GlassCard = ({
  children,
  className
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={clsx(
      'rounded-[28px] border border-slate-200/80 bg-white/88 p-6 shadow-glass ring-1 ring-white/75 backdrop-blur-sm transition duration-200',
      className
    )}
  >
    {children}
  </div>
);
