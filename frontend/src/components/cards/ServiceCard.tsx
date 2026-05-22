import { GlassCard } from './GlassCard';
import { StatusBadge } from '../common/StatusBadge';
import { formatMb, formatPercent } from '../../utils/formatters';
import type { Service } from '../../types/service.types';

const tone = (service: Service) => {
  const cpu = service.latestMetric?.cpuPercent ?? 0;
  const memory = service.latestMetric?.memoryPercent ?? 0;
  const restarts = service.latestMetric?.restartCount ?? 0;
  if (cpu >= 85 || memory >= 90 || restarts > 1) return 'border-l-critical shadow-critical';
  if (cpu >= 70 || memory >= 80 || restarts > 0) return 'border-l-warning';
  return 'border-l-success';
};

export const ServiceCard = ({ service }: { service: Service }) => (
  <GlassCard className={`border-l-4 ${tone(service)}`}>
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-mono text-xl text-text">{service.name}</h3>
          <p className="text-sm text-muted">
            {service.image}:{service.imageTag}
          </p>
        </div>
        <StatusBadge status={service.state} />
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted">CPU</p>
          <p className="font-mono text-xl text-text">{formatPercent(service.latestMetric?.cpuPercent ?? 0)}</p>
        </div>
        <div>
          <p className="text-muted">Memory</p>
          <p className="font-mono text-xl text-text">{formatMb(service.latestMetric?.memoryMb ?? 0)}</p>
        </div>
        <div>
          <p className="text-muted">Restarts</p>
          <p className={`font-mono text-xl ${(service.latestMetric?.restartCount ?? 0) > 0 ? 'text-critical' : 'text-text'}`}>
            {service.latestMetric?.restartCount ?? 0}
          </p>
        </div>
      </div>
    </div>
  </GlassCard>
);

