import { useEffect, useState } from 'react';
import { servicesApi } from '../services/services.api';
import type { Service } from '../types/service.types';
import type { Mode } from '../types/api.types';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [mode, setMode] = useState<Mode>('real');
  const [warning, setWarning] = useState<string>();

  useEffect(() => {
    void servicesApi.list().then((result) => {
      setServices(result.data);
      setMode(result.mode);
      setWarning(result.warning);
    });
  }, []);

  return { services, mode, warning, setServices };
};

