import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Evento } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function CalendarioPage() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);

        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .gte('data_inicio', start.toISOString())
          .lte('data_inicio', end.toISOString())
          .order('data_inicio');

        if (error) throw error;
        setEventos(data as Evento[]);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventos();
  }, [currentMonth]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const eventosNoDia = (date: Date) => 
    eventos.filter((e) => isSameDay(new Date(e.data_inicio), date));

  const eventosSelecionados = selectedDate 
    ? eventosNoDia(selectedDate)
    : [];

  const getEventoColor = (tipo: string) => {
    switch (tipo) {
      case 'reuniao': return 'bg-primary';
      case 'acao_social': return 'bg-chart-1';
      case 'visita': return 'bg-chart-3';
      case 'atendimento': return 'bg-chart-4';
      case 'evento_especial': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getEventoLabel = (tipo: string) => {
    switch (tipo) {
      case 'reuniao': return 'Reunião';
      case 'acao_social': return 'Ação Social';
      case 'visita': return 'Visita';
      case 'atendimento': return 'Atendimento';
      case 'evento_especial': return 'Evento Especial';
      default: return 'Outro';
    }
  };

  // Get first day offset
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startOffset = firstDayOfMonth.getDay(); // 0 = Sunday

  return (
    <AppLayout>
      <PageHeader 
        title="Calendário" 
        subtitle="Eventos e agendamentos"
        rightContent={
          <Button size="icon" onClick={() => navigate('/eventos/novo')} className="h-9 w-9 rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      <div className="px-4 pb-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Calendar grid */}
        <div className="bg-card rounded-2xl border border-border/50 p-3 mb-4">
          {/* Week days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {days.map((day) => {
              const dayEventos = eventosNoDia(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const today = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all relative',
                    isSelected && 'bg-primary text-primary-foreground',
                    !isSelected && today && 'bg-primary/20 text-primary font-semibold',
                    !isSelected && !today && 'hover:bg-muted'
                  )}
                >
                  {format(day, 'd')}
                  {dayEventos.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEventos.slice(0, 3).map((e, i) => (
                        <div
                          key={i}
                          className={cn(
                            'w-1 h-1 rounded-full',
                            isSelected ? 'bg-primary-foreground' : getEventoColor(e.tipo)
                          )}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day events */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              {selectedDate 
                ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })
                : 'Selecione uma data'}
            </h3>
            {selectedDate && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/eventos/novo?data=${format(selectedDate, 'yyyy-MM-dd')}`)}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            )}
          </div>

          {isLoading ? (
            <Skeleton className="h-20 rounded-xl" />
          ) : eventosSelecionados.length === 0 ? (
            <div className="bg-card rounded-xl p-6 border border-border/50 text-center">
              <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Nenhum evento neste dia</p>
            </div>
          ) : (
            <div className="space-y-2">
              {eventosSelecionados.map((evento) => (
                <button
                  key={evento.id}
                  onClick={() => navigate(`/eventos/${evento.id}`)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50 hover:shadow-sm transition-all text-left"
                >
                  <div className={cn('w-1 h-full min-h-[48px] rounded-full', getEventoColor(evento.tipo))} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{evento.titulo}</p>
                      <Badge variant="secondary" className="text-[10px]">
                        {getEventoLabel(evento.tipo)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(evento.data_inicio), 'HH:mm')}
                      {evento.data_fim && ` - ${format(new Date(evento.data_fim), 'HH:mm')}`}
                    </p>
                    {evento.local && (
                      <p className="text-xs text-muted-foreground mt-0.5">{evento.local}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-card rounded-xl p-3 border border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-2">Tipos de evento</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1 text-[10px]">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Reunião
            </Badge>
            <Badge variant="outline" className="gap-1 text-[10px]">
              <div className="w-2 h-2 rounded-full bg-chart-1" />
              Ação Social
            </Badge>
            <Badge variant="outline" className="gap-1 text-[10px]">
              <div className="w-2 h-2 rounded-full bg-chart-3" />
              Visita
            </Badge>
            <Badge variant="outline" className="gap-1 text-[10px]">
              <div className="w-2 h-2 rounded-full bg-chart-4" />
              Atendimento
            </Badge>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
