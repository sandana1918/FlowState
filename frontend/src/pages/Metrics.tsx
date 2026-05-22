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

export const Metrics = () => {
  const { services } = useServices();
  const [params] = useSearchParams();
  const [serviceId, setServiceId] = useState<string>();
  const presetService = params.get('service') ?? undefined;

  useEffect(() => {
    if (!serviceId && services[0]?.id) {
      setServiceId(presetService ?? services[0].id);
    }
  }, [presetService, serviceId, services]);

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

  return (
    <div className="space-y-6">
      <GlassCard className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-text">Metrics</h2>
          <p className="mt-2 text-sm text-muted">CPU, memory, network, restart trends, and anomaly history for a single service.</p>
        </div>
        <select
          value={serviceId}
          onChange={(event) => setServiceId(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-surface px-4 py-3 text-text"
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>{service.name}</option>
          ))}
        </select>
      </GlassCard>
      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard><h3 className="mb-4 text-lg font-semibold">CPU %</h3><AnomalyChart data={metrics} keyName="cpuPercent" /></GlassCard>
        <GlassCard><h3 className="mb-4 text-lg font-semibold">Memory %</h3><AnomalyChart data={metrics} keyName="memoryPercent" /></GlassCard>
        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold">Network RX/TX</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="time" stroke="#80868b" />
                <YAxis stroke="#80868b" />
                <Tooltip />
                <Line type="monotone" dataKey="networkRxBytes" stroke="#1a73e8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="networkTxBytes" stroke="#1e8e3e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold">Restart Count</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="time" stroke="#80868b" />
                <YAxis stroke="#80868b" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="restartCount" fill="#d93025" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold">Anomaly History</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3">Time</th>
                <th className="pb-3">Metric</th>
                <th className="pb-3">Value</th>
                <th className="pb-3">Z-Score</th>
                <th className="pb-3">Baseline Mean</th>
                <th className="pb-3">Linked Incident</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((item) => (
                <tr key={item.id} className="border-t border-sky-300/10">
                  <td className="py-3">{new Date(item.detectedAt).toLocaleString()}</td>
                  <td className="py-3">{item.metricName}</td>
                  <td className="py-3">{item.metricValue.toFixed(2)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-critical" style={{ width: `${Math.min(item.zscore * 20, 100)}%` }} />
                      </div>
                      <span className="text-critical">{item.zscore.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="py-3">{item.meanBaseline.toFixed(2)}</td>
                  <td className="py-3 font-mono text-sm text-primary">{item.linkedIncidentId ?? '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
