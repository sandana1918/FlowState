import clsx from 'clsx';
import type { PropsWithChildren, ReactNode } from 'react';

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  className,
  children
}: PropsWithChildren<{
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}>) => (
  <section className={clsx('space-y-5', className)}>
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-3xl space-y-2">
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-dim">{eyebrow}</p> : null}
        <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-text">{title}</h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
    {children ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div> : null}
  </section>
);
