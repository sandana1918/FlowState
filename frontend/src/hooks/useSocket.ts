import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useSocketStore } from '../store/socketStore';
import type { ContainerMetric, Anomaly } from '../types/metric.types';
import type { Incident } from '../types/incident.types';
import type { Deployment } from '../types/deployment.types';

export const useSocket = () => {
  const setConnected = useSocketStore((state) => state.setConnected);
  const setMetrics = useSocketStore((state) => state.setMetrics);
  const pushAnomaly = useSocketStore((state) => state.pushAnomaly);
  const pushIncident = useSocketStore((state) => state.pushIncident);
  const updateIncident = useSocketStore((state) => state.updateIncident);
  const pushDeployment = useSocketStore((state) => state.pushDeployment);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_URL ?? 'http://localhost:5000', {
      transports: ['websocket']
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('metrics:update', (payload: { mode: 'real' | 'fallback'; warning?: string; containers: ContainerMetric[] }) => {
      setMetrics(payload.mode, payload.containers, payload.warning);
    });
    socket.on('anomaly:detected', ({ anomaly }: { anomaly: Anomaly }) => pushAnomaly(anomaly));
    socket.on('incident:opened', ({ incident }: { incident: Incident }) => pushIncident(incident));
    socket.on('incident:updated', ({ incident }: { incident: Incident }) => updateIncident(incident));
    socket.on('deployment:received', ({ deployment }: { deployment: Deployment }) => pushDeployment(deployment));

    return () => {
      socket.disconnect();
    };
  }, [pushAnomaly, pushDeployment, pushIncident, setConnected, setMetrics, updateIncident]);
};
