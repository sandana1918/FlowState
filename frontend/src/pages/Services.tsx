import { ServiceGrid } from '../components/services/ServiceGrid';
import { useServices } from '../hooks/useServices';

export const Services = () => {
  const { services } = useServices();
  return <ServiceGrid services={services} />;
};

