import { create } from 'zustand';

interface ServiceStore {
  selectedServiceId?: string;
  setSelectedServiceId: (serviceId?: string) => void;
}

export const useServiceStore = create<ServiceStore>((set) => ({
  selectedServiceId: undefined,
  setSelectedServiceId: (selectedServiceId) => set({ selectedServiceId })
}));

