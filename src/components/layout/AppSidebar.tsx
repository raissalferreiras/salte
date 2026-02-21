import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Baby, Heart, Calendar, MapPin, BarChart3, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';

const navItems = [
{ path: '/dashboard', label: 'Início', icon: Home },
{ path: '/pessoas', label: 'Pessoas', icon: Users },
{ path: '/familias', label: 'Famílias', icon: Heart },
{ path: '/criancas', label: 'Crianças', icon: Baby },
{ path: '/calendario', label: 'Agenda', icon: Calendar },
{ path: '/mapa', label: 'Mapa', icon: MapPin },
{ path: '/relatorios', label: 'Relatórios', icon: BarChart3 }];


export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPsicologa, profile, signOut } = useAuth();

  const visibleItems = navItems;

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card/50 h-screen sticky top-0">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 h-14 border-b border-border/50">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">S</span>
        </div>
        <span className="font-semibold text-lg">Projeto Salte</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive ?
                'bg-primary/10 text-primary' :
                'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}>

              <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>);

        })}
      </nav>

      <Separator />

      {/* Bottom actions */}
      <div className="p-3 space-y-1">
        <button
          onClick={() => navigate('/configuracoes')}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            location.pathname === '/configuracoes' ?
            'bg-primary/10 text-primary' :
            'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}>

          <Settings className="h-5 w-5 flex-shrink-0" />
          <span>Configurações</span>
        </button>
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200">

          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Sair</span>
        </button>
      </div>

      {/* User info */}
      {profile &&
      <div className="px-5 py-3 border-t border-border/50">
          <p className="text-sm font-medium truncate">{profile.full_name}</p>
          <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
        </div>
      }
    </aside>);

}