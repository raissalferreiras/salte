import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, Plus, Search, ClipboardList, ChevronRight, Calendar } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Crianca, Pessoa, Presenca } from '@/types';
import { calculateAge, formatDateBR } from '@/lib/export';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CriancaWithPessoa extends Crianca {
  pessoa?: Pessoa;
}

export default function FrenteSementinhasPage() {
  const navigate = useNavigate();
  const [criancas, setCriancas] = useState<CriancaWithPessoa[]>([]);
  const [presencasHoje, setPresencasHoje] = useState<Presenca[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [criancasRes, presencasRes] = await Promise.all([
          supabase
            .from('criancas')
            .select(`*, pessoa:pessoas!criancas_pessoa_id_fkey(*)`)
            .order('created_at', { ascending: false }),
          supabase
            .from('presencas')
            .select('*')
            .eq('data', format(new Date(), 'yyyy-MM-dd'))
        ]);

        if (criancasRes.data) setCriancas(criancasRes.data as CriancaWithPessoa[]);
        if (presencasRes.data) setPresencasHoje(presencasRes.data as Presenca[]);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCriancas = criancas.filter((c) =>
    !search.trim() || c.pessoa?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <PageHeader 
        title="Sementinhas" 
        subtitle="Trabalho com crianças"
        showBack
        rightContent={
          <Button size="icon" onClick={() => navigate('/criancas/novo')} className="h-9 w-9 rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      <div className="px-4 pb-6">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/presencas/novo')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-chart-1/10 border border-chart-1/20 hover:shadow-md transition-all"
          >
            <ClipboardList className="h-6 w-6 text-chart-1" />
            <div className="text-left">
              <p className="font-medium text-chart-1">Registrar Presença</p>
              <p className="text-xs text-muted-foreground">Ação de hoje</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/presencas/dashboard')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-chart-2/10 border border-chart-2/20 hover:shadow-md transition-all"
          >
            <Calendar className="h-6 w-6 text-chart-2" />
            <div className="text-left">
              <p className="font-medium text-chart-2">Dashboard</p>
              <p className="text-xs text-muted-foreground">Ver estatísticas</p>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/criancas')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 hover:shadow-md transition-all"
          >
            <Baby className="h-6 w-6 text-primary" />
            <div className="text-left">
              <p className="font-medium text-primary">Ver Todas</p>
              <p className="text-xs text-muted-foreground">{criancas.length} crianças</p>
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="bg-card rounded-2xl p-4 border border-border/50 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Presenças Hoje</p>
              <p className="text-3xl font-bold">{presencasHoje.filter(p => p.presente).length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
              <p className="text-sm font-medium">Total: {criancas.length} crianças</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar criança..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>

        {/* List */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          ) : filteredCriancas.length === 0 ? (
            <div className="text-center py-12">
              <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma criança cadastrada</p>
              <Button variant="link" onClick={() => navigate('/criancas/novo')}>Cadastrar</Button>
            </div>
          ) : (
            filteredCriancas.map((crianca) => (
              <button
                key={crianca.id}
                onClick={() => navigate(`/criancas/${crianca.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:shadow-sm transition-all text-left"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={crianca.pessoa?.photo_url || undefined} />
                  <AvatarFallback className="bg-chart-1/10 text-chart-1">
                    {crianca.pessoa?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{crianca.pessoa?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {calculateAge(crianca.pessoa?.birth_date)} anos
                    {crianca.escola && ` • ${crianca.escola}`}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
