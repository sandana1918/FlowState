import { ServiceGrid } from '../components/services/ServiceGrid';
import { useServices } from '../hooks/useServices';
import { useSocketStore } from '../store/socketStore';
import { GlassCard } from '../components/cards/GlassCard';

export const Services = () => {
  const { services } = useServices();
  const metrics = useSocketStore((state) => state.metrics);
  const metricMap = new Map(metrics.map((metric) => [metric.containerId, metric]));
  const mergedServices = services.map((service) => ({
    ...service,
    latestMetric: metricMap.get(service.id) ?? service.latestMetric
  }));

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="text-2xl font-semibold text-text">Services</h2>
        <p className="mt-2 text-sm text-muted">
          Real Docker containers with live CPU, memory, restart, and quick navigation to logs and metrics.
        </p>
      </GlassCard>
      <ServiceGrid services={mergedServices} />
    </div>
  );
};
