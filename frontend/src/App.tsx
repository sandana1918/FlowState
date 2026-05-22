import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingState } from './components/common/LoadingState';
import { useSocket } from './hooks/useSocket';

const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Incidents = lazy(() => import('./pages/Incidents').then((module) => ({ default: module.Incidents })));
const Services = lazy(() => import('./pages/Services').then((module) => ({ default: module.Services })));
const Deployments = lazy(() => import('./pages/Deployments').then((module) => ({ default: module.Deployments })));
const Logs = lazy(() => import('./pages/Logs').then((module) => ({ default: module.Logs })));
const Metrics = lazy(() => import('./pages/Metrics').then((module) => ({ default: module.Metrics })));
const Correlations = lazy(() => import('./pages/Correlations').then((module) => ({ default: module.Correlations })));
const Settings = lazy(() => import('./pages/Settings').then((module) => ({ default: module.Settings })));

export default function App() {
  useSocket();

  return (
    <AppLayout>
      <Suspense fallback={<LoadingState />}>
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
      </Suspense>
    </AppLayout>
  );
}
