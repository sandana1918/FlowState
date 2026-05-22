import { useMemo, useState } from 'react';
import { LogStream } from './LogStream';
import type { LogLine } from '../../services/logs.api';

export const LogViewer = ({ logs }: { logs: LogLine[] }) => {
  const [query, setQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [cleared, setCleared] = useState(false);
  const visibleLogs = useMemo(() => (cleared ? [] : logs), [cleared, logs]);

  const copyAll = async () => {
    await navigator.clipboard.writeText(visibleLogs.map((log) => log.raw).join('\n'));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-slate-200/80 bg-white/88 p-4 shadow-glass ring-1 ring-white/75">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search logs"
          className="min-w-[260px] flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-text outline-none transition focus:border-primary"
        />
        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-text">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(event) => setAutoScroll(event.target.checked)}
          />
          Auto-scroll
        </label>
        <button onClick={() => setCleared(false)} className="rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-text transition hover:border-slate-300 hover:bg-slate-50">
          Refresh
        </button>
        <button onClick={copyAll} className="rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-text transition hover:border-slate-300 hover:bg-slate-50">
          Copy all
        </button>
        <button onClick={() => setCleared(true)} className="rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-text transition hover:border-slate-300 hover:bg-slate-50">
          Clear
        </button>
      </div>
      <LogStream logs={visibleLogs} query={query} autoScroll={autoScroll} />
    </div>
  );
};
