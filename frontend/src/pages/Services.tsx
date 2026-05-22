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
        eyebrow="Runtime Fleet"
        title="Services"
        description="A cleaner service inventory with live health, current pressure, and direct drill-down paths into logs and metrics."
      >
        <OverviewStat label="Containers" value={mergedServices.length} hint="Docker services currently visible." tone="primary" />
        <OverviewStat label="Avg CPU" value={`${(mergedServices.length ? totalCpu / mergedServices.length : 0).toFixed(1)}%`} hint="Live CPU across the fleet." />
        <OverviewStat label="Avg Memory" value={`${(mergedServices.length ? totalMemory / mergedServices.length : 0).toFixed(1)}%`} hint="Live memory utilization across services." />
        <OverviewStat label="Restarting" value={restarting} hint="Services with recent restart activity." tone={restarting > 0 ? 'warning' : 'success'} />
      </PageHeader>
      <ServiceGrid services={mergedServices} />
    </div>
  );
};
