import { GitCommitHorizontal } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { formatAgo, truncateHash } from '../../utils/formatters';
import type { Deployment } from '../../types/deployment.types';

export const DeploymentCard = ({ deployment }: { deployment: Deployment }) => (
  <GlassCard>
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-text">
          <GitCommitHorizontal size={16} className="text-secondary" />
          <span className="font-semibold">{deployment.repo}</span>
          <span className="text-muted">/{deployment.branch}</span>
        </div>
        <p className="font-mono text-sm text-primary">{truncateHash(deployment.commitHash, 10)}</p>
        <p className="text-sm text-muted">{deployment.commitMessage}</p>
      </div>
      <div className="text-right text-sm text-muted">
        <p>{deployment.author}</p>
        <p>{formatAgo(deployment.receivedAt ?? deployment.pushedAt)}</p>
      </div>
    </div>
  </GlassCard>
);

