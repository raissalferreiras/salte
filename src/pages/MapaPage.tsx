import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, Baby, Brain, Users, Layers, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Familia, Pessoa } from '@/types';
import { formatDateBR } from '@/lib/export';

interface FamiliaWithData extends Familia {
  responsavel?: Pessoa;
  frentes_count?: number;
}

export default function MapaPage() {
  const navigate = useNavigate();
  const [familias, setFamilias] = useState<FamiliaWithData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFamilia, setSelectedFamilia] = useState<FamiliaWithData | null>(null);

  useEffect(() => {
    const fetchFamilias = async () => {
      try {
        const { data, error } = await supabase
          .from('familias')
          .select(`
            *,
            responsavel:pessoas!familias_responsavel_id_fkey(*),
            familia_frentes(frente_id)
          `)
          .eq('is_active', true);

        if (error) throw error;

        const familiasWithCount = (data || []).map((f: any) => ({
          ...f,
          frentes_count: f.familia_frentes?.length || 0,
        }));

        setFamilias(familiasWithCount);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFamilias();
  }, []);

  const getFrenteColor = (count: number) => {
    if (count >= 3) return 'bg-chart-1 text-chart-1';
    if (count === 2) return 'bg-primary text-primary';
    if (count === 1) return 'bg-chart-4 text-chart-4';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Mapa Territorial" 
        subtitle="Favela Ventosa"
        showBack
      />

      <div className="px-4 pb-6">
        {/* Legend */}
        <div className="bg-card rounded-2xl p-4 border border-border/50 mb-4">
          <p className="text-sm font-medium mb-3">Legenda - Frentes Atendidas</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-chart-1" />
              3+ frentes
            </Badge>
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              2 frentes
            </Badge>
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-chart-4" />
              1 frente
            </Badge>
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-muted" />
              Nenhuma
            </Badge>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden mb-4">
          <div className="aspect-video bg-muted/50 flex items-center justify-center relative">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Mapa interativo</p>
              <p className="text-xs text-muted-foreground">Configure as coordenadas das famílias</p>
            </div>
            
            {/* Mock map points */}
            {familias.slice(0, 10).map((familia, i) => (
              <button
                key={familia.id}
                onClick={() => setSelectedFamilia(familia)}
                className={`absolute w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-125 ${getFrenteColor(familia.frentes_count || 0).split(' ')[0]}`}
                style={{
                  left: `${15 + (i % 5) * 18}%`,
                  top: `${20 + Math.floor(i / 5) * 40}%`,
                }}
              >
                <Home className="h-3 w-3 text-card" />
              </button>
            ))}
          </div>
        </div>

        {/* Selected family */}
        {selectedFamilia && (
          <div className="bg-card rounded-2xl p-4 border border-primary/50 mb-4 animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold">{selectedFamilia.responsavel?.full_name || 'Sem responsável'}</p>
                <p className="text-sm text-muted-foreground">{selectedFamilia.address}</p>
              </div>
              <Badge className={getFrenteColor(selectedFamilia.frentes_count || 0).split(' ')[1].replace('text-', 'bg-')}>
                {selectedFamilia.frentes_count || 0} frente(s)
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <span><Users className="h-4 w-4 inline mr-1" />{selectedFamilia.num_moradores} moradores</span>
              <span>Última visita: {selectedFamilia.ultima_visita ? formatDateBR(selectedFamilia.ultima_visita) : 'Nunca'}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => navigate(`/familias/${selectedFamilia.id}`)}>
                Ver detalhes
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate(`/visitas/novo?familia=${selectedFamilia.id}`)}>
                Nova visita
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Total famílias</p>
            <p className="text-2xl font-bold">{familias.length}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Com coordenadas</p>
            <p className="text-2xl font-bold">{familias.filter(f => f.latitude && f.longitude).length}</p>
          </div>
        </div>

        {/* Families list */}
        <p className="text-sm font-medium text-muted-foreground mb-2">Todas as famílias</p>
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          ) : (
            familias.map((familia) => (
              <button
                key={familia.id}
                onClick={() => {
                  setSelectedFamilia(familia);
                  navigate(`/familias/${familia.id}`);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:shadow-sm transition-all text-left"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getFrenteColor(familia.frentes_count || 0).split(' ')[0]}`}>
                  <Home className="h-4 w-4 text-card" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{familia.responsavel?.full_name || 'Sem responsável'}</p>
                  <p className="text-xs text-muted-foreground truncate">{familia.address}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {familia.frentes_count || 0} frente(s)
                </Badge>
              </button>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
