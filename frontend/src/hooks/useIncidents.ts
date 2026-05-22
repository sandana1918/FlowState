import { useEffect, useState } from 'react';
import { incidentsApi } from '../services/incidents.api';
import type { Incident } from '../types/incident.types';

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    void incidentsApi.list().then((result) => setIncidents(result.data));
  }, []);

  return { incidents, setIncidents };
};

