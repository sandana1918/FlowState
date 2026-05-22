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
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} />
          <span className="rounded-full border border-secondary/30 bg-secondary/10 px-2 py-1 text-xs text-secondary">
            {incident.correlationConfidence}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-text">{incident.title}</h3>
        <p className="text-sm text-muted">
          {incident.affectedService} • {formatAgo(incident.openedAt)}
        </p>
      </div>
      {onClick ? (
        <button
          onClick={onClick}
          className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary"
        >
          Investigate
        </button>
      ) : null}
    </div>
  </GlassCard>
);

