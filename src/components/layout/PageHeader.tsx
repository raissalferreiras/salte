import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Bell, Settings, Wifi, WifiOff, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOffline } from '@/contexts/OfflineContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightContent?: ReactNode;
  large?: boolean;
}

export function PageHeader({ title, subtitle, showBack = false, rightContent, large = false }: PageHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline, pendingSync } = useOffline();
  const { theme, toggleTheme } = useTheme();

  const isHome = location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className={cn('font-semibold', large ? 'text-2xl' : 'text-lg')}>{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Offline indicator */}
          {!isOnline && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <WifiOff className="h-3 w-3" />
              {pendingSync > 0 && <span>{pendingSync}</span>}
            </Badge>
          )}

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-full">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {rightContent}

          {isHome && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative">
                  <Bell className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="p-3 text-sm text-muted-foreground text-center">
                  Nenhuma notificação
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isHome && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/configuracoes')}
              className="h-9 w-9 rounded-full"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
