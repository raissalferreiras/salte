import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Home, Users, MapPin, Phone } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Familia, Pessoa } from '@/types';
import { formatDateBR, formatPhone } from '@/lib/export';

interface FamiliaWithResponsavel extends Familia {
  responsavel?: Pessoa;
}

export default function FamiliasPage() {
  const navigate = useNavigate();
  const [familias, setFamilias] = useState<FamiliaWithResponsavel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFamilias = async () => {
      try {
        const { data, error } = await supabase
          .from('familias')
          .select(`
            *,
            responsavel:pessoas!familias_responsavel_id_fkey(*)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFamilias(data as FamiliaWithResponsavel[]);
      } catch (error) {
        console.error('Error fetching familias:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFamilias();
  }, []);

  const filteredFamilias = useMemo(() => {
    if (!search.trim()) return familias;
    const lower = search.toLowerCase();
    return familias.filter(
      (f) =>
        f.responsavel?.full_name?.toLowerCase().includes(lower) ||
        f.address?.toLowerCase().includes(lower) ||
        f.neighborhood?.toLowerCase().includes(lower)
    );
  }, [familias, search]);

  const getDaysWithoutVisit = (ultimaVisita: string | undefined) => {
    if (!ultimaVisita) return null;
    const diff = Math.floor(
      (new Date().getTime() - new Date(ultimaVisita).getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  return (
    <AppLayout>
      <PageHeader
        title="Famílias"
        subtitle={`${familias.length} cadastradas`}
        rightContent={
          <Button
            size="icon"
            onClick={() => navigate('/familias/novo')}
            className="h-9 w-9 rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      <div className="px-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por responsável, endereço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>

        {/* List */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          ) : filteredFamilias.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search ? 'Nenhuma família encontrada' : 'Nenhuma família cadastrada'}
              </p>
              <Button variant="link" onClick={() => navigate('/familias/novo')}>
                Cadastrar primeira família
              </Button>
            </div>
          ) : (
            filteredFamilias.map((familia) => {
              const daysWithout = getDaysWithoutVisit(familia.ultima_visita);

              return (
                <button
                  key={familia.id}
                  onClick={() => navigate(`/familias/${familia.id}`)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50 hover:shadow-sm transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium truncate">
                        {familia.responsavel?.full_name || 'Sem responsável'}
                      </p>
                      {daysWithout !== null && daysWithout > 30 && (
                        <Badge variant="destructive" className="text-[10px] flex-shrink-0">
                          {daysWithout}d sem visita
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {familia.address}{familia.address_number ? `, ${familia.address_number}` : ''}
                      </span>
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {familia.num_moradores} morador{familia.num_moradores !== 1 ? 'es' : ''}
                      </span>
                      {familia.ultima_visita && (
                        <span>Última visita: {formatDateBR(familia.ultima_visita)}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
