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
      className="fixed right-0 top-14 z-40 h-[calc(100vh-56px)] w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-[#f7f9fd]/96 p-6 backdrop-blur-xl"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
            <span className="rounded-full border border-secondary/20 bg-secondary/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
              {incident.correlationConfidence}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dim">Incident</p>
            <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-text">{incident.title}</h2>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-muted transition hover:border-slate-300 hover:text-text">
          Close
        </button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${tab === item ? 'bg-primary text-white shadow-sm' : 'border border-slate-200 bg-white text-text hover:border-slate-300'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'Overview' ? (
        <GlassCard className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">Affected Service</p>
              <p className="mt-2 text-base font-medium text-text">{incident.affectedService}</p>
            </div>
            <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">Correlation</p>
              <p className="mt-2 text-base font-medium text-text">{incident.correlationConfidence}</p>
            </div>
            <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">Metric</p>
              <p className="mt-2 text-base font-medium text-text">{incident.triggerMetric ?? 'n/a'}</p>
            </div>
            <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">Z-Score</p>
              <p className="mt-2 font-mono text-base font-medium text-text">{incident.triggerZscore?.toFixed(2) ?? '--'}</p>
            </div>
          </div>
          <div className="rounded-[20px] border border-slate-200/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">Linked Deployment</p>
            {incident.correlatedDeployment ? (
              <div className="mt-3 space-y-1">
                <p className="font-mono text-primary">{incident.correlatedDeployment.commitHash}</p>
                <p className="text-sm text-muted">
                  {incident.correlatedDeployment.repo} / {incident.correlatedDeployment.branch} | {incident.correlatedDeployment.author}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">No deployment is currently linked to this incident.</p>
            )}
          </div>
        </GlassCard>
      ) : null}
      {tab === 'Timeline' ? <IncidentTimeline timeline={incident.timeline} /> : null}
      {tab === 'Blast Radius' ? <BlastRadiusMap blastRadius={incident.blastRadius} /> : null}
      {tab === 'Resolution' ? (
        <div className="space-y-4">
          <ResolutionSteps incidentId={incident.id ?? incident.title} steps={incident.resolutionSteps} />
          <button onClick={markResolved} className="rounded-full bg-success px-5 py-3 text-sm font-semibold text-white shadow-sm">
            Mark Resolved
          </button>
        </div>
      ) : null}
    </motion.aside>
  );
};
