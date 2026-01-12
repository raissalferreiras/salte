import { useEffect, useState } from 'react';
import { BarChart3, Baby, Home, Brain, Users, Calendar, TrendingUp, Download } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { exportToPDF, exportToExcel } from '@/lib/export';

interface Stats {
  totalCriancas: number;
  totalFamilias: number;
  totalPessoas: number;
  visitasMes: number;
  atendimentosMes: number;
  familiasAtivas: number;
  criancasComPresenca: number;
}

interface MonthlyData {
  mes: string;
  visitas: number;
  presencas: number;
  atendimentos: number;
}

export default function RelatoriosPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [frentesData, setFrentesData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Basic counts
        const [criancas, familias, pessoas, visitas, atendimentos] = await Promise.all([
          supabase.from('criancas').select('id', { count: 'exact', head: true }),
          supabase.from('familias').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('pessoas').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('visitas').select('id', { count: 'exact', head: true })
            .gte('data', format(startOfMonth(new Date()), 'yyyy-MM-dd')),
          supabase.from('atendimentos_psicologicos').select('id', { count: 'exact', head: true })
            .gte('data', format(startOfMonth(new Date()), 'yyyy-MM-dd')),
        ]);

        setStats({
          totalCriancas: criancas.count || 0,
          totalFamilias: familias.count || 0,
          totalPessoas: pessoas.count || 0,
          visitasMes: visitas.count || 0,
          atendimentosMes: atendimentos.count || 0,
          familiasAtivas: familias.count || 0,
          criancasComPresenca: 0,
        });

        // Monthly data (last 6 months)
        const monthlyPromises = [];
        for (let i = 5; i >= 0; i--) {
          const month = subMonths(new Date(), i);
          const start = format(startOfMonth(month), 'yyyy-MM-dd');
          const end = format(endOfMonth(month), 'yyyy-MM-dd');

          monthlyPromises.push(
            Promise.all([
              supabase.from('visitas').select('id', { count: 'exact', head: true })
                .gte('data', start).lte('data', end),
              supabase.from('presencas').select('id', { count: 'exact', head: true })
                .gte('data', start).lte('data', end),
              supabase.from('atendimentos_psicologicos').select('id', { count: 'exact', head: true })
                .gte('data', start).lte('data', end),
            ]).then(([v, p, a]) => ({
              mes: format(month, 'MMM', { locale: ptBR }),
              visitas: v.count || 0,
              presencas: p.count || 0,
              atendimentos: a.count || 0,
            }))
          );
        }

        const monthly = await Promise.all(monthlyPromises);
        setMonthlyData(monthly);

        // Frentes data
        const [sementinhas, historias, psicologico] = await Promise.all([
          supabase.from('pessoa_frentes').select('id', { count: 'exact', head: true })
            .eq('is_active', true),
          supabase.from('familia_frentes').select('id', { count: 'exact', head: true })
            .eq('is_active', true),
          supabase.from('atendimentos_psicologicos').select('id', { count: 'exact', head: true }),
        ]);

        setFrentesData([
          { name: 'Sementinhas', value: sementinhas.count || 0, color: '#10B981' },
          { name: 'Histórias', value: historias.count || 0, color: '#3B82F6' },
          { name: 'Psicológico', value: psicologico.count || 0, color: '#8B5CF6' },
        ]);

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExportPDF = () => {
    if (!stats) return;
    exportToPDF(
      [stats as unknown as Record<string, unknown>],
      [
        { header: 'Crianças', key: 'totalCriancas' },
        { header: 'Famílias', key: 'totalFamilias' },
        { header: 'Pessoas', key: 'totalPessoas' },
        { header: 'Visitas (mês)', key: 'visitasMes' },
        { header: 'Atendimentos (mês)', key: 'atendimentosMes' },
      ],
      `relatorio-ventosa-${format(new Date(), 'yyyy-MM-dd')}`,
      'Relatório Sistema Ventosa'
    );
  };

  const handleExportExcel = () => {
    if (!monthlyData) return;
    exportToExcel(
      monthlyData as unknown as Record<string, unknown>[],
      `relatorio-mensal-${format(new Date(), 'yyyy-MM-dd')}`,
      'Dados Mensais'
    );
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Relatórios" 
        subtitle="Estatísticas e indicadores"
        rightContent={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExportExcel}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="px-4 pb-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : (
            <>
              <div className="bg-card rounded-2xl p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Baby className="h-5 w-5 text-chart-1" />
                  <span className="text-sm text-muted-foreground">Crianças</span>
                </div>
                <p className="text-3xl font-bold">{stats?.totalCriancas || 0}</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Famílias</span>
                </div>
                <p className="text-3xl font-bold">{stats?.totalFamilias || 0}</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-chart-3" />
                  <span className="text-sm text-muted-foreground">Visitas (mês)</span>
                </div>
                <p className="text-3xl font-bold">{stats?.visitasMes || 0}</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-5 w-5 text-chart-4" />
                  <span className="text-sm text-muted-foreground">Atendimentos</span>
                </div>
                <p className="text-3xl font-bold">{stats?.atendimentosMes || 0}</p>
              </div>
            </>
          )}
        </div>

        {/* Monthly chart */}
        <div className="bg-card rounded-2xl p-4 border border-border/50 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Atividade Mensal
          </h3>
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="visitas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Visitas" />
                  <Bar dataKey="presencas" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Presenças" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Frentes distribution */}
        <div className="bg-card rounded-2xl p-4 border border-border/50 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-chart-3" />
            Distribuição por Frente
          </h3>
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={frentesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {frentesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {frentesData.map((frente) => (
                  <div key={frente.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: frente.color }} />
                      <span className="text-sm">{frente.name}</span>
                    </div>
                    <span className="font-semibold">{frente.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Export buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
