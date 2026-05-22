import Docker from 'dockerode';
import type { ContainerInfo } from 'dockerode';
import type {
  ContainerInspect,
  ContainerStats,
  ContainerSummary
} from '../types/docker.types.js';
import type { ServiceResult } from '../types/api.types.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

interface DockerNetworkStats {
  rx_bytes?: number;
  tx_bytes?: number;
}

interface DockerBlkioEntry {
  op?: string;
  value?: number | string;
}

interface DockerStatsPayload {
  cpu_stats: {
    cpu_usage: {
      total_usage?: number;
      percpu_usage?: number[];
    };
    system_cpu_usage?: number;
    online_cpus?: number;
  };
  precpu_stats: {
    cpu_usage: {
      total_usage?: number;
    };
    system_cpu_usage?: number;
  };
  memory_stats: {
    usage?: number;
    limit?: number;
  };
  networks?: Record<string, DockerNetworkStats>;
  blkio_stats: {
    io_service_bytes_recursive?: DockerBlkioEntry[];
  };
}

const docker = new Docker({
  socketPath: env.DOCKER_SOCKET_PATH
});

const mb = (value: number) => Number((value / 1024 / 1024).toFixed(2));

const createFallbackContainers = (): ContainerSummary[] => [
  {
    id: 'fallback-backend-api',
    name: 'backend-api',
    image: 'flowstate/backend:demo',
    imageTag: 'demo',
    state: 'running',
    status: 'Fallback mode',
    createdAt: new Date().toISOString()
  },
  {
    id: 'fallback-frontend',
    name: 'frontend',
    image: 'flowstate/frontend:demo',
    imageTag: 'demo',
    state: 'running',
    status: 'Fallback mode',
    createdAt: new Date().toISOString()
  }
];

const parseContainer = (container: ContainerInfo): ContainerSummary => {
  const imageParts = container.Image.split(':');
  return {
    id: container.Id,
    name: container.Names[0]?.replace(/^\//, '') ?? container.Id.slice(0, 12),
    image: imageParts[0] ?? container.Image,
    imageTag: imageParts[1] ?? 'latest',
    state: container.State,
    status: container.Status,
    createdAt: new Date(container.Created * 1000).toISOString()
  };
};

export class DockerService {
  async getVersion() {
    try {
      const version = await docker.version();
      return {
        version: String(version.Version ?? 'unknown'),
        apiVersion: String(version.ApiVersion ?? 'unknown'),
        os: String(version.Os ?? 'unknown'),
        arch: String(version.Arch ?? 'unknown')
      };
    } catch {
      return null;
    }
  }

  async isAvailable() {
    try {
      await docker.ping();
      return true;
    } catch {
      return false;
    }
  }

  async listContainers(): Promise<ServiceResult<ContainerSummary[]>> {
    try {
      const containers = await docker.listContainers({ all: true });
      if (containers.length === 0) {
        return {
          mode: 'fallback',
          warning: 'No running containers found. Showing fallback data.',
          data: createFallbackContainers()
        };
      }
      return {
        mode: 'real',
        data: containers.map(parseContainer)
      };
    } catch (error) {
      logger.warn('Docker Engine not reachable', { error: (error as Error).message });
      return {
        mode: 'fallback',
        warning: 'Docker Engine not reachable',
        data: createFallbackContainers()
      };
    }
  }

  async inspectContainer(containerId: string): Promise<ContainerInspect> {
    const inspect = await docker.getContainer(containerId).inspect();
    return {
      id: inspect.Id,
      name: inspect.Name.replace(/^\//, ''),
      image: inspect.Config.Image,
      state: inspect.State.Status,
      restartCount: inspect.RestartCount,
      startedAt: inspect.State.StartedAt,
      finishedAt: inspect.State.FinishedAt,
      env: inspect.Config.Env ?? [],
      labels: inspect.Config.Labels ?? {}
    };
  }

  async getContainerStats(containerId: string): Promise<ContainerStats> {
    const container = docker.getContainer(containerId);
    const [rawStats, inspect] = await Promise.all([
      container.stats({ stream: false }),
      container.inspect()
    ]);
    const stats = rawStats as DockerStatsPayload;
    const cpuDelta =
      (stats.cpu_stats.cpu_usage.total_usage ?? 0) -
      (stats.precpu_stats.cpu_usage.total_usage ?? 0);
    const systemDelta =
      (stats.cpu_stats.system_cpu_usage ?? 0) - (stats.precpu_stats.system_cpu_usage ?? 0);
    const numCpus =
      stats.cpu_stats.online_cpus ??
      stats.cpu_stats.cpu_usage.percpu_usage?.length ??
      1;
    const cpuPercent =
      systemDelta > 0 ? Number((((cpuDelta / systemDelta) * numCpus) * 100).toFixed(2)) : 0;
    const memoryUsage = stats.memory_stats.usage ?? 0;
    const memoryLimit = stats.memory_stats.limit ?? 1;
    const memoryPercent = Number(((memoryUsage / memoryLimit) * 100).toFixed(2));
    const networks = Object.values(stats.networks ?? {}) as DockerNetworkStats[];
    const networkRxBytes = networks.reduce((sum, network) => sum + (network.rx_bytes ?? 0), 0);
    const networkTxBytes = networks.reduce((sum, network) => sum + (network.tx_bytes ?? 0), 0);
    const blkioEntries = (stats.blkio_stats.io_service_bytes_recursive ?? []) as DockerBlkioEntry[];
    const blockReadBytes = blkioEntries
      .filter((entry: DockerBlkioEntry) => entry.op?.toLowerCase() === 'read')
      .reduce((sum: number, entry: DockerBlkioEntry) => sum + Number(entry.value ?? 0), 0);
    const blockWriteBytes = blkioEntries
      .filter((entry: DockerBlkioEntry) => entry.op?.toLowerCase() === 'write')
      .reduce((sum: number, entry: DockerBlkioEntry) => sum + Number(entry.value ?? 0), 0);

    return {
      containerId,
      containerName: inspect.Name.replace(/^\//, ''),
      cpuPercent,
      memoryMb: mb(memoryUsage),
      memoryLimitMb: mb(memoryLimit),
      memoryPercent,
      networkRxBytes,
      networkTxBytes,
      blockReadBytes,
      blockWriteBytes,
      restartCount: inspect.RestartCount,
      status: inspect.State.Status,
      collectedAt: new Date().toISOString(),
      mode: 'real'
    };
  }

  async getContainerLogs(containerId: string, tail: number): Promise<string[]> {
    const logs = await docker.getContainer(containerId).logs({
      stdout: true,
      stderr: true,
      timestamps: true,
      tail
    });
    return logs
      .toString('utf8')
      .split('\n')
      .map((line: string) => line.trim())
      .filter(Boolean);
  }

  streamContainerStats(containerId: string, callback: (stats: ContainerStats) => void) {
    const container = docker.getContainer(containerId);
    void container.stats({ stream: true }, (error: Error | null, stream: NodeJS.ReadableStream | undefined) => {
      if (error || !stream) {
        logger.warn('Failed to stream container stats', {
          containerId,
          error: error?.message
        });
        return;
      }

      stream.on('data', async () => {
        try {
          const snapshot = await this.getContainerStats(containerId);
          callback(snapshot);
        } catch (streamError) {
          logger.warn('Streaming stats snapshot failed', {
            containerId,
            error: (streamError as Error).message
          });
        }
      });
    });
  }
}

export const dockerService = new DockerService();
