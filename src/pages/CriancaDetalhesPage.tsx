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
import { format, differenceInYears, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { School, Clock, AlertCircle, Pill, Trash2, Calendar, Check, X, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type Crianca = Tables<'criancas'>;
type PessoaPublic = Tables<'pessoas_public'>;

interface CriancaWithPessoa extends Crianca {
  pessoa?: PessoaPublic;
}

interface Presenca {
  id: string;
  data: string;
  presente: boolean | null;
  observacoes: string | null;
  comportamento: string | null;
}

export default function CriancaDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [crianca, setCrianca] = useState<CriancaWithPessoa | null>(null);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      const { data: criancaData, error } = await supabase
        .from('criancas')
        .select('*, pessoa:pessoas_public!criancas_pessoa_id_fkey(*)')
        .eq('id', id)
        .single();

      if (error) {
        toast.error('Criança não encontrada');
        navigate('/criancas');
        return;
      }

      setCrianca(criancaData);

      // Fetch attendance history (last 3 months)
      if (criancaData?.pessoa_id) {
        const threeMonthsAgo = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
        const { data: presencasData } = await supabase
          .from('presencas')
          .select('id, data, presente, observacoes, comportamento')
          .eq('pessoa_id', criancaData.pessoa_id)
          .gte('data', threeMonthsAgo)
          .order('data', { ascending: false });

        setPresencas(presencasData || []);
      }

      setIsLoading(false);
    }

    fetchData();
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

  // Calculate attendance stats
  const totalPresencas = presencas.filter(p => p.presente).length;
  const totalAusencias = presencas.filter(p => p.presente === false).length;
  const totalRegistros = presencas.length;
  const frequencia = totalRegistros > 0 ? Math.round((totalPresencas / totalRegistros) * 100) : 0;

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

        {/* Attendance Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Frequência (últimos 3 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {presencas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma presença registrada</p>
            ) : (
              <div className="space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                      <Check className="h-4 w-4" />
                      <span className="text-xl font-bold">{totalPresencas}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Presenças</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400">
                      <X className="h-4 w-4" />
                      <span className="text-xl font-bold">{totalAusencias}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Ausências</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-primary/10">
                    <div className="flex items-center justify-center gap-1 text-primary">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xl font-bold">{frequencia}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Frequência</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Taxa de presença</span>
                    <span>{frequencia}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        frequencia >= 75 && "bg-green-500",
                        frequencia >= 50 && frequencia < 75 && "bg-yellow-500",
                        frequencia < 50 && "bg-red-500"
                      )}
                      style={{ width: `${frequencia}%` }}
                    />
                  </div>
                </div>

                {/* Recent History */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">HISTÓRICO RECENTE</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {presencas.slice(0, 10).map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            p.presente ? "bg-green-500" : "bg-red-500"
                          )} />
                          <span className="text-sm">
                            {format(new Date(p.data), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {p.comportamento && (
                            <Badge variant="outline" className="text-xs">
                              {p.comportamento === 'otimo' ? 'Ótimo' : 
                               p.comportamento === 'bom' ? 'Bom' : 
                               p.comportamento === 'regular' ? 'Regular' : 
                               p.comportamento === 'ruim' ? 'Ruim' : p.comportamento}
                            </Badge>
                          )}
                          <Badge variant={p.presente ? "secondary" : "destructive"} className="text-xs">
                            {p.presente ? 'Presente' : 'Ausente'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
