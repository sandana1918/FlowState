import fs from 'node:fs/promises';
import { env } from '../config/env.js';
import type { BlastRadius } from '../types/incident.types.js';

export type ServiceDependencyGraph = Record<string, string[]>;

export const loadServiceGraph = async (): Promise<ServiceDependencyGraph> => {
  const content = await fs.readFile(env.SERVICE_GRAPH_ABSOLUTE_PATH, 'utf8');
  return JSON.parse(content) as ServiceDependencyGraph;
};

export const calculateBlastRadius = async (affectedService: string): Promise<BlastRadius> => {
  const graph = await loadServiceGraph();
  const directDependents = Object.entries(graph)
    .filter(([, dependencies]) => dependencies.includes(affectedService))
    .map(([service]) => service);

  const indirectDependents = new Set<string>();
  for (const direct of directDependents) {
    for (const [service, dependencies] of Object.entries(graph)) {
      if (dependencies.includes(direct) && service !== affectedService) {
        indirectDependents.add(service);
      }
    }
  }

  return {
    affectedService,
    directDependents,
    indirectDependents: [...indirectDependents],
    totalAffectedCount: 1 + directDependents.length + indirectDependents.size
  };
};

