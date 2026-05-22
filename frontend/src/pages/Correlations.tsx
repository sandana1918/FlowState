import { GlassCard } from '../components/cards/GlassCard';
import { useDeployments } from '../hooks/useDeployments';
import { Scatter, ScatterChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { formatAgo, truncateHash } from '../utils/formatters';
import { PageHeader } from '../components/common/PageHeader';
import { OverviewStat } from '../components/common/OverviewStat';

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

  const highConfidence = correlations.filter((row) => row.confidence === 'HIGH').length;
  const linkedRows = correlations.filter((row) => row.deploymentCommit).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Correlations"
        description="Anomalies matched to recent deployments."
      >
        <OverviewStat label="Rows" value={correlations.length} hint="Returned rows." />
        <OverviewStat label="Linked" value={linkedRows} hint="Rows with a deployment." tone="primary" />
        <OverviewStat label="High Confidence" value={highConfidence} hint="Strong matches." tone={highConfidence > 0 ? 'warning' : 'success'} />
        <OverviewStat label="Deployments" value={deployments.length} hint="Overlay events." />
      </PageHeader>

      <GlassCard className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dim">Scatter</p>
          <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-text">Deployment to anomaly timeline</h2>
        </div>
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
                    stroke="#1a73e8"
                    strokeDasharray="4 4"
                  />
                ))}
              <Scatter data={chartData} fill="#d93025" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-text">Correlation rows</h3>
            <p className="mt-1 text-sm text-muted">Most recent first.</p>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-dim">
              <tr>
                <th className="pb-3 pr-4">Anomaly</th>
                <th className="pb-3 pr-4">Deployment</th>
                <th className="pb-3 pr-4">Confidence</th>
                <th className="pb-3 pr-4">Delta</th>
                <th className="pb-3">Incident</th>
              </tr>
            </thead>
            <tbody>
              {correlations.map((row) => (
                <tr key={row.incidentId} className="border-t border-slate-200/80">
                  <td className="py-4 pr-4">
                    <div className="font-medium text-text">{row.anomalyContainerName}</div>
                    <div className="text-xs text-muted">{row.anomalyMetric}</div>
                  </td>
                  <td className="py-4 pr-4">
                    {row.deploymentCommit ? (
                      <div>
                        <div className="font-mono text-primary">{truncateHash(row.deploymentCommit, 10)}</div>
                        <div className="text-xs text-muted">
                          {row.deploymentRepo ?? 'repo'} / {row.deploymentBranch ?? 'branch'} | {row.deploymentAuthor ?? 'unknown'}
                        </div>
                      </div>
                    ) : 'None'}
                  </td>
                  <td className="py-4 pr-4">{row.confidence}</td>
                  <td className="py-4 pr-4">{row.timeDeltaMinutes?.toFixed(2) ?? '--'} min</td>
                  <td className="py-4">
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
