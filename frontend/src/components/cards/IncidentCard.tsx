import { GlassCard } from './GlassCard';
import { SeverityBadge } from '../common/SeverityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { formatAgo } from '../../utils/formatters';
import type { Incident } from '../../types/incident.types';

export const IncidentCard = ({
  incident,
  onClick
}: {
  incident: Incident;
  onClick?: () => void;
}) => (
  <GlassCard className={incident.severity === 'critical' ? 'shadow-critical' : ''}>
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} />
          <span className="rounded-full border border-secondary/20 bg-secondary/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
            {incident.correlationConfidence}
          </span>
        </div>
        <div>
          <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-text">{incident.title}</h3>
          <p className="mt-1 text-sm text-muted">
            {incident.affectedService} | {formatAgo(incident.openedAt)}
          </p>
        </div>
        <div className="grid gap-3 text-sm text-muted md:grid-cols-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">Metric</p>
            <p className="mt-1 text-text">{incident.triggerMetric ?? 'n/a'}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">Z-Score</p>
            <p className="mt-1 font-mono text-text">{incident.triggerZscore?.toFixed(2) ?? '--'}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">Deployment</p>
            <p className="mt-1 text-text">{incident.correlatedDeployment?.author ?? 'No linked deploy'}</p>
          </div>
        </div>
      </div>
      {onClick ? (
        <button
          onClick={onClick}
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-text transition hover:border-slate-300 hover:bg-white"
        >
          Investigate
        </button>
      ) : null}
    </div>
  </GlassCard>
);
