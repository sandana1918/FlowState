import { GlassCard } from '../components/cards/GlassCard';
import { DeploymentFeed } from '../components/deployments/DeploymentFeed';
import { DeploymentTimeline } from '../components/deployments/DeploymentTimeline';
import { useDeployments } from '../hooks/useDeployments';
import { useSocketStore } from '../store/socketStore';

export const Deployments = () => {
  const { deployments } = useDeployments();
  const liveDeployments = useSocketStore((state) => (state.deployments.length ? state.deployments : deployments));

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="mb-4 text-2xl font-semibold">Deployments</h2>
        <DeploymentTimeline deployments={liveDeployments} />
      </GlassCard>
      <DeploymentFeed deployments={liveDeployments} />
    </div>
  );
};

