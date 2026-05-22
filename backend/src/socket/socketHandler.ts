import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import type { Mode } from '../types/api.types.js';
import type { MetricRecord, AnomalyRecord } from '../types/metric.types.js';
import type { DeploymentRecord, IncidentRecord } from '../types/incident.types.js';

class SocketHandler {
  private io?: Server;

  initialize(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*'
      }
    });

    this.io.on('connection', (socket) => {
      socket.emit('connection:status', {
        dockerConnected: true,
        dbConnected: true
      });
    });
  }

  emitMetricsUpdate(containers: MetricRecord[], mode: Mode, warning?: string) {
    this.io?.emit('metrics:update', { mode, warning, containers });
  }

  emitAnomalyDetected(anomaly: AnomalyRecord) {
    this.io?.emit('anomaly:detected', { anomaly });
  }

  emitIncidentOpened(incident: IncidentRecord) {
    this.io?.emit('incident:opened', { incident });
  }

  emitIncidentUpdated(incident: IncidentRecord) {
    this.io?.emit('incident:updated', { incident });
  }

  emitDeploymentReceived(deployment: DeploymentRecord) {
    this.io?.emit('deployment:received', { deployment });
  }

  emitConnectionStatus(status: {
    dockerConnected: boolean;
    dbConnected: boolean;
    redisConnected?: boolean;
  }) {
    this.io?.emit('connection:status', status);
  }
}

export const socketHandler = new SocketHandler();

