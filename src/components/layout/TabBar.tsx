import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Baby, Heart, Calendar, MapPin, BarChart3, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';


const navItems = [
  { path: '/dashboard', label: 'Início', icon: Home },
  { path: '/pessoas', label: 'Pessoas', icon: Users },
  { path: '/familias', label: 'Famílias', icon: Heart },
  { path: '/criancas', label: 'Crianças', icon: Baby },
  { path: '/calendario', label: 'Agenda', icon: Calendar },
  { path: '/mapa', label: 'Mapa', icon: MapPin },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
];

export function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const visibleItems = navItems;

  // Show only first 5 items in tab bar, rest in more menu
  const tabItems = visibleItems.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl safe-area-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {tabItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-6 w-6 mb-0.5', isActive && 'scale-110')} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
