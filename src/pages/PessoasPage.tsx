import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Users, Phone, MapPin } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Pessoa } from '@/types';
import { calculateAge, formatPhone } from '@/lib/export';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function PessoasPage() {
  const navigate = useNavigate();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPessoas = async () => {
      try {
        const { data, error } = await supabase
          .from('pessoas')
          .select('*')
          .eq('is_active', true)
          .order('full_name');

        if (error) throw error;
        setPessoas(data as Pessoa[]);
      } catch (error) {
        console.error('Error fetching pessoas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPessoas();
  }, []);

  const filteredPessoas = useMemo(() => {
    if (!search.trim()) return pessoas;
    const lower = search.toLowerCase();
    return pessoas.filter(
      (p) =>
        p.full_name.toLowerCase().includes(lower) ||
        p.phone?.includes(search) ||
        p.neighborhood?.toLowerCase().includes(lower)
    );
  }, [pessoas, search]);

  return (
    <AppLayout>
      <PageHeader
        title="Pessoas"
        subtitle={`${pessoas.length} cadastradas`}
        rightContent={
          <Button
            size="icon"
            onClick={() => navigate('/pessoas/novo')}
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
            placeholder="Buscar por nome, telefone..."
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
          ) : filteredPessoas.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search ? 'Nenhuma pessoa encontrada' : 'Nenhuma pessoa cadastrada'}
              </p>
              <Button variant="link" onClick={() => navigate('/pessoas/novo')}>
                Cadastrar primeira pessoa
              </Button>
            </div>
          ) : (
            filteredPessoas.map((pessoa) => (
              <button
                key={pessoa.id}
                onClick={() => navigate(`/pessoas/${pessoa.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:shadow-sm transition-all text-left"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={pessoa.photo_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {pessoa.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{pessoa.full_name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {pessoa.birth_date && (
                      <span>{calculateAge(pessoa.birth_date)} anos</span>
                    )}
                    {pessoa.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {formatPhone(pessoa.phone)}
                      </span>
                    )}
                  </div>
                  {pessoa.neighborhood && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {pessoa.neighborhood}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
