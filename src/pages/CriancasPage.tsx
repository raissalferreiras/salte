import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Baby, Phone, AlertTriangle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Crianca, Pessoa } from '@/types';
import { calculateAge, formatPhone } from '@/lib/export';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CriancaWithPessoa extends Crianca {
  pessoa?: Pessoa;
}

export default function CriancasPage() {
  const navigate = useNavigate();
  const [criancas, setCriancas] = useState<CriancaWithPessoa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCriancas = async () => {
      try {
        const { data, error } = await supabase
          .from('criancas')
          .select(`
            *,
            pessoa:pessoas!criancas_pessoa_id_fkey(*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCriancas(data as CriancaWithPessoa[]);
      } catch (error) {
        console.error('Error fetching criancas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCriancas();
  }, []);

  const filteredCriancas = useMemo(() => {
    if (!search.trim()) return criancas;
    const lower = search.toLowerCase();
    return criancas.filter(
      (c) =>
        c.pessoa?.full_name?.toLowerCase().includes(lower) ||
        c.escola?.toLowerCase().includes(lower)
    );
  }, [criancas, search]);

  return (
    <AppLayout>
      <PageHeader
        title="Crianças"
        subtitle={`${criancas.length} cadastradas - Sementinhas`}
        rightContent={
          <Button
            size="icon"
            onClick={() => navigate('/criancas/novo')}
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
            placeholder="Buscar por nome, escola..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>

        {/* List */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          ) : filteredCriancas.length === 0 ? (
            <div className="text-center py-12">
              <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search ? 'Nenhuma criança encontrada' : 'Nenhuma criança cadastrada'}
              </p>
              <Button variant="link" onClick={() => navigate('/criancas/novo')}>
                Cadastrar primeira criança
              </Button>
            </div>
          ) : (
            filteredCriancas.map((crianca) => {
              const age = calculateAge(crianca.pessoa?.birth_date);

              return (
                <button
                  key={crianca.id}
                  onClick={() => navigate(`/criancas/${crianca.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:shadow-sm transition-all text-left"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={crianca.pessoa?.photo_url || undefined} />
                    <AvatarFallback className="bg-chart-1/10 text-chart-1 font-medium">
                      {crianca.pessoa?.full_name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{crianca.pessoa?.full_name}</p>
                      {crianca.necessidades_especiais && (
                        <AlertTriangle className="h-4 w-4 text-chart-4 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {age !== null && <span>{age} anos</span>}
                      {crianca.escola && (
                        <span className="truncate">{crianca.escola}</span>
                      )}
                      {crianca.serie && (
                        <Badge variant="secondary" className="text-[10px]">
                          {crianca.serie}
                        </Badge>
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
