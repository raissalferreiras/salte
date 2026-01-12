import { ReactNode } from 'react';
import { TabBar } from './TabBar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  hideTabBar?: boolean;
}

export function AppLayout({ children, hideTabBar = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className={cn('pb-24', !hideTabBar && 'pb-24')}>
        {children}
      </main>
      {!hideTabBar && <TabBar />}
    </div>
  );
}
