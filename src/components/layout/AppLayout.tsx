import { ReactNode } from 'react';
import { TabBar } from './TabBar';
import { AppSidebar } from './AppSidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  hideTabBar?: boolean;
}

export function AppLayout({ children, hideTabBar = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <main className={cn('flex-1', !hideTabBar && 'pb-24 md:pb-0')}>
          {children}
        </main>
        {!hideTabBar && <TabBar />}
      </div>
    </div>
  );
}
