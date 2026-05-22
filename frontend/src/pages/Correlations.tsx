import { GlassCard } from '../components/cards/GlassCard';
import { useDeployments } from '../hooks/useDeployments';
import { Scatter, ScatterChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';

export const Correlations = () => {
  const { correlations, deployments } = useDeployments();
  const chartData = correlations.map((row, index) => ({ x: index + 1, zscore: row.zscore, label: row.anomalyContainerName }));

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="mb-4 text-2xl font-semibold">Deployment to Anomaly Correlation</h2>
        <div className="h-96">
          <ResponsiveContainer>
            <ScatterChart>
              <CartesianGrid stroke="rgba(148,163,184,.08)" />
              <XAxis dataKey="x" stroke="#94A3B8" />
              <YAxis dataKey="zscore" stroke="#94A3B8" />
              <Tooltip />
              {deployments.slice(0, 5).map((_, index) => (
                <ReferenceLine key={index} x={index + 1} stroke="#818CF8" strokeDasharray="4 4" />
              ))}
              <Scatter data={chartData} fill="#F87171" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
      <GlassCard>
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3">Anomaly</th>
                <th className="pb-3">Deployment</th>
                <th className="pb-3">Confidence</th>
                <th className="pb-3">Delta</th>
                <th className="pb-3">Incident</th>
              </tr>
            </thead>
            <tbody>
              {correlations.map((row) => (
                <tr key={row.incidentId} className="border-t border-sky-300/10">
                  <td className="py-3">{row.anomalyContainerName} / {row.anomalyMetric}</td>
                  <td className="py-3">{row.deploymentCommit ?? 'None'}</td>
                  <td className="py-3">{row.confidence}</td>
                  <td className="py-3">{row.timeDeltaMinutes?.toFixed(2) ?? '--'} min</td>
                  <td className="py-3">{row.incidentId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

