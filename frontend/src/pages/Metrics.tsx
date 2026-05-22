import { useEffect, useState } from 'react';
import { GlassCard } from '../components/cards/GlassCard';
import { AnomalyChart } from '../components/charts/AnomalyChart';
import { useServices } from '../hooks/useServices';
import { useMetrics } from '../hooks/useMetrics';

export const Metrics = () => {
  const { services } = useServices();
  const [serviceId, setServiceId] = useState<string>();

  useEffect(() => {
    if (!serviceId && services[0]?.id) {
      setServiceId(services[0].id);
    }
  }, [serviceId, services]);

  const { metrics, anomalies } = useMetrics(serviceId);

  return (
    <div className="space-y-6">
      <GlassCard>
        <select
          value={serviceId}
          onChange={(event) => setServiceId(event.target.value)}
          className="rounded-2xl border border-sky-300/10 bg-surface px-4 py-3 text-text"
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>{service.name}</option>
          ))}
        </select>
      </GlassCard>
      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard><h3 className="mb-4 text-lg font-semibold">CPU %</h3><AnomalyChart data={metrics} keyName="cpuPercent" /></GlassCard>
        <GlassCard><h3 className="mb-4 text-lg font-semibold">Memory %</h3><AnomalyChart data={metrics} keyName="memoryPercent" /></GlassCard>
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
              </tr>
            </thead>
            <tbody>
              {anomalies.map((item) => (
                <tr key={item.id} className="border-t border-sky-300/10">
                  <td className="py-3">{new Date(item.detectedAt).toLocaleString()}</td>
                  <td className="py-3">{item.metricName}</td>
                  <td className="py-3">{item.metricValue.toFixed(2)}</td>
                  <td className="py-3 text-critical">{item.zscore.toFixed(2)}</td>
                  <td className="py-3">{item.meanBaseline.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

