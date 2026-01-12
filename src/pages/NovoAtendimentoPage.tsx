import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Pessoa = Tables<'pessoas'>;

export default function NovoAtendimentoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    pessoa_id: '',
    data: new Date().toISOString().split('T')[0],
    horario_inicio: '',
    horario_fim: '',
    tipo: 'individual',
    observacoes_iniciais: '',
    evolucao: '',
    status: 'agendado',
  });

  useEffect(() => {
    async function fetchPessoas() {
      setIsLoading(true);
      const { data } = await supabase
        .from('pessoas')
        .select('*')
        .eq('is_active', true)
        .order('full_name');
      setPessoas(data || []);
      setIsLoading(false);
    }
    fetchPessoas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pessoa_id) {
      toast.error('Selecione uma pessoa');
      return;
    }

    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    setIsSaving(true);
    
    const { error } = await supabase.from('atendimentos_psicologicos').insert({
      pessoa_id: formData.pessoa_id,
      profissional_id: user.id,
      data: formData.data,
      horario_inicio: formData.horario_inicio || null,
      horario_fim: formData.horario_fim || null,
      tipo: formData.tipo,
      observacoes_iniciais: formData.observacoes_iniciais || null,
      evolucao: formData.evolucao || null,
      status: formData.status,
    });

    setIsSaving(false);

    if (error) {
      toast.error('Erro ao salvar atendimento');
      console.error(error);
      return;
    }

    toast.success('Atendimento registrado!');
    navigate('/frentes/psicologico');
  };

  return (
    <AppLayout>
      <PageHeader title="Novo Atendimento" showBack />

      <div className="px-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Pessoa *</Label>
            <Select
              value={formData.pessoa_id}
              onValueChange={(value) => setFormData({ ...formData, pessoa_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? 'Carregando...' : 'Selecione uma pessoa'} />
              </SelectTrigger>
              <SelectContent>
                {pessoas.map((pessoa) => (
                  <SelectItem key={pessoa.id} value={pessoa.id}>
                    {pessoa.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="realizado">Realizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Horário Início</Label>
              <Input
                type="time"
                value={formData.horario_inicio}
                onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Horário Fim</Label>
              <Input
                type="time"
                value={formData.horario_fim}
                onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="familiar">Familiar</SelectItem>
                <SelectItem value="grupo">Grupo</SelectItem>
                <SelectItem value="acolhimento">Acolhimento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações Iniciais</Label>
            <Textarea
              value={formData.observacoes_iniciais}
              onChange={(e) => setFormData({ ...formData, observacoes_iniciais: e.target.value })}
              placeholder="Observações sobre o atendimento..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Evolução</Label>
            <Textarea
              value={formData.evolucao}
              onChange={(e) => setFormData({ ...formData, evolucao: e.target.value })}
              placeholder="Registro da evolução..."
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Atendimento'
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
