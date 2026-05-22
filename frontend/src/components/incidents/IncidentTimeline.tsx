import { IncidentTimelineChart } from '../charts/IncidentTimelineChart';
import type { TimelineEvent } from '../../types/incident.types';

export const IncidentTimeline = ({ timeline }: { timeline: TimelineEvent[] }) => (
  <IncidentTimelineChart timeline={timeline} />
);

