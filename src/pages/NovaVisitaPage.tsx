import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Familia = Tables<'familias'>;
type Pessoa = Tables<'pessoas'>;

interface FamiliaWithResponsavel extends Familia {
  responsavel?: Pessoa;
}

export default function NovaVisitaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const familiaIdParam = searchParams.get('familia');
  const { user } = useAuth();
  
  const [familias, setFamilias] = useState<FamiliaWithResponsavel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    familia_id: familiaIdParam || '',
    data: new Date().toISOString().split('T')[0],
    situacao_encontrada: '',
    necessidades_identificadas: '',
    encaminhamentos: '',
    entregou_cesta: false,
    cesta_itens: '',
    observacoes: '',
    proxima_visita: '',
  });

  useEffect(() => {
    async function fetchFamilias() {
      setIsLoading(true);
      const { data } = await supabase
        .from('familias')
        .select('*, responsavel:pessoas!familias_responsavel_id_fkey(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      setFamilias(data || []);
      setIsLoading(false);
    }
    fetchFamilias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.familia_id) {
      toast.error('Selecione uma família');
      return;
    }

    setIsSaving(true);
    
    const { error } = await supabase.from('visitas').insert({
      familia_id: formData.familia_id,
      visitante_id: user?.id || null,
      data: formData.data,
      situacao_encontrada: formData.situacao_encontrada || null,
      necessidades_identificadas: formData.necessidades_identificadas || null,
      encaminhamentos: formData.encaminhamentos || null,
      entregou_cesta: formData.entregou_cesta,
      cesta_itens: formData.cesta_itens || null,
      observacoes: formData.observacoes || null,
      proxima_visita: formData.proxima_visita || null,
    });

    setIsSaving(false);

    if (error) {
      toast.error('Erro ao salvar visita');
      console.error(error);
      return;
    }

    // Update family's last visit date
    await supabase
      .from('familias')
      .update({ 
        ultima_visita: formData.data,
        proxima_visita: formData.proxima_visita || null,
      })
      .eq('id', formData.familia_id);

    toast.success('Visita registrada!');
    navigate('/frentes/historias');
  };

  const getFamiliaLabel = (familia: FamiliaWithResponsavel) => {
    if (familia.responsavel?.full_name) {
      return `${familia.responsavel.full_name} - ${familia.neighborhood || familia.address}`;
    }
    return familia.address;
  };

  return (
    <AppLayout>
      <PageHeader title="Nova Visita" showBack />

      <div className="px-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Família *</Label>
            <Select
              value={formData.familia_id}
              onValueChange={(value) => setFormData({ ...formData, familia_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? 'Carregando...' : 'Selecione uma família'} />
              </SelectTrigger>
              <SelectContent>
                {familias.map((familia) => (
                  <SelectItem key={familia.id} value={familia.id}>
                    {getFamiliaLabel(familia)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data da Visita *</Label>
            <Input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Situação Encontrada</Label>
            <Textarea
              value={formData.situacao_encontrada}
              onChange={(e) => setFormData({ ...formData, situacao_encontrada: e.target.value })}
              placeholder="Descreva a situação encontrada..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Necessidades Identificadas</Label>
            <Textarea
              value={formData.necessidades_identificadas}
              onChange={(e) => setFormData({ ...formData, necessidades_identificadas: e.target.value })}
              placeholder="Liste as necessidades identificadas..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Encaminhamentos</Label>
            <Textarea
              value={formData.encaminhamentos}
              onChange={(e) => setFormData({ ...formData, encaminhamentos: e.target.value })}
              placeholder="Encaminhamentos realizados..."
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label>Entregou Cesta Básica?</Label>
            <Switch
              checked={formData.entregou_cesta}
              onCheckedChange={(checked) => setFormData({ ...formData, entregou_cesta: checked })}
            />
          </div>

          {formData.entregou_cesta && (
            <div className="space-y-2">
              <Label>Itens da Cesta</Label>
              <Textarea
                value={formData.cesta_itens}
                onChange={(e) => setFormData({ ...formData, cesta_itens: e.target.value })}
                placeholder="Liste os itens entregues..."
                rows={2}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações gerais..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Próxima Visita</Label>
            <Input
              type="date"
              value={formData.proxima_visita}
              onChange={(e) => setFormData({ ...formData, proxima_visita: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Registrar Visita'
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
