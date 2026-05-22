import { useEffect, useMemo, useState } from 'react';
import { GlassCard } from '../components/cards/GlassCard';
import { AnomalyChart } from '../components/charts/AnomalyChart';
import { useServices } from '../hooks/useServices';
import { useMetrics } from '../hooks/useMetrics';
import { useSearchParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { OverviewStat } from '../components/common/OverviewStat';
import { EmptyState } from '../components/common/EmptyState';
import { FallbackBanner } from '../components/common/FallbackBanner';

export const Metrics = () => {
  const { services, warning } = useServices();
  const [params] = useSearchParams();
  const [serviceId, setServiceId] = useState<string>();
  const presetService = params.get('service') ?? undefined;

  useEffect(() => {
    if (!serviceId && services[0]?.id) {
      setServiceId(presetService ?? services[0].id);
    }
  }, [presetService, serviceId, services]);

  const selectedService = services.find((service) => service.id === serviceId);
  const { metrics, anomalies } = useMetrics(serviceId);
  const chartData = useMemo(
    () =>
      metrics.map((metric) => ({
        time: new Date(metric.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cpuPercent: metric.cpuPercent,
        memoryPercent: metric.memoryPercent,
        networkRxBytes: metric.networkRxBytes,
        networkTxBytes: metric.networkTxBytes,
        restartCount: metric.restartCount
      })),
    [metrics]
  );

  const maxCpu = chartData.reduce((max, point) => Math.max(max, point.cpuPercent), 0);
  const maxMemory = chartData.reduce((max, point) => Math.max(max, point.memoryPercent), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metrics"
        description="Historical service metrics and anomalies."
        actions={
          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-text outline-none"
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        }
      >
        <OverviewStat label="Service" value={selectedService?.name ?? '--'} hint="Selected service." tone="primary" />
        <OverviewStat label="Max CPU" value={`${maxCpu.toFixed(1)}%`} hint="Window peak." />
        <OverviewStat label="Max Memory" value={`${maxMemory.toFixed(1)}%`} hint="Window peak." />
        <OverviewStat label="Anomalies" value={anomalies.length} hint="Detected rows." tone={anomalies.length > 0 ? 'warning' : 'success'} />
      </PageHeader>

      <FallbackBanner warning={warning} />

      {services.length === 0 ? (
        <EmptyState title="Metrics unavailable" description="No service sources are available yet." />
      ) : (
        <>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 text-[19px] font-semibold tracking-[-0.02em] text-text">CPU %</h3>
          <AnomalyChart data={metrics} keyName="cpuPercent" />
        </GlassCard>
        <GlassCard>
          <h3 className="mb-4 text-[19px] font-semibold tracking-[-0.02em] text-text">Memory %</h3>
          <AnomalyChart data={metrics} keyName="memoryPercent" />
        </GlassCard>
        <GlassCard>
          <h3 className="mb-4 text-[19px] font-semibold tracking-[-0.02em] text-text">Network RX / TX</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="time" stroke="#80868b" tickLine={false} axisLine={false} />
                <YAxis stroke="#80868b" tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="networkRxBytes" stroke="#1a73e8" strokeWidth={2.4} dot={false} />
                <Line type="monotone" dataKey="networkTxBytes" stroke="#1e8e3e" strokeWidth={2.4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="mb-4 text-[19px] font-semibold tracking-[-0.02em] text-text">Restart Count</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="time" stroke="#80868b" tickLine={false} axisLine={false} />
                <YAxis stroke="#80868b" allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="restartCount" fill="#d93025" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-text">Anomaly History</h3>
            <p className="mt-1 text-sm text-muted">Recent anomaly rows.</p>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-dim">
              <tr>
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3 pr-4">Metric</th>
                <th className="pb-3 pr-4">Value</th>
                <th className="pb-3 pr-4">Z-Score</th>
                <th className="pb-3 pr-4">Baseline Mean</th>
                <th className="pb-3">Linked Incident</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/80">
                  <td className="py-4 pr-4">{new Date(item.detectedAt).toLocaleString()}</td>
                  <td className="py-4 pr-4">{item.metricName}</td>
                  <td className="py-4 pr-4">{item.metricValue.toFixed(2)}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-critical" style={{ width: `${Math.min(item.zscore * 20, 100)}%` }} />
                      </div>
                      <span className="font-mono text-critical">{item.zscore.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">{item.meanBaseline.toFixed(2)}</td>
                  <td className="py-4 font-mono text-sm text-primary">{item.linkedIncidentId ?? '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
        </>
      )}
    </div>
  );
};
