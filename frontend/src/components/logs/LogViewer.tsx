import { useState } from 'react';
import { LogStream } from './LogStream';
import type { LogLine } from '../../services/logs.api';

export const LogViewer = ({ logs }: { logs: LogLine[] }) => {
  const [query, setQuery] = useState('');
  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search logs"
        className="w-full rounded-2xl border border-sky-300/10 bg-surface px-4 py-3 text-text outline-none"
      />
      <LogStream logs={logs} query={query} />
    </div>
  );
};

