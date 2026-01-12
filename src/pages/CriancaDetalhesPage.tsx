import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { School, Clock, AlertCircle, Pill, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tables } from '@/integrations/supabase/types';

type Crianca = Tables<'criancas'>;
type Pessoa = Tables<'pessoas'>;

interface CriancaWithPessoa extends Crianca {
  pessoa?: Pessoa;
}

export default function CriancaDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [crianca, setCrianca] = useState<CriancaWithPessoa | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCrianca() {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('criancas')
        .select('*, pessoa:pessoas!criancas_pessoa_id_fkey(*)')
        .eq('id', id)
        .single();

      if (error) {
        toast.error('Criança não encontrada');
        navigate('/criancas');
        return;
      }

      setCrianca(data);
      setIsLoading(false);
    }

    fetchCrianca();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!crianca || !confirm('Tem certeza que deseja excluir esta criança?')) return;

    const { error } = await supabase
      .from('criancas')
      .delete()
      .eq('id', crianca.id);

    if (error) {
      toast.error('Erro ao excluir criança');
      return;
    }

    toast.success('Criança excluída');
    navigate('/criancas');
  };

  const getAge = () => {
    if (!crianca?.pessoa?.birth_date) return null;
    return differenceInYears(new Date(), new Date(crianca.pessoa.birth_date));
  };

  const getTurnoLabel = (turno: string | null) => {
    switch (turno) {
      case 'manha':
        return 'Manhã';
      case 'tarde':
        return 'Tarde';
      case 'integral':
        return 'Integral';
      default:
        return turno;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader title="Criança" showBack />
        <div className="px-4 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!crianca) {
    return null;
  }

  const age = getAge();

  return (
    <AppLayout>
      <PageHeader 
        title="Detalhes" 
        showBack
        rightContent={
          <Button size="icon" variant="outline" onClick={handleDelete} className="h-9 w-9">
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />

      <div className="px-4 pb-24 space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={crianca.pessoa?.photo_url || undefined} />
                <AvatarFallback className="text-lg">
                  {crianca.pessoa?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{crianca.pessoa?.full_name}</h2>
                {age !== null && (
                  <p className="text-muted-foreground">{age} anos</p>
                )}
                {crianca.pessoa?.birth_date && (
                  <p className="text-sm text-muted-foreground">
                    Nascimento: {format(new Date(crianca.pessoa.birth_date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {(crianca.escola || crianca.serie || crianca.turno) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <School className="h-4 w-4" />
                Escola
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {crianca.escola && (
                <p className="text-sm">{crianca.escola}</p>
              )}
              <div className="flex gap-2">
                {crianca.serie && (
                  <Badge variant="secondary">{crianca.serie}</Badge>
                )}
                {crianca.turno && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getTurnoLabel(crianca.turno)}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {crianca.alergias && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                Alergias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {crianca.alergias}
              </p>
            </CardContent>
          </Card>
        )}

        {crianca.medicamentos && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Medicamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {crianca.medicamentos}
              </p>
            </CardContent>
          </Card>
        )}

        {crianca.necessidades_especiais && crianca.descricao_necessidades && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Necessidades Especiais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {crianca.descricao_necessidades}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
