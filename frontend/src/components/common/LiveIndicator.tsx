export const LiveIndicator = ({ connected }: { connected: boolean }) => (
  <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-sm shadow-[0_4px_12px_rgba(68,76,84,0.06)]">
    <span
      className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-success' : 'bg-critical'}`}
    />
    <span className={connected ? 'text-success' : 'text-critical'}>
      {connected ? 'Live' : 'Disconnected'}
    </span>
  </div>
);
