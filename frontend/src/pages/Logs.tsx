import { useEffect, useMemo, useState } from 'react';
import { LogViewer } from '../components/logs/LogViewer';
import { useServices } from '../hooks/useServices';
import { useLogs } from '../hooks/useLogs';
import { GlassCard } from '../components/cards/GlassCard';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { OverviewStat } from '../components/common/OverviewStat';
import { EmptyState } from '../components/common/EmptyState';
import { FallbackBanner } from '../components/common/FallbackBanner';

export const Logs = () => {
  const { services, warning } = useServices();
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
  const selectedService = services.find((service) => service.id === targetId);
  const { logs } = useLogs(targetId, tail);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logs"
        description="Live container logs."
      >
        <OverviewStat label="Services" value={services.length} hint="Available sources." />
        <OverviewStat label="Selected" value={selectedService?.name ?? '--'} hint="Current service." tone="primary" />
        <OverviewStat label="Tail" value={tail} hint="Requested lines." />
        <OverviewStat label="Visible" value={logs.length} hint="Loaded lines." />
      </PageHeader>

      <FallbackBanner warning={warning} />

      <GlassCard className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dim">Source</p>
          <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-text">Filters</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          <select
            value={targetId}
            onChange={(event) => setContainerId(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-3 text-text outline-none"
            disabled={services.length === 0}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
          <select
            value={tail}
            onChange={(event) => setTail(Number(event.target.value))}
            className="rounded-full border border-slate-200 bg-white px-4 py-3 text-text outline-none"
          >
            {[50, 100, 200, 500].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
      </GlassCard>
      {services.length > 0 ? (
        <LogViewer logs={logs} />
      ) : (
        <EmptyState title="Logs unavailable" description="Select a container once service data is available." />
      )}
    </div>
  );
};
