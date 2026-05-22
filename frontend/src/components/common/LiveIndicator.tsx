export const LiveIndicator = ({ connected }: { connected: boolean }) => (
  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm">
    <span
      className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-critical'}`}
    />
    <span className={connected ? 'text-success' : 'text-critical'}>
      {connected ? 'Live' : 'Disconnected'}
    </span>
  </div>
);
