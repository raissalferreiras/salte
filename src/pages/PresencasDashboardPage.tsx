import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Users, Calendar, TrendingUp, Check, X, ClipboardList, Baby } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Presenca {
  id: string;
  pessoa_id: string;
  data: string;
  presente: boolean | null;
  observacoes: string | null;
  comportamento: string | null;
}

interface CriancaData {
  id: string;
  pessoa_id: string;
  pessoa: {
    id: string;
    full_name: string;
    photo_url: string | null;
  };
}

interface DayStats {
  date: Date;
  total: number;
  presentes: number;
  ausentes: number;
}

export default function PresencasDashboardPage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [criancas, setCriancas] = useState<CriancaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const startDate = format(monthStart, 'yyyy-MM-dd');
      const endDate = format(monthEnd, 'yyyy-MM-dd');

      const [presencasRes, criancasRes] = await Promise.all([
        supabase
          .from('presencas')
          .select('*')
          .gte('data', startDate)
          .lte('data', endDate)
          .order('data', { ascending: true }),
        supabase
          .from('criancas')
          .select('id, pessoa_id, pessoa:pessoas_public!criancas_pessoa_id_fkey(id, full_name, photo_url)')
          .eq('is_active', true)
      ]);

      if (presencasRes.data) setPresencas(presencasRes.data);
      if (criancasRes.data) setCriancas(criancasRes.data as CriancaData[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = () => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  };

  const getDayStats = (date: Date): DayStats => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayPresencas = presencas.filter(p => p.data === dateStr);
    const presentes = dayPresencas.filter(p => p.presente).length;
    const ausentes = dayPresencas.filter(p => p.presente === false).length;
    
    return {
      date,
      total: dayPresencas.length,
      presentes,
      ausentes
    };
  };

  const getMonthStats = () => {
    const totalPresencas = presencas.filter(p => p.presente).length;
    const totalAusencias = presencas.filter(p => p.presente === false).length;
    const diasComAtividade = new Set(presencas.map(p => p.data)).size;
    const mediaPresencas = diasComAtividade > 0 ? Math.round(totalPresencas / diasComAtividade) : 0;

    return { totalPresencas, totalAusencias, diasComAtividade, mediaPresencas };
  };

  const getPresencasForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return presencas.filter(p => p.data === dateStr);
  };

  const getCriancaName = (pessoaId: string) => {
    const crianca = criancas.find(c => c.pessoa_id === pessoaId);
    return crianca?.pessoa?.full_name || 'Desconhecido';
  };

  const monthStats = getMonthStats();
  const days = getDaysInMonth();

  return (
    <AppLayout>
      <PageHeader 
        title="Dashboard de Presenças" 
        showBack
        rightContent={
          <Button size="sm" onClick={() => navigate('/presencas/novo')}>
            <ClipboardList className="h-4 w-4 mr-2" />
            Registrar
          </Button>
        }
      />

      <div className="px-4 pb-24 space-y-6">
        {/* Month Navigator */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{monthStats.totalPresencas}</p>
                    <p className="text-xs text-muted-foreground">Presenças</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{monthStats.totalAusencias}</p>
                    <p className="text-xs text-muted-foreground">Ausências</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{monthStats.diasComAtividade}</p>
                    <p className="text-xs text-muted-foreground">Dias c/ atividade</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{monthStats.mediaPresencas}</p>
                    <p className="text-xs text-muted-foreground">Média/dia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calendar Grid */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendário de Presenças
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {days.map((day) => {
                const stats = getDayStats(day);
                const hasActivity = stats.total > 0;
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(isSelected ? null : day)}
                    className={cn(
                      "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative",
                      hasActivity && "cursor-pointer hover:ring-2 hover:ring-primary/50",
                      isSelected && "ring-2 ring-primary bg-primary/10",
                      isToday && !isSelected && "ring-1 ring-border",
                      !hasActivity && "text-muted-foreground"
                    )}
                  >
                    <span className={cn("font-medium", isToday && "text-primary")}>
                      {format(day, 'd')}
                    </span>
                    {hasActivity && (
                      <div className="flex gap-0.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" title={`${stats.presentes} presentes`} />
                        {stats.ausentes > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" title={`${stats.ausentes} ausentes`} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        {selectedDate && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const dayPresencas = getPresencasForDate(selectedDate);
                if (dayPresencas.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma presença registrada neste dia
                    </p>
                  );
                }

                const presentes = dayPresencas.filter(p => p.presente);
                const ausentes = dayPresencas.filter(p => p.presente === false);

                return (
                  <div className="space-y-4">
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" /> {presentes.length} presentes
                      </span>
                      <span className="flex items-center gap-1 text-red-600">
                        <X className="h-4 w-4" /> {ausentes.length} ausentes
                      </span>
                    </div>

                    {presentes.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">PRESENTES</p>
                        <div className="flex flex-wrap gap-2">
                          {presentes.map((p) => (
                            <Badge key={p.id} variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              {getCriancaName(p.pessoa_id)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {ausentes.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">AUSENTES</p>
                        <div className="flex flex-wrap gap-2">
                          {ausentes.map((p) => (
                            <Badge key={p.id} variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              {getCriancaName(p.pessoa_id)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Children Ranking */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Baby className="h-4 w-4" />
              Frequência por Criança
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (
              <div className="space-y-2">
                {criancas.map((crianca) => {
                  const criancaPresencas = presencas.filter(p => p.pessoa_id === crianca.pessoa_id);
                  const total = criancaPresencas.length;
                  const presentes = criancaPresencas.filter(p => p.presente).length;
                  const percentage = total > 0 ? Math.round((presentes / total) * 100) : 0;

                  return (
                    <button
                      key={crianca.id}
                      onClick={() => navigate(`/criancas/${crianca.id}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={crianca.pessoa?.photo_url || undefined} />
                        <AvatarFallback className="bg-chart-1/10 text-chart-1 text-sm">
                          {crianca.pessoa?.full_name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-left">{crianca.pessoa?.full_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{presentes}/{total} presenças</span>
                          {total > 0 && (
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-xs",
                                percentage >= 75 && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                percentage >= 50 && percentage < 75 && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                                percentage < 50 && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              )}
                            >
                              {percentage}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      {total > 0 && (
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              percentage >= 75 && "bg-green-500",
                              percentage >= 50 && percentage < 75 && "bg-yellow-500",
                              percentage < 50 && "bg-red-500"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
