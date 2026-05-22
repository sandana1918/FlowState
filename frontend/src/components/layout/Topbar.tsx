import { LiveIndicator } from '../common/LiveIndicator';

export const Topbar = ({ connected }: { connected: boolean }) => (
  <header className="fixed left-64 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-white/70 bg-[#f6f1e9]/72 px-10 backdrop-blur-[16px]">
    <div className="text-sm font-medium text-muted">FlowState</div>
    <LiveIndicator connected={connected} />
  </header>
);
