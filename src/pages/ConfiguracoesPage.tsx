import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Moon, Sun, Shield, Bell, Wifi, WifiOff, ChevronRight, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useOffline } from '@/contexts/OfflineContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ConfiguracoesPage() {
  const navigate = useNavigate();
  const { profile, roles, signOut, isAdminOrCoordinator } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isOnline, pendingSync, syncNow } = useOffline();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncNow();
    setIsSyncing(false);
    toast.success('Sincronização concluída');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'coordenador': return 'Coordenador';
      case 'psicologa': return 'Psicóloga';
      case 'voluntario': return 'Voluntário';
      default: return role;
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Configurações" showBack />

      <div className="px-4 pb-6 space-y-6">
        {/* Profile section */}
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{profile?.full_name}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <div className="flex gap-1 mt-1">
                {roles.map((role) => (
                  <Badge key={role} variant="secondary" className="text-[10px]">
                    {getRoleLabel(role)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <p className="text-sm font-medium text-muted-foreground px-4 py-3 border-b border-border/50">
            Preferências
          </p>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span>Tema escuro</span>
            </div>
            <Switch checked={theme === 'dark'} />
          </button>

          <div className="w-full flex items-center justify-between px-4 py-3 border-t border-border/50">
            <div className="flex items-center gap-3">
              {isOnline ? <Wifi className="h-5 w-5 text-chart-1" /> : <WifiOff className="h-5 w-5 text-destructive" />}
              <div>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
                {pendingSync > 0 && (
                  <p className="text-xs text-muted-foreground">{pendingSync} pendente(s)</p>
                )}
              </div>
            </div>
            {pendingSync > 0 && (
              <Button size="sm" variant="outline" onClick={handleSync} disabled={isSyncing || !isOnline}>
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Admin section */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <p className="text-sm font-medium text-muted-foreground px-4 py-3 border-b border-border/50">
              Administração
            </p>

            <button
              onClick={() => navigate('/admin/usuarios')}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="h-5 w-5" />
                <span>Gerenciar Usuários</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => navigate('/admin/frentes')}
              className="w-full flex items-center justify-between px-4 py-3 border-t border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5" />
                <span>Gerenciar Frentes</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => navigate('/admin/fornecedores')}
              className="w-full flex items-center justify-between px-4 py-3 border-t border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5" />
                <span>Fornecedores</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
          </div>

        {/* Sign out */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full h-12 rounded-xl">
              <LogOut className="h-5 w-5 mr-2" />
              Sair da conta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
              <AlertDialogDescription>
                Você será desconectado do sistema. Dados pendentes de sincronização serão mantidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSignOut}>Sair</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground">
          Sistema Ventosa v1.0.0
        </p>
      </div>
    </AppLayout>
  );
}
