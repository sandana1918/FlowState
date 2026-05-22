import { GlassCard } from '../cards/GlassCard';
import type { Service } from '../../types/service.types';

export const ServiceDetailPanel = ({ service }: { service?: Service }) =>
  service ? (
    <GlassCard>
      <h3 className="font-mono text-xl text-text">{service.name}</h3>
      <p className="mt-2 text-sm text-muted">{service.image}:{service.imageTag}</p>
    </GlassCard>
  ) : null;

