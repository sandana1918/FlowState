import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Incidents } from './pages/Incidents';
import { Services } from './pages/Services';
import { Deployments } from './pages/Deployments';
import { Logs } from './pages/Logs';
import { Metrics } from './pages/Metrics';
import { Correlations } from './pages/Correlations';
import { Settings } from './pages/Settings';
import { useSocket } from './hooks/useSocket';

export default function App() {
  useSocket();

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/services" element={<Services />} />
        <Route path="/deployments" element={<Deployments />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/correlations" element={<Correlations />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

