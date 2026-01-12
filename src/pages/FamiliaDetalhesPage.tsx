import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Users, Phone, Calendar, FileText, Trash2, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tables } from '@/integrations/supabase/types';

type Familia = Tables<'familias'>;
type Pessoa = Tables<'pessoas'>;
type Visita = Tables<'visitas'>;

interface FamiliaWithResponsavel extends Familia {
  responsavel?: Pessoa;
}

export default function FamiliaDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [familia, setFamilia] = useState<FamiliaWithResponsavel | null>(null);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      const [familiaRes, visitasRes] = await Promise.all([
        supabase
          .from('familias')
          .select('*, responsavel:pessoas!familias_responsavel_id_fkey(*)')
          .eq('id', id)
          .single(),
        supabase
          .from('visitas')
          .select('*')
          .eq('familia_id', id)
          .order('data', { ascending: false })
          .limit(10),
      ]);

      if (familiaRes.error) {
        toast.error('Família não encontrada');
        navigate('/familias');
        return;
      }

      setFamilia(familiaRes.data);
      setVisitas(visitasRes.data || []);
      setIsLoading(false);
    }

    fetchData();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!familia || !confirm('Tem certeza que deseja excluir esta família?')) return;

    const { error } = await supabase
      .from('familias')
      .delete()
      .eq('id', familia.id);

    if (error) {
      toast.error('Erro ao excluir família');
      return;
    }

    toast.success('Família excluída');
    navigate('/familias');
  };

  const formatAddress = () => {
    if (!familia) return '';
    const parts = [
      familia.address,
      familia.address_number,
      familia.address_complement,
      familia.neighborhood,
      familia.city,
      familia.state,
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader title="Família" showBack />
        <div className="px-4 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!familia) {
    return null;
  }

  return (
    <AppLayout>
      <PageHeader 
        title="Detalhes da Família" 
        showBack
        rightContent={
          <div className="flex gap-2">
            <Button size="icon" variant="outline" onClick={handleDelete} className="h-9 w-9">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="px-4 pb-24 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {familia.responsavel?.full_name || 'Família'}
              </CardTitle>
              <Badge variant={familia.is_active ? 'default' : 'secondary'}>
                {familia.is_active ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{formatAddress()}</span>
            </div>
            
            {familia.num_moradores && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{familia.num_moradores} moradores</span>
              </div>
            )}

            {familia.responsavel?.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{familia.responsavel.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {familia.necessidades && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Necessidades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {familia.necessidades}
              </p>
            </CardContent>
          </Card>
        )}

        {familia.observacoes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {familia.observacoes}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Visitas
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/visitas/novo?familia=${familia.id}`)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nova
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {visitas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma visita registrada
              </p>
            ) : (
              <div className="space-y-2">
                {visitas.map((visita) => (
                  <div
                    key={visita.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(visita.data), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                      {visita.situacao_encontrada && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {visita.situacao_encontrada}
                        </p>
                      )}
                    </div>
                    {visita.entregou_cesta && (
                      <Badge variant="secondary" className="text-xs">Cesta</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
