import { useMemo, useState } from 'react';
import { LogViewer } from '../components/logs/LogViewer';
import { useServices } from '../hooks/useServices';
import { useLogs } from '../hooks/useLogs';
import { GlassCard } from '../components/cards/GlassCard';

export const Logs = () => {
  const { services } = useServices();
  const [containerId, setContainerId] = useState<string | undefined>(services[0]?.id);
  const [tail, setTail] = useState(100);
  const targetId = useMemo(() => containerId ?? services[0]?.id, [containerId, services]);
  const { logs } = useLogs(targetId, tail);

  return (
    <div className="space-y-6">
      <GlassCard className="flex flex-wrap gap-4">
        <select
          value={targetId}
          onChange={(event) => setContainerId(event.target.value)}
          className="rounded-2xl border border-sky-300/10 bg-surface px-4 py-3 text-text"
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>{service.name}</option>
          ))}
        </select>
        <select
          value={tail}
          onChange={(event) => setTail(Number(event.target.value))}
          className="rounded-2xl border border-sky-300/10 bg-surface px-4 py-3 text-text"
        >
          {[50, 100, 200, 500].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </GlassCard>
      <LogViewer logs={logs} />
    </div>
  );
};

