import { ServiceGrid } from '../components/services/ServiceGrid';
import { useServices } from '../hooks/useServices';
import { useSocketStore } from '../store/socketStore';
import { PageHeader } from '../components/common/PageHeader';
import { OverviewStat } from '../components/common/OverviewStat';

export const Services = () => {
  const { services } = useServices();
  const metrics = useSocketStore((state) => state.metrics);
  const metricMap = new Map(metrics.map((metric) => [metric.containerId, metric]));
  const mergedServices = services.map((service) => ({
    ...service,
    latestMetric: metricMap.get(service.id) ?? service.latestMetric
  }));

  const totalCpu = mergedServices.reduce((sum, service) => sum + (service.latestMetric?.cpuPercent ?? 0), 0);
  const totalMemory = mergedServices.reduce((sum, service) => sum + (service.latestMetric?.memoryPercent ?? 0), 0);
  const restarting = mergedServices.filter((service) => (service.latestMetric?.restartCount ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Running containers and current health."
      >
        <OverviewStat label="Containers" value={mergedServices.length} hint="Running services." tone="primary" />
        <OverviewStat label="Avg CPU" value={`${(mergedServices.length ? totalCpu / mergedServices.length : 0).toFixed(1)}%`} hint="Fleet average." />
        <OverviewStat label="Avg Memory" value={`${(mergedServices.length ? totalMemory / mergedServices.length : 0).toFixed(1)}%`} hint="Fleet average." />
        <OverviewStat label="Restarting" value={restarting} hint="Recent restarts." tone={restarting > 0 ? 'warning' : 'success'} />
      </PageHeader>
      <ServiceGrid services={mergedServices} />
    </div>
  );
};
