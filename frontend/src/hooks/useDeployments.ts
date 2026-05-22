import { useEffect, useState } from 'react';
import { deploymentsApi } from '../services/deployments.api';
import type { Deployment } from '../types/deployment.types';
import type { CorrelationRow } from '../types/incident.types';

export const useDeployments = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationRow[]>([]);

  useEffect(() => {
    void deploymentsApi.list().then((result) => setDeployments(result.data));
    void deploymentsApi.correlations().then((result) => setCorrelations(result.data));
  }, []);

  return { deployments, correlations, setDeployments };
};

