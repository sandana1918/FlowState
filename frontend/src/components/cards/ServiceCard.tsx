import { GlassCard } from './GlassCard';
import { StatusBadge } from '../common/StatusBadge';
import { formatAgo, formatMb, formatPercent } from '../../utils/formatters';
import type { Service } from '../../types/service.types';
import { Link } from 'react-router-dom';

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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-dim">Container</p>
          <h3 className="mt-2 font-mono text-[22px] tracking-[-0.04em] text-text">{service.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {service.image}:{service.imageTag}
          </p>
        </div>
        <StatusBadge status={service.state} />
      </div>
      <div className="grid grid-cols-3 gap-4 rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dim">CPU</p>
          <p className="mt-2 font-mono text-[22px] tracking-[-0.04em] text-text">{formatPercent(service.latestMetric?.cpuPercent ?? 0)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dim">Memory</p>
          <p className="mt-2 font-mono text-[22px] tracking-[-0.04em] text-text">{formatMb(service.latestMetric?.memoryMb ?? 0)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dim">Restarts</p>
          <p className={`mt-2 font-mono text-[22px] tracking-[-0.04em] ${(service.latestMetric?.restartCount ?? 0) > 0 ? 'text-critical' : 'text-text'}`}>
            {service.latestMetric?.restartCount ?? 0}
          </p>
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>Memory utilization</span>
          <span>{formatPercent(service.latestMetric?.memoryPercent ?? 0)}</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100">
          <div
            className="h-2.5 rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(service.latestMetric?.memoryPercent ?? 0, 100)}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dim">Uptime</p>
          <p className="mt-1 text-text">{formatAgo(service.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/logs?service=${service.id}`}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-text transition hover:border-slate-300 hover:bg-slate-50"
          >
            View Logs
          </Link>
          <Link
            to={`/metrics?service=${service.id}`}
            className="rounded-full bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm"
          >
            View Metrics
          </Link>
        </div>
      </div>
    </div>
  </GlassCard>
);
