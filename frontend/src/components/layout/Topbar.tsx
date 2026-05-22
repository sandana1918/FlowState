import { LiveIndicator } from '../common/LiveIndicator';

export const Topbar = ({ connected }: { connected: boolean }) => (
  <header className="fixed left-64 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-bg/95 px-8">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Overview</p>
      <p className="mt-1 text-sm text-dim">Real-time incident correlation dashboard</p>
    </div>
    <LiveIndicator connected={connected} />
  </header>
);
