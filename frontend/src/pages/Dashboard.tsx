import { motion } from 'framer-motion';
import { MetricCard } from '../components/cards/MetricCard';
import { GlassCard } from '../components/cards/GlassCard';
import { IncidentFeed } from '../components/incidents/IncidentFeed';
import { DeploymentFeed } from '../components/deployments/DeploymentFeed';
import { useSocketStore } from '../store/socketStore';
import { useIncidents } from '../hooks/useIncidents';
import { useDeployments } from '../hooks/useDeployments';
import { useServices } from '../hooks/useServices';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMemo, useState } from 'react';
import { IncidentDetail } from '../components/incidents/IncidentDetail';
import type { Incident } from '../types/incident.types';
import { formatAgo, truncateHash } from '../utils/formatters';
import { StatusBadge } from '../components/common/StatusBadge';

export const Dashboard = () => {
  const socketMetrics = useSocketStore((state) => state.metrics);
  const socketIncidents = useSocketStore((state) => state.incidents);
  const socketDeployments = useSocketStore((state) => state.deployments);
  const { incidents } = useIncidents();
  const { deployments } = useDeployments();
  const { services } = useServices();
  const [selectedIncident, setSelectedIncident] = useState<Incident>();

  const liveIncidents = socketIncidents.length > 0 ? socketIncidents : incidents;
  const liveDeployments = socketDeployments.length > 0 ? socketDeployments : deployments;
  const liveMetrics = socketMetrics;

  const metricCards = useMemo(() => {
    const avgCpu = liveMetrics.length
      ? liveMetrics.reduce((sum, metric) => sum + metric.cpuPercent, 0) / liveMetrics.length
      : 0;
    const avgMemory = liveMetrics.length
      ? liveMetrics.reduce((sum, metric) => sum + metric.memoryPercent, 0) / liveMetrics.length
      : 0;
    const activeIncidents = liveIncidents.filter((item) => item.status !== 'resolved').length;
    const anomaliesToday = useSocketStore.getState().anomalies.length;
    return [
      { title: 'Services', value: String(services.length), delta: 2.1, sparkline: [2, 3, 3, 4, services.length || 1] },
      { title: 'Open Incidents', value: String(activeIncidents), delta: activeIncidents > 0 ? 18.4 : 0.4, sparkline: [0, 1, 0, 2, activeIncidents], critical: activeIncidents > 0 },
      { title: 'Anomalies Today', value: String(anomaliesToday), delta: anomaliesToday > 0 ? 8.1 : 0.3, sparkline: [0, 1, 1, 2, anomaliesToday] },
      { title: 'Deployments', value: String(liveDeployments.length), delta: liveDeployments.length > 0 ? 6.2 : 0.2, sparkline: [0, 1, 2, 3, liveDeployments.length] },
      { title: 'Average CPU', value: `${avgCpu.toFixed(1)}%`, delta: avgCpu / 10, sparkline: liveMetrics.map((item) => item.cpuPercent).slice(-20) },
      { title: 'Average Memory', value: `${avgMemory.toFixed(1)}%`, delta: avgMemory / 12, sparkline: liveMetrics.map((item) => item.memoryPercent).slice(-20) }
    ];
  }, [liveDeployments.length, liveIncidents, liveMetrics, services.length]);

  const chartData = liveMetrics.map((metric) => ({
    name: metric.containerName,
    cpu: metric.cpuPercent,
    memory: metric.memoryPercent
  }));

  const topServices = [...services]
    .sort((left, right) => (right.latestMetric?.cpuPercent ?? 0) - (left.latestMetric?.cpuPercent ?? 0))
    .slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <GlassCard className="overflow-hidden p-0">
        <div className="flex flex-col gap-6 border-b border-slate-200 px-8 py-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-primary">
              SYSTEM OVERVIEW
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-text">Clean, live, and readable</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Real metrics, deployment events, and incidents in one place without the heavy visual noise.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-elevated px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Mode</p>
              <p className="mt-2 text-lg font-semibold text-text">{useSocketStore.getState().mode}</p>
            </div>
            <div className="rounded-2xl bg-elevated px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Backend</p>
              <p className="mt-2 text-lg font-semibold text-text">Connected</p>
            </div>
            <div className="rounded-2xl bg-elevated px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Stream</p>
              <p className="mt-2 text-lg font-semibold text-text">{liveMetrics.length} metrics</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metricCards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.85fr]">
        <GlassCard className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text">Incident feed</h2>
              <p className="mt-1 text-sm text-muted">Newest alerts with deployment correlation context.</p>
            </div>
          </div>
          <IncidentFeed incidents={liveIncidents} onSelect={setSelectedIncident} />
        </GlassCard>
        <GlassCard className="p-0">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text">Recent deployments</h2>
                <p className="mt-1 text-sm text-muted">Latest webhook events received by FlowState.</p>
              </div>
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-success">
                Live
              </span>
            </div>
          </div>
          <div className="divide-y divide-slate-200">
            {liveDeployments.slice(0, 5).map((deployment) => (
              <div key={deployment.id ?? deployment.commitHash} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-text">
                      {deployment.repo}
                      <span className="ml-1 font-normal text-muted">/ {deployment.branch}</span>
                    </p>
                    <p className="mt-1 font-mono text-sm text-primary">{truncateHash(deployment.commitHash, 10)}</p>
                    <p className="mt-2 text-sm text-muted">{deployment.commitMessage}</p>
                  </div>
                  <div className="text-right text-sm text-muted">
                    <p className="font-medium text-text">{deployment.author}</p>
                    <p>{formatAgo(deployment.receivedAt ?? deployment.pushedAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <GlassCard className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-text">System metrics</h2>
            <p className="mt-1 text-sm text-muted">CPU and memory across live containers.</p>
          </div>
          <div className="h-96">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#80868b" />
                <YAxis stroke="#80868b" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 8px 24px rgba(60,64,67,.12)'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="cpu" stroke="#1a73e8" fill="rgba(26,115,232,.12)" />
                <Area type="monotone" dataKey="memory" stroke="#5f86f2" fill="rgba(95,134,242,.12)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-0">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-text">Service health</h2>
            <p className="mt-1 text-sm text-muted">Highest current CPU consumers.</p>
          </div>
          <div className="divide-y divide-slate-200">
            {topServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <p className="font-medium text-text">{service.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    CPU {(service.latestMetric?.cpuPercent ?? 0).toFixed(1)}% • Memory {(service.latestMetric?.memoryPercent ?? 0).toFixed(1)}%
                  </p>
                </div>
                <StatusBadge status={service.state} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {selectedIncident ? <IncidentDetail incident={selectedIncident} onClose={() => setSelectedIncident(undefined)} /> : null}
    </motion.div>
  );
};
