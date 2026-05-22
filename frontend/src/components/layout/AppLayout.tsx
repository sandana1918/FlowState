import type { PropsWithChildren } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useSocketStore } from '../../store/socketStore';
import { FallbackBanner } from '../common/FallbackBanner';

export const AppLayout = ({ children }: PropsWithChildren) => {
  const connected = useSocketStore((state) => state.connected);
  const warning = useSocketStore((state) => state.warning);

  return (
    <div className="min-h-screen bg-bg text-text">
      <Sidebar />
      <Topbar connected={connected} />
      <main className="ml-64 min-h-screen pt-16">
        <div className="mx-auto max-w-[1440px] space-y-6 px-10 py-8">
          <FallbackBanner warning={warning} />
          {children}
        </div>
      </main>
    </div>
  );
};
