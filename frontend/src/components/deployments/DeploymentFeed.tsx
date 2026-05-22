import { DeploymentCard } from '../cards/DeploymentCard';
import type { Deployment } from '../../types/deployment.types';

export const DeploymentFeed = ({ deployments }: { deployments: Deployment[] }) => (
  <div className="space-y-4">
    {deployments.map((deployment) => (
      <DeploymentCard key={deployment.id ?? deployment.commitHash} deployment={deployment} />
    ))}
  </div>
);

