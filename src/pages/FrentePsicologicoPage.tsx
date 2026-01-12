import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Plus, Search, Calendar, Users, ChevronRight, Lock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AtendimentoPsicologico, Pessoa } from '@/types';
import { formatDateBR } from '@/lib/export';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AtendimentoWithPessoa extends AtendimentoPsicologico {
  pessoa?: Pessoa;
}

export default function FrentePsicologicoPage() {
  const navigate = useNavigate();
  const { user, isPsicologa, hasRole } = useAuth();
  const [atendimentos, setAtendimentos] = useState<AtendimentoWithPessoa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Check access
  const hasAccess = isPsicologa || hasRole('admin');

  useEffect(() => {
    if (!hasAccess) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('atendimentos_psicologicos')
          .select(`*, pessoa:pessoas!atendimentos_psicologicos_pessoa_id_fkey(*)`)
          .order('data', { ascending: false })
          .limit(50);

        if (error) throw error;
        setAtendimentos(data as AtendimentoWithPessoa[]);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [hasAccess]);

  const filteredAtendimentos = atendimentos.filter((a) =>
    !search.trim() || a.pessoa?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const atendimentosHoje = atendimentos.filter(
    (a) => a.data === format(new Date(), 'yyyy-MM-dd')
  );

  const atendimentosAgendados = atendimentos.filter((a) => a.status === 'agendado');

  if (!hasAccess) {
    return (
      <AppLayout>
        <PageHeader title="Atendimento Psicológico" showBack />
        <div className="px-4 py-12 text-center">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Esta área é exclusiva para profissionais de psicologia.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title="Atendimento Psicológico" 
        subtitle="Suporte individual e em grupo"
        showBack
        rightContent={
          <Button size="icon" onClick={() => navigate('/atendimentos/novo')} className="h-9 w-9 rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      <div className="px-4 pb-6">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/atendimentos/novo')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-chart-3/10 border border-chart-3/20 hover:shadow-md transition-all"
          >
            <Brain className="h-6 w-6 text-chart-3" />
            <div className="text-left">
              <p className="font-medium text-chart-3">Novo Atendimento</p>
              <p className="text-xs text-muted-foreground">Registrar sessão</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/calendario')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 hover:shadow-md transition-all"
          >
            <Calendar className="h-6 w-6 text-primary" />
            <div className="text-left">
              <p className="font-medium text-primary">Agenda</p>
              <p className="text-xs text-muted-foreground">{atendimentosAgendados.length} agendados</p>
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Hoje</p>
            <p className="text-3xl font-bold">{atendimentosHoje.length}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Agendados</p>
            <p className="text-3xl font-bold text-chart-3">{atendimentosAgendados.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>

        {/* List */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : filteredAtendimentos.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum atendimento registrado</p>
              <Button variant="link" onClick={() => navigate('/atendimentos/novo')}>Novo atendimento</Button>
            </div>
          ) : (
            filteredAtendimentos.map((atendimento) => (
              <button
                key={atendimento.id}
                onClick={() => navigate(`/atendimentos/${atendimento.id}`)}
                className="w-full flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50 hover:shadow-sm transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                  {atendimento.tipo === 'grupo' ? (
                    <Users className="h-5 w-5 text-chart-3" />
                  ) : (
                    <Brain className="h-5 w-5 text-chart-3" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium truncate">{atendimento.pessoa?.full_name}</p>
                    <Badge 
                      variant={atendimento.status === 'realizado' ? 'default' : 'secondary'}
                      className="text-[10px] flex-shrink-0"
                    >
                      {atendimento.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDateBR(atendimento.data)}
                    {atendimento.horario_inicio && ` às ${atendimento.horario_inicio.slice(0, 5)}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {atendimento.tipo === 'grupo' ? 'Atendimento em grupo' : 'Individual'}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
              </button>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
