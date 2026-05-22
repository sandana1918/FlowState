import { useEffect, useMemo, useState } from 'react';
import { LogViewer } from '../components/logs/LogViewer';
import { useServices } from '../hooks/useServices';
import { useLogs } from '../hooks/useLogs';
import { GlassCard } from '../components/cards/GlassCard';
import { useSearchParams } from 'react-router-dom';

export const Logs = () => {
  const { services } = useServices();
  const [params] = useSearchParams();
  const presetService = params.get('service') ?? undefined;
  const [containerId, setContainerId] = useState<string | undefined>(presetService);
  const [tail, setTail] = useState(100);

  useEffect(() => {
    if (!containerId && services[0]?.id) {
      setContainerId(presetService ?? services[0].id);
    }
  }, [containerId, presetService, services]);

  const targetId = useMemo(() => containerId ?? services[0]?.id, [containerId, services]);
  const { logs } = useLogs(targetId, tail);

  return (
    <div className="space-y-6">
      <GlassCard className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-text">Logs</h2>
          <p className="mt-2 text-sm text-muted">Terminal view over real Docker logs with filtering and clipboard actions.</p>
        </div>
        <div className="flex flex-wrap gap-4">
        <select
          value={targetId}
          onChange={(event) => setContainerId(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-surface px-4 py-3 text-text"
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>{service.name}</option>
          ))}
        </select>
        <select
          value={tail}
          onChange={(event) => setTail(Number(event.target.value))}
          className="rounded-2xl border border-slate-200 bg-surface px-4 py-3 text-text"
        >
          {[50, 100, 200, 500].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        </div>
      </GlassCard>
      <LogViewer logs={logs} />
    </div>
  );
};
