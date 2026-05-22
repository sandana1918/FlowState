import type { LogLine } from '../../services/logs.api';

export const LogStream = ({ logs, query }: { logs: LogLine[]; query: string }) => (
  <div className="max-h-[640px] overflow-auto rounded-2xl border border-sky-300/10 bg-[#060A10] p-4 font-mono text-[13px]">
    {logs
      .filter((log) => log.raw.toLowerCase().includes(query.toLowerCase()))
      .map((log, index) => (
        <div
          key={`${log.raw}-${index}`}
          className={`mb-1 rounded px-2 py-1 ${log.level === 'ERROR' ? 'bg-critical/10' : log.level === 'WARN' ? 'bg-warning/10' : ''}`}
        >
          <span className="mr-2 text-dim">{log.timestamp ?? '--'}</span>
          <span className={`mr-2 ${log.level === 'ERROR' ? 'text-critical' : log.level === 'WARN' ? 'text-warning' : 'text-primary'}`}>
            {log.level}
          </span>
          <span className="text-text">{log.message}</span>
        </div>
      ))}
  </div>
);

