import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { GlassCard } from '../components/cards/GlassCard';
import { MetricCard } from '../components/cards/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { IncidentDetail } from '../components/incidents/IncidentDetail';
import { IncidentFeed } from '../components/incidents/IncidentFeed';
import { useDeployments } from '../hooks/useDeployments';
import { useIncidents } from '../hooks/useIncidents';
import { useServices } from '../hooks/useServices';
import { metricsApi } from '../services/metrics.api';
import { useSocketStore } from '../store/socketStore';
import type { Incident } from '../types/incident.types';
import type { ContainerMetric } from '../types/metric.types';
import { formatAgo, truncateHash } from '../utils/formatters';

const seriesColors = ['#1f5f8b', '#597e9c', '#2f6f54', '#b68132', '#a5584a', '#7e8a90'];

export const Dashboard = () => {
  const socketMetrics = useSocketStore((state) => state.metrics);
  const socketIncidents = useSocketStore((state) => state.incidents);
  const socketDeployments = useSocketStore((state) => state.deployments);
  const socketAnomalies = useSocketStore((state) => state.anomalies);
  const { incidents } = useIncidents();
  const { deployments } = useDeployments();
  const { services } = useServices();
  const [selectedIncident, setSelectedIncident] = useState<Incident>();
  const [historicalMetrics, setHistoricalMetrics] = useState<ContainerMetric[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<ContainerMetric[]>([]);

  const liveIncidents = socketIncidents.length > 0 ? socketIncidents : incidents;
  const liveDeployments = socketDeployments.length > 0 ? socketDeployments : deployments;
  const liveMetrics = socketMetrics.length > 0 ? socketMetrics : currentMetrics;

  useEffect(() => {
    void metricsApi.current().then((result) => setCurrentMetrics(result.data));
    void metricsApi.overview(30).then((result) => setHistoricalMetrics(result.data));
  }, [socketMetrics.length]);

  const mergedServices = useMemo(() => {
    const liveMetricMap = new Map(liveMetrics.map((metric) => [metric.containerId, metric]));
    return services.map((service) => ({
      ...service,
      latestMetric: liveMetricMap.get(service.id) ?? service.latestMetric
    }));
  }, [liveMetrics, services]);

  const metricCards = useMemo(() => {
    const avgCpu = mergedServices.length
      ? mergedServices.reduce((sum, service) => sum + (service.latestMetric?.cpuPercent ?? 0), 0) / mergedServices.length
      : 0;
    const avgMemory = mergedServices.length
      ? mergedServices.reduce((sum, service) => sum + (service.latestMetric?.memoryPercent ?? 0), 0) / mergedServices.length
      : 0;
    const activeIncidents = liveIncidents.filter((item) => item.status !== 'resolved').length;
    const anomaliesToday = socketAnomalies.length > 0 ? socketAnomalies.length : liveIncidents.length;
    const sparklineSource = liveMetrics.length > 0 ? liveMetrics : mergedServices.map((service) => service.latestMetric).filter(Boolean) as ContainerMetric[];

    return [
      { title: 'Services', value: String(mergedServices.length), delta: 0, sparkline: [Math.max(mergedServices.length - 1, 0), mergedServices.length, mergedServices.length, mergedServices.length, mergedServices.length] },
      { title: 'Open Incidents', value: String(activeIncidents), delta: activeIncidents > 0 ? 1 : 0, sparkline: [Math.max(activeIncidents - 1, 0), activeIncidents, activeIncidents, activeIncidents, activeIncidents], critical: activeIncidents > 0 },
      { title: 'Anomalies', value: String(anomaliesToday), delta: anomaliesToday > 0 ? 1 : 0, sparkline: [Math.max(anomaliesToday - 1, 0), anomaliesToday, anomaliesToday, anomaliesToday, anomaliesToday] },
      { title: 'Deployments', value: String(liveDeployments.length), delta: liveDeployments.length > 0 ? 1 : 0, sparkline: [Math.max(liveDeployments.length - 1, 0), liveDeployments.length, liveDeployments.length, liveDeployments.length, liveDeployments.length] },
      { title: 'Average CPU', value: `${avgCpu.toFixed(1)}%`, delta: avgCpu / 10, sparkline: sparklineSource.map((item) => item.cpuPercent).slice(-20) },
      { title: 'Average Memory', value: `${avgMemory.toFixed(1)}%`, delta: avgMemory / 12, sparkline: sparklineSource.map((item) => item.memoryPercent).slice(-20) }
    ];
  }, [liveDeployments.length, liveIncidents, liveMetrics, mergedServices, socketAnomalies.length]);

  const groupedHistory = useMemo(() => {
    const containerNames = [...new Set(historicalMetrics.map((metric) => metric.containerName))];
    const byTimestamp = new Map<string, Record<string, number | string>>();

    for (const metric of historicalMetrics) {
      const key = metric.collectedAt;
      const existing = byTimestamp.get(key) ?? {
        time: new Date(metric.collectedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      existing[metric.containerName] = metric.cpuPercent;
      byTimestamp.set(key, existing);
    }

    return {
      containerNames,
      chartData: [...byTimestamp.entries()].map(([timestamp, values]) => ({
        timestamp,
        ...values
      }))
    };
  }, [historicalMetrics]);

  const topServices = [...mergedServices]
    .sort((left, right) => (right.latestMetric?.cpuPercent ?? 0) - (left.latestMetric?.cpuPercent ?? 0))
    .slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <GlassCard>
        <h1 className="text-[40px] font-semibold tracking-[-0.06em] text-text">Overview</h1>
      </GlassCard>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metricCards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.85fr]">
        <GlassCard className="p-6">
          <div className="mb-5">
            <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-text">Incident feed</h2>
            <p className="mt-1 text-sm text-muted">Open incidents.</p>
          </div>
          <IncidentFeed incidents={liveIncidents} onSelect={setSelectedIncident} />
        </GlassCard>

        <GlassCard className="p-0">
          <div className="border-b border-white/65 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-text">Recent deployments</h2>
                <p className="mt-1 text-sm text-muted">Latest deliveries.</p>
              </div>
              <span className="rounded-full border border-success/12 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-success">
                Live
              </span>
            </div>
          </div>
          <div className="divide-y divide-white/60">
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
            <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-text">System metrics</h2>
            <p className="mt-1 text-sm text-muted">CPU over the last 30 minutes.</p>
          </div>
          <div className="h-96">
            <ResponsiveContainer>
              <AreaChart data={groupedHistory.chartData}>
                <CartesianGrid stroke="rgba(138,150,160,.16)" vertical={false} />
                <XAxis dataKey="time" stroke="#8a96a0" tickLine={false} axisLine={false} />
                <YAxis stroke="#8a96a0" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,.7)',
                    background: 'rgba(255,253,248,.92)',
                    boxShadow: '0 12px 28px rgba(68,76,84,.08)'
                  }}
                />
                <Legend />
                {groupedHistory.containerNames.map((containerName, index) => (
                  <Area
                    key={containerName}
                    type="monotone"
                    dataKey={containerName}
                    stroke={seriesColors[index % seriesColors.length]}
                    fill={seriesColors[index % seriesColors.length]}
                    fillOpacity={0.08}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-0">
          <div className="border-b border-white/65 px-6 py-5">
            <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-text">Service health</h2>
            <p className="mt-1 text-sm text-muted">Current load.</p>
          </div>
          <div className="divide-y divide-white/60">
            {topServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <p className="font-medium text-text">{service.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    CPU {(service.latestMetric?.cpuPercent ?? 0).toFixed(1)}% | Memory {(service.latestMetric?.memoryPercent ?? 0).toFixed(1)}%
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
