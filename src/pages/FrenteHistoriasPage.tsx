import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Plus, Search, MapPin, Package, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Familia, Pessoa } from '@/types';
import { formatDateBR } from '@/lib/export';
import { format, differenceInDays } from 'date-fns';

interface FamiliaWithResponsavel extends Familia {
  responsavel?: Pessoa;
}

export default function FrenteHistoriasPage() {
  const navigate = useNavigate();
  const [familias, setFamilias] = useState<FamiliaWithResponsavel[]>([]);
  const [visitasMes, setVisitasMes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [familiasRes, visitasRes] = await Promise.all([
          supabase
            .from('familias')
            .select(`*, responsavel:pessoas!familias_responsavel_id_fkey(*)`)
            .eq('is_active', true)
            .order('ultima_visita', { ascending: true, nullsFirst: true }),
          supabase
            .from('visitas')
            .select('id', { count: 'exact', head: true })
            .gte('data', format(new Date(), 'yyyy-MM-01'))
        ]);

        if (familiasRes.data) setFamilias(familiasRes.data as FamiliaWithResponsavel[]);
        if (visitasRes.count) setVisitasMes(visitasRes.count);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredFamilias = familias.filter((f) =>
    !search.trim() || 
    f.responsavel?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.address?.toLowerCase().includes(search.toLowerCase())
  );

  const familiasNecessitamVisita = familias.filter((f) => {
    if (!f.ultima_visita) return true;
    return differenceInDays(new Date(), new Date(f.ultima_visita)) > 30;
  });

  return (
    <AppLayout>
      <PageHeader 
        title="Conhecendo Histórias" 
        subtitle="Visitas domiciliares"
        showBack
        rightContent={
          <Button size="icon" onClick={() => navigate('/familias/novo')} className="h-9 w-9 rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      <div className="px-4 pb-6">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/visitas/novo')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 hover:shadow-md transition-all"
          >
            <MapPin className="h-6 w-6 text-primary" />
            <div className="text-left">
              <p className="font-medium text-primary">Nova Visita</p>
              <p className="text-xs text-muted-foreground">Registrar visita</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/mapa')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-chart-3/10 border border-chart-3/20 hover:shadow-md transition-all"
          >
            <Home className="h-6 w-6 text-chart-3" />
            <div className="text-left">
              <p className="font-medium text-chart-3">Ver Mapa</p>
              <p className="text-xs text-muted-foreground">Territorial</p>
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Visitas este mês</p>
            <p className="text-3xl font-bold">{visitasMes}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Precisam visita</p>
            <p className="text-3xl font-bold text-destructive">{familiasNecessitamVisita.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar família..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>

        {/* Priority families */}
        {familiasNecessitamVisita.length > 0 && !search && (
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">⚠️ Prioridade (sem visita há +30 dias)</p>
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : filteredFamilias.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma família cadastrada</p>
              <Button variant="link" onClick={() => navigate('/familias/novo')}>Cadastrar</Button>
            </div>
          ) : (
            filteredFamilias.map((familia) => {
              const dias = familia.ultima_visita 
                ? differenceInDays(new Date(), new Date(familia.ultima_visita))
                : null;
              const urgente = dias === null || dias > 30;

              return (
                <button
                  key={familia.id}
                  onClick={() => navigate(`/familias/${familia.id}`)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50 hover:shadow-sm transition-all text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${urgente ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                    <Home className={`h-5 w-5 ${urgente ? 'text-destructive' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium truncate">{familia.responsavel?.full_name || 'Sem responsável'}</p>
                      {urgente && (
                        <Badge variant="destructive" className="text-[10px] flex-shrink-0">
                          {dias === null ? 'Nunca visitada' : `${dias}d`}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{familia.address}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {familia.num_moradores} morador{familia.num_moradores !== 1 ? 'es' : ''}
                      {familia.ultima_visita && ` • Última: ${formatDateBR(familia.ultima_visita)}`}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
