import { useState } from 'react';
import { IncidentFeed } from '../components/incidents/IncidentFeed';
import { GlassCard } from '../components/cards/GlassCard';
import { useIncidents } from '../hooks/useIncidents';
import { useSocketStore } from '../store/socketStore';
import { IncidentDetail } from '../components/incidents/IncidentDetail';
import type { Incident } from '../types/incident.types';

export const Incidents = () => {
  const { incidents } = useIncidents();
  const liveIncidents = useSocketStore((state) => (state.incidents.length ? state.incidents : incidents));
  const [selectedIncident, setSelectedIncident] = useState<Incident>();

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Incidents</h2>
            <p className="text-sm text-muted">
              {liveIncidents.filter((item) => item.status === 'open').length} open •{' '}
              {liveIncidents.filter((item) => item.status === 'resolved').length} resolved
            </p>
          </div>
        </div>
      </GlassCard>
      <IncidentFeed incidents={liveIncidents} onSelect={setSelectedIncident} />
      {selectedIncident ? <IncidentDetail incident={selectedIncident} onClose={() => setSelectedIncident(undefined)} /> : null}
    </div>
  );
};

