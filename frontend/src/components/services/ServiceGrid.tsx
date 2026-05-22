import { ServiceCard } from '../cards/ServiceCard';
import type { Service } from '../../types/service.types';

export const ServiceGrid = ({ services }: { services: Service[] }) => (
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    {services.map((service) => (
      <ServiceCard key={service.id} service={service} />
    ))}
  </div>
);
