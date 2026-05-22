import { useMemo, useState } from 'react';
import { IncidentFeed } from '../components/incidents/IncidentFeed';
import { GlassCard } from '../components/cards/GlassCard';
import { useIncidents } from '../hooks/useIncidents';
import { useSocketStore } from '../store/socketStore';
import { IncidentDetail } from '../components/incidents/IncidentDetail';
import type { Incident } from '../types/incident.types';
import { PageHeader } from '../components/common/PageHeader';
import { OverviewStat } from '../components/common/OverviewStat';

const statusFilters = ['all', 'open', 'investigating', 'resolved'] as const;
const severityFilters = ['all', 'critical', 'high', 'medium', 'low'] as const;

export const Incidents = () => {
  const { incidents } = useIncidents();
  const liveIncidents = useSocketStore((state) => (state.incidents.length ? state.incidents : incidents));
  const [selectedIncident, setSelectedIncident] = useState<Incident>();
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>('all');
  const [severityFilter, setSeverityFilter] = useState<(typeof severityFilters)[number]>('all');
  const [query, setQuery] = useState('');

  const filteredIncidents = useMemo(() => {
    return liveIncidents.filter((incident) => {
      const matchesStatus = statusFilter === 'all' ? true : incident.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' ? true : incident.severity === severityFilter;
      const matchesQuery = query.trim()
        ? `${incident.title} ${incident.affectedService} ${incident.correlatedDeployment?.commitHash ?? ''}`
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      return matchesStatus && matchesSeverity && matchesQuery;
    });
  }, [liveIncidents, query, severityFilter, statusFilter]);

  const resolvedToday = liveIncidents.filter(
    (incident) =>
      incident.status === 'resolved' &&
      incident.resolvedAt &&
      new Date(incident.resolvedAt).toDateString() === new Date().toDateString()
  ).length;
  const criticalCount = liveIncidents.filter((incident) => incident.severity === 'critical' && incident.status !== 'resolved').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Response Desk"
        title="Incidents"
        description="Triage, investigate, and close live incidents with clean correlation context instead of noisy alert spam."
      >
        <OverviewStat label="Open" value={liveIncidents.filter((item) => item.status === 'open').length} hint="Currently active incidents." tone={criticalCount > 0 ? 'critical' : 'default'} />
        <OverviewStat label="Resolved Today" value={resolvedToday} hint="Closed during the current day." tone="success" />
        <OverviewStat label="Critical" value={criticalCount} hint="Need immediate operator attention." tone={criticalCount > 0 ? 'critical' : 'default'} />
        <OverviewStat label="Visible Rows" value={filteredIncidents.length} hint="Filtered incident list count." tone="primary" />
      </PageHeader>

      <GlassCard className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dim">Filters</p>
            <p className="mt-1 text-sm text-muted">Status, severity, and search stay in one compact control rail.</p>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search incidents"
            className="min-w-[240px] rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dim">Status</p>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    statusFilter === filter
                      ? 'bg-primary text-white shadow-sm'
                      : 'border border-slate-200 bg-slate-50 text-text hover:bg-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dim">Severity</p>
            <div className="flex flex-wrap gap-2">
              {severityFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSeverityFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    severityFilter === filter
                      ? 'bg-text text-white shadow-sm'
                      : 'border border-slate-200 bg-slate-50 text-text hover:bg-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <IncidentFeed incidents={filteredIncidents} onSelect={setSelectedIncident} />
      {selectedIncident ? <IncidentDetail incident={selectedIncident} onClose={() => setSelectedIncident(undefined)} /> : null}
    </div>
  );
};
