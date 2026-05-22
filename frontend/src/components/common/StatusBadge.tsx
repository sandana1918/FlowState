import clsx from 'clsx';

export const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={clsx(
      'rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
      status === 'running' || status === 'open'
        ? 'border-success/40 bg-success/10 text-success'
        : status === 'resolved'
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-warning/40 bg-warning/10 text-warning'
    )}
  >
    {status}
  </span>
);

