import { GlassCard } from '../components/cards/GlassCard';
import { useDeployments } from '../hooks/useDeployments';
import { Scatter, ScatterChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { formatAgo, truncateHash } from '../utils/formatters';

export const Correlations = () => {
  const { correlations, deployments } = useDeployments();
  const chartData = correlations
    .filter((row) => row.incidentOpenedAt)
    .map((row) => ({
      timestamp: new Date(row.incidentOpenedAt as string).getTime(),
      zscore: row.zscore,
      label: row.anomalyContainerName,
      metric: row.anomalyMetric,
      deploymentCommit: row.deploymentCommit
    }));

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="mb-4 text-2xl font-semibold">Deployment to Anomaly Correlation</h2>
        <div className="h-96">
          <ResponsiveContainer>
            <ScatterChart>
              <CartesianGrid stroke="#e5e7eb" />
              <XAxis
                type="number"
                dataKey="timestamp"
                stroke="#80868b"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis dataKey="zscore" stroke="#80868b" />
              <Tooltip
                formatter={(value, key) => [value, key]}
                labelFormatter={(label) => new Date(Number(label)).toLocaleString()}
              />
              {deployments
                .filter((deployment) => deployment.receivedAt)
                .slice(0, 12)
                .map((deployment) => (
                <ReferenceLine
                  key={deployment.id ?? deployment.commitHash}
                  x={new Date(deployment.receivedAt as string).getTime()}
                  stroke="#5f86f2"
                  strokeDasharray="4 4"
                />
              ))}
              <Scatter data={chartData} fill="#d93025" />
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
                  <td className="py-3">
                    {row.deploymentCommit ? (
                      <div>
                        <div className="font-mono text-primary">{truncateHash(row.deploymentCommit, 10)}</div>
                        <div className="text-xs text-muted">
                          {row.deploymentRepo ?? 'repo'} / {row.deploymentBranch ?? 'branch'} • {row.deploymentAuthor ?? 'unknown'}
                        </div>
                      </div>
                    ) : 'None'}
                  </td>
                  <td className="py-3">{row.confidence}</td>
                  <td className="py-3">{row.timeDeltaMinutes?.toFixed(2) ?? '--'} min</td>
                  <td className="py-3">
                    <div className="font-mono text-primary">{row.incidentId}</div>
                    <div className="text-xs text-muted">{row.incidentOpenedAt ? formatAgo(row.incidentOpenedAt) : ''}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
