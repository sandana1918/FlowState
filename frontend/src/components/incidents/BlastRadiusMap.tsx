import { BlastRadiusChart } from '../charts/BlastRadiusChart';
import type { BlastRadius } from '../../types/incident.types';

export const BlastRadiusMap = ({ blastRadius }: { blastRadius: BlastRadius }) => (
  <BlastRadiusChart blastRadius={blastRadius} />
);

