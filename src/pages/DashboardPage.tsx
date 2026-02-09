import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, Heart, Brain, Users, Home, Calendar, MapPin, Plus, UserPlus, ClipboardList } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DashboardData {
  totalCriancas: number;
  totalFamilias: number;
  totalPessoas: number;
  visitasMes: number;
  proximosEventos: Array<{
    id: string;
    titulo: string;
    data_inicio: string;
    tipo: string;
  }>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, roles, isAdminOrCoordinator, isPsicologa } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch counts
        const [criancasRes, familiasRes, pessoasRes, visitasRes, eventosRes] = await Promise.all([
          supabase.from('criancas').select('id', { count: 'exact', head: true }),
          supabase.from('familias').select('id', { count: 'exact', head: true }),
          supabase.from('pessoas').select('id', { count: 'exact', head: true }),
          supabase.from('visitas').select('id', { count: 'exact', head: true })
            .gte('data', format(new Date(), 'yyyy-MM-01')),
          supabase.from('eventos')
            .select('id, titulo, data_inicio, tipo')
            .gte('data_inicio', new Date().toISOString())
            .order('data_inicio')
            .limit(5),
        ]);

        setData({
          totalCriancas: criancasRes.count || 0,
          totalFamilias: familiasRes.count || 0,
          totalPessoas: pessoasRes.count || 0,
          visitasMes: visitasRes.count || 0,
          proximosEventos: eventosRes.data || [],
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getRoleLabel = () => {
    if (roles.includes('admin')) return 'Administrador';
    if (roles.includes('coordenador')) return 'Coordenador';
    if (roles.includes('psicologa')) return 'Psicóloga';
    return 'Voluntário';
  };

  return (
    <AppLayout>
      <PageHeader title="" large />

      <div className="px-4 pb-6 max-w-4xl mx-auto md:px-6 md:py-6">
        {/* Welcome section */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-muted-foreground text-sm">{greeting()},</p>
              <h1 className="text-xl font-bold">{profile?.full_name?.split(' ')[0] || 'Usuário'}</h1>
              <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
            </div>
          </div>
        </div>

        {/* Frentes section */}
        <SectionHeader title="Frentes de Atuação" className="mt-6" />
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/frentes/sementinhas')}
            className="flex flex-col items-center p-4 rounded-2xl bg-card border border-border/50 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-chart-1/20 flex items-center justify-center mb-2">
              <Baby className="h-6 w-6 text-chart-1" />
            </div>
            <span className="text-sm font-medium text-center">Sementinhas</span>
          </button>
          <button
            onClick={() => navigate('/frentes/historias')}
            className="flex flex-col items-center p-4 rounded-2xl bg-card border border-border/50 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-center">Histórias</span>
          </button>
          <button
            onClick={() => navigate('/frentes/psicologico')}
            className="flex flex-col items-center p-4 rounded-2xl bg-card border border-border/50 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-chart-3/20 flex items-center justify-center mb-2">
              <Brain className="h-6 w-6 text-chart-3" />
            </div>
            <span className="text-sm font-medium text-center">Psicológico</span>
          </button>
        </div>

        {/* Stats */}
        <SectionHeader title="Visão Geral" className="mt-6" />
        <div className="grid grid-cols-2 gap-3">
          {isLoading ? (
            <>
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </>
          ) : (
            <>
              <StatCard
                title="Crianças"
                value={data?.totalCriancas || 0}
                icon={Baby}
                color="success"
                onClick={() => navigate('/criancas')}
              />
              <StatCard
                title="Famílias"
                value={data?.totalFamilias || 0}
                icon={Home}
                color="primary"
                onClick={() => navigate('/familias')}
              />
              <StatCard
                title="Pessoas"
                value={data?.totalPessoas || 0}
                icon={Users}
                color="warning"
                onClick={() => navigate('/pessoas')}
              />
              <StatCard
                title="Visitas (mês)"
                value={data?.visitasMes || 0}
                icon={MapPin}
                color="danger"
                onClick={() => navigate('/visitas')}
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <SectionHeader title="Ações Rápidas" className="mt-6" />
        <div className="space-y-3">
          <QuickAction
            title="Nova Pessoa"
            description="Cadastrar pessoa no sistema"
            icon={UserPlus}
            path="/pessoas/novo"
            color="#10B981"
          />
          <QuickAction
            title="Registrar Presença"
            description="Sementinhas - presença em ação"
            icon={ClipboardList}
            path="/presencas/novo"
            color="#3B82F6"
          />
          <QuickAction
            title="Nova Visita"
            description="Conhecendo Histórias - visitar família"
            icon={Home}
            path="/visitas/novo"
            color="#8B5CF6"
          />
          {isPsicologa && (
            <QuickAction
              title="Novo Atendimento"
              description="Registrar atendimento psicológico"
              icon={Brain}
              path="/atendimentos/novo"
              color="#EC4899"
            />
          )}
        </div>

        {/* Próximos eventos */}
        <SectionHeader
          title="Próximos Eventos"
          action={{ label: 'Ver todos', path: '/calendario' }}
          className="mt-6"
        />
        <div className="space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </>
          ) : data?.proximosEventos.length === 0 ? (
            <div className="bg-card rounded-xl p-4 text-center text-muted-foreground border border-border/50">
              <p className="text-sm">Nenhum evento agendado</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate('/calendario')}
                className="mt-1"
              >
                Criar evento
              </Button>
            </div>
          ) : (
            data?.proximosEventos.map((evento) => (
              <button
                key={evento.id}
                onClick={() => navigate(`/eventos/${evento.id}`)}
                className="w-full flex items-center gap-4 p-3 rounded-xl bg-card border border-border/50 hover:shadow-sm transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {format(new Date(evento.data_inicio), 'MMM', { locale: ptBR }).toUpperCase()}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {format(new Date(evento.data_inicio), 'd')}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{evento.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(evento.data_inicio), "HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
