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
import { Calendar, Clock, User, FileText, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tables } from '@/integrations/supabase/types';

type Atendimento = Tables<'atendimentos_psicologicos'>;
type Pessoa = Tables<'pessoas'>;

interface AtendimentoWithPessoa extends Atendimento {
  pessoa?: Pessoa;
}

export default function AtendimentoDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [atendimento, setAtendimento] = useState<AtendimentoWithPessoa | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAtendimento() {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('atendimentos_psicologicos')
        .select('*, pessoa:pessoas!atendimentos_psicologicos_pessoa_id_fkey(*)')
        .eq('id', id)
        .single();

      if (error) {
        toast.error('Atendimento não encontrado');
        navigate('/frentes/psicologico');
        return;
      }

      setAtendimento(data);
      setIsLoading(false);
    }

    fetchAtendimento();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!atendimento || !confirm('Tem certeza que deseja excluir este atendimento?')) return;

    const { error } = await supabase
      .from('atendimentos_psicologicos')
      .delete()
      .eq('id', atendimento.id);

    if (error) {
      toast.error('Erro ao excluir atendimento');
      return;
    }

    toast.success('Atendimento excluído');
    navigate('/frentes/psicologico');
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'realizado':
        return 'bg-chart-2 text-chart-2-foreground';
      case 'agendado':
        return 'bg-chart-4 text-chart-4-foreground';
      case 'cancelado':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader title="Atendimento" showBack />
        <div className="px-4 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!atendimento) {
    return null;
  }

  return (
    <AppLayout>
      <PageHeader 
        title="Detalhes do Atendimento" 
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
              <CardTitle className="text-lg">{atendimento.pessoa?.full_name || 'Pessoa'}</CardTitle>
              <Badge className={getStatusColor(atendimento.status)}>
                {atendimento.status || 'Pendente'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(atendimento.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
            
            {(atendimento.horario_inicio || atendimento.horario_fim) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {atendimento.horario_inicio || '--:--'} - {atendimento.horario_fim || '--:--'}
                </span>
              </div>
            )}

            {atendimento.tipo && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="capitalize">{atendimento.tipo}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {atendimento.observacoes_iniciais && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Observações Iniciais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {atendimento.observacoes_iniciais}
              </p>
            </CardContent>
          </Card>
        )}

        {atendimento.evolucao && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Evolução
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {atendimento.evolucao}
              </p>
            </CardContent>
          </Card>
        )}

        {atendimento.proxima_sessao && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Próxima Sessão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {format(new Date(atendimento.proxima_sessao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
