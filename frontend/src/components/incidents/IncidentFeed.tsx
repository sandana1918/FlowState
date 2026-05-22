import { motion } from 'framer-motion';
import { IncidentCard } from '../cards/IncidentCard';
import { EmptyState } from '../common/EmptyState';
import type { Incident } from '../../types/incident.types';

export const IncidentFeed = ({
  incidents,
  onSelect
}: {
  incidents: Incident[];
  onSelect?: (incident: Incident) => void;
}) =>
  incidents.length === 0 ? (
    <EmptyState title="All systems operational" description="No active incidents are currently open." />
  ) : (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <motion.div
          key={incident.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <IncidentCard incident={incident} onClick={() => onSelect?.(incident)} />
        </motion.div>
      ))}
    </div>
  );

