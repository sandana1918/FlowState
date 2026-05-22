import { GlassCard } from '../components/cards/GlassCard';
import { DeploymentTimeline } from '../components/deployments/DeploymentTimeline';
import { useDeployments } from '../hooks/useDeployments';
import { useSocketStore } from '../store/socketStore';
import { formatAgo, truncateHash } from '../utils/formatters';

export const Deployments = () => {
  const { deployments, correlations } = useDeployments();
  const liveDeployments = useSocketStore((state) => (state.deployments.length ? state.deployments : deployments));
  const correlationByCommit = new Map(
    correlations
      .filter((item) => item.deploymentCommit)
      .map((item) => [item.deploymentCommit as string, item])
  );
  const deploymentsToday = liveDeployments.filter(
    (deployment) => new Date(deployment.receivedAt ?? deployment.pushedAt).toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-6">
      <GlassCard className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-text">Deployments</h2>
            <p className="mt-2 text-sm text-muted">
              {deploymentsToday.length} today • last event {liveDeployments[0] ? formatAgo(liveDeployments[0].receivedAt ?? liveDeployments[0].pushedAt) : 'n/a'}
            </p>
          </div>
        </div>
        <DeploymentTimeline deployments={liveDeployments} />
      </GlassCard>
      <div className="space-y-4">
        {liveDeployments.map((deployment) => {
          const correlated = correlationByCommit.get(deployment.commitHash);
          const initials = deployment.author
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          return (
            <GlassCard key={deployment.id ?? deployment.commitHash}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-4">
                  {deployment.avatarUrl ? (
                    <img src={deployment.avatarUrl} alt={deployment.author} className="h-11 w-11 rounded-full border border-slate-200 object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {initials}
                    </div>
                  )}
                  <div>
                    <p className="text-base font-semibold text-text">
                      {deployment.repo}
                      <span className="ml-2 text-sm font-normal text-muted">/{deployment.branch}</span>
                    </p>
                    <p className="mt-1 font-mono text-sm text-primary">{deployment.commitHash}</p>
                    <p className="mt-2 text-sm text-muted">{deployment.commitMessage}</p>
                  </div>
                </div>
                <div className="space-y-2 text-right text-sm">
                  <p className="font-medium text-text">{deployment.author}</p>
                  <p className="text-muted">{formatAgo(deployment.receivedAt ?? deployment.pushedAt)}</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${correlated ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                      {correlated ? 'Correlated with incident' : 'Clean'}
                    </span>
                    {correlated ? (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {correlated.confidence}
                      </span>
                    ) : null}
                    <button
                      onClick={() => navigator.clipboard.writeText(deployment.commitHash)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-text"
                    >
                      Copy hash
                    </button>
                  </div>
                  <p className="text-xs text-muted">
                    {truncateHash(deployment.commitHash, 7)} pushed at {new Date(deployment.pushedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
