import type { PropsWithChildren } from 'react';
import clsx from 'clsx';

export const GlassCard = ({
  children,
  className
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={clsx(
      'rounded-[26px] border border-white/70 bg-white/58 p-6 shadow-glass ring-1 ring-[#efe5d6]/80 backdrop-blur-[18px] transition duration-200',
      className
    )}
  >
    {children}
  </div>
);
