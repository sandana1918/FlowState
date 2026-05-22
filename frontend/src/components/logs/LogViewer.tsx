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
      <div className="flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search logs"
          className="min-w-[260px] flex-1 rounded-2xl border border-slate-200 bg-surface px-4 py-3 text-text outline-none"
        />
        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-surface px-4 py-3 text-sm text-text">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(event) => setAutoScroll(event.target.checked)}
          />
          Auto-scroll
        </label>
        <button onClick={() => setCleared(false)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-text">
          Refresh
        </button>
        <button onClick={copyAll} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-text">
          Copy all
        </button>
        <button onClick={() => setCleared(true)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-text">
          Clear
        </button>
      </div>
      <LogStream logs={visibleLogs} query={query} autoScroll={autoScroll} />
    </div>
  );
};
