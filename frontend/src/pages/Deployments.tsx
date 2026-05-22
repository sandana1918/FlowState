import { GlassCard } from '../components/cards/GlassCard';
import { DeploymentTimeline } from '../components/deployments/DeploymentTimeline';
import { useDeployments } from '../hooks/useDeployments';
import { useSocketStore } from '../store/socketStore';
import { formatAgo, truncateHash } from '../utils/formatters';
import { PageHeader } from '../components/common/PageHeader';
import { OverviewStat } from '../components/common/OverviewStat';

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
  const correlatedCount = liveDeployments.filter((deployment) => correlationByCommit.has(deployment.commitHash)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Release Audit"
        title="Deployments"
        description="A release stream built for operators: commit context, author identity, and correlation status without noisy chrome."
      >
        <OverviewStat label="Today" value={deploymentsToday.length} hint="Deployments received today." tone="primary" />
        <OverviewStat label="Correlated" value={correlatedCount} hint="Deployments linked to anomalies or incidents." tone={correlatedCount > 0 ? 'warning' : 'success'} />
        <OverviewStat label="Latest" value={liveDeployments[0] ? truncateHash(liveDeployments[0].commitHash, 7) : '--'} hint={liveDeployments[0] ? `Seen ${formatAgo(liveDeployments[0].receivedAt ?? liveDeployments[0].pushedAt)}` : 'No deployment yet.'} />
        <OverviewStat label="Repos" value={new Set(liveDeployments.map((deployment) => deployment.repo)).size} hint="Distinct repositories in the stream." />
      </PageHeader>

      <GlassCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dim">Volume</p>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-text">Deployments by hour</h2>
          </div>
          <p className="text-sm text-muted">Latest webhook events update live without page reload.</p>
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
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="flex gap-4">
                  {deployment.avatarUrl ? (
                    <img src={deployment.avatarUrl} alt={deployment.author} className="h-12 w-12 rounded-full border border-slate-200 object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {initials}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-dim">Release</p>
                      <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-text">
                        {deployment.repo}
                        <span className="ml-2 text-sm font-normal text-muted">/{deployment.branch || 'branch'}</span>
                      </h3>
                    </div>
                    <div className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 font-mono text-sm text-primary">
                      {deployment.commitHash}
                    </div>
                    <p className="text-sm leading-7 text-muted">{deployment.commitMessage || 'No commit message provided.'}</p>
                  </div>
                </div>
                <div className="space-y-3 text-right text-sm">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-dim">Author</p>
                    <p className="mt-1 font-medium text-text">{deployment.author}</p>
                  </div>
                  <p className="text-muted">{formatAgo(deployment.receivedAt ?? deployment.pushedAt)}</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${correlated ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                      {correlated ? 'Correlated' : 'Clean'}
                    </span>
                    {correlated ? (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {correlated.confidence}
                      </span>
                    ) : null}
                    <button
                      onClick={() => navigator.clipboard.writeText(deployment.commitHash)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-text transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Copy hash
                    </button>
                  </div>
                  <p className="text-xs text-muted">
                    {truncateHash(deployment.commitHash, 8)} pushed at {new Date(deployment.pushedAt).toLocaleString()}
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
