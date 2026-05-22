import { create } from 'zustand';
import type { Incident } from '../types/incident.types';

interface IncidentStore {
  selectedIncident?: Incident;
  setSelectedIncident: (incident?: Incident) => void;
}

export const useIncidentStore = create<IncidentStore>((set) => ({
  selectedIncident: undefined,
  setSelectedIncident: (incident) => set({ selectedIncident: incident })
}));

