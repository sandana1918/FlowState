import type { ContainerMetric } from './metric.types';

export interface Service {
  id: string;
  name: string;
  image: string;
  imageTag: string;
  state: string;
  status: string;
  createdAt: string;
  latestMetric?: ContainerMetric | null;
}
