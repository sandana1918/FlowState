import { motion } from 'framer-motion';
import { useState } from 'react';
import { GlassCard } from '../cards/GlassCard';
import { SeverityBadge } from '../common/SeverityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { IncidentTimeline } from './IncidentTimeline';
import { BlastRadiusMap } from './BlastRadiusMap';
import { ResolutionSteps } from './ResolutionSteps';
import type { Incident } from '../../types/incident.types';
import { incidentsApi } from '../../services/incidents.api';

const tabs = ['Overview', 'Timeline', 'Blast Radius', 'Resolution'] as const;

export const IncidentDetail = ({
  incident,
  onClose
}: {
  incident: Incident;
  onClose: () => void;
}) => {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Overview');

  const markResolved = async () => {
    if (!incident.id) return;
    await incidentsApi.updateStatus(incident.id, 'resolved');
  };

  return (
    <motion.aside
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      className="fixed right-0 top-14 z-40 h-[calc(100vh-56px)] w-full max-w-2xl overflow-y-auto border-l border-sky-300/10 bg-bg/95 p-6 backdrop-blur-xl"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-text">{incident.title}</h2>
        </div>
        <button onClick={onClose} className="rounded-full border border-sky-300/10 px-4 py-2 text-sm text-muted">
          Close
        </button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-sm ${tab === item ? 'bg-primary text-bg' : 'bg-surface text-muted'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'Overview' ? (
        <GlassCard className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted">Affected Service</p><p className="text-text">{incident.affectedService}</p></div>
            <div><p className="text-muted">Correlation</p><p className="text-text">{incident.correlationConfidence}</p></div>
            <div><p className="text-muted">Metric</p><p className="text-text">{incident.triggerMetric}</p></div>
            <div><p className="text-muted">Z-Score</p><p className="font-mono text-text">{incident.triggerZscore?.toFixed(2)}</p></div>
          </div>
        </GlassCard>
      ) : null}
      {tab === 'Timeline' ? <IncidentTimeline timeline={incident.timeline} /> : null}
      {tab === 'Blast Radius' ? <BlastRadiusMap blastRadius={incident.blastRadius} /> : null}
      {tab === 'Resolution' ? (
        <div className="space-y-4">
          <ResolutionSteps incidentId={incident.id ?? incident.title} steps={incident.resolutionSteps} />
          <button onClick={markResolved} className="rounded-full bg-success px-5 py-3 text-sm font-semibold text-bg">
            Mark Resolved
          </button>
        </div>
      ) : null}
    </motion.aside>
  );
};

