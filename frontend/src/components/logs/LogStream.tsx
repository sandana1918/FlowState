import { useEffect, useMemo, useRef } from 'react';
import type { LogLine } from '../../services/logs.api';

const highlight = (message: string, query: string) => {
  if (!query.trim()) {
    return message;
  }
  const index = message.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) {
    return message;
  }
  return (
    <>
      {message.slice(0, index)}
      <mark className="rounded bg-primary/20 px-1 text-text">{message.slice(index, index + query.length)}</mark>
      {message.slice(index + query.length)}
    </>
  );
};

export const LogStream = ({
  logs,
  query,
  autoScroll
}: {
  logs: LogLine[];
  query: string;
  autoScroll: boolean;
}) => {
  const streamRef = useRef<HTMLDivElement>(null);

  const filteredLogs = useMemo(
    () => logs.filter((log) => log.raw.toLowerCase().includes(query.toLowerCase())),
    [logs, query]
  );

  useEffect(() => {
    if (autoScroll && streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [autoScroll, filteredLogs]);

  return (
    <div ref={streamRef} className="max-h-[640px] overflow-auto rounded-[28px] border border-slate-200 bg-[#0a0d12] p-4 font-mono text-[13px] shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
      {filteredLogs.map((log, index) => (
        <div
          key={`${log.raw}-${index}`}
          className={`mb-1 rounded-xl px-3 py-2 ${log.level === 'ERROR' ? 'bg-critical/10' : log.level === 'WARN' ? 'bg-warning/10' : 'bg-white/[0.02]'}`}
        >
          <span className="mr-3 text-slate-500">{log.timestamp ?? '--'}</span>
          <span className={`mr-3 inline-block min-w-[46px] ${log.level === 'ERROR' ? 'text-critical' : log.level === 'WARN' ? 'text-warning' : 'text-primary'}`}>
            {log.level}
          </span>
          <span className="text-slate-100">{highlight(log.message, query)}</span>
        </div>
      ))}
    </div>
  );
};
