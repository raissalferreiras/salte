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
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Pessoa = Tables<'pessoas'>;

export default function NovaFamiliaPage() {
  const navigate = useNavigate();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    responsavel_id: '',
    address: '',
    address_number: '',
    address_complement: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    zip_code: '',
    num_moradores: '',
    necessidades: '',
    observacoes: '',
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
    
    if (!formData.address) {
      toast.error('Endereço é obrigatório');
      return;
    }

    setIsSaving(true);
    
    const { error } = await supabase.from('familias').insert({
      responsavel_id: formData.responsavel_id || null,
      address: formData.address,
      address_number: formData.address_number || null,
      address_complement: formData.address_complement || null,
      neighborhood: formData.neighborhood || null,
      city: formData.city || null,
      state: formData.state || null,
      zip_code: formData.zip_code || null,
      num_moradores: formData.num_moradores ? parseInt(formData.num_moradores) : null,
      necessidades: formData.necessidades || null,
      observacoes: formData.observacoes || null,
    });

    setIsSaving(false);

    if (error) {
      toast.error('Erro ao salvar família');
      console.error(error);
      return;
    }

    toast.success('Família cadastrada!');
    navigate('/familias');
  };

  return (
    <AppLayout>
      <PageHeader title="Nova Família" showBack />

      <div className="px-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Responsável</Label>
            <Select
              value={formData.responsavel_id}
              onValueChange={(value) => setFormData({ ...formData, responsavel_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? 'Carregando...' : 'Selecione o responsável'} />
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

          <div className="space-y-2">
            <Label>Endereço *</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Rua, Avenida..."
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Número</Label>
              <Input
                value={formData.address_number}
                onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                placeholder="123"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Complemento</Label>
              <Input
                value={formData.address_complement}
                onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                placeholder="Apto, Bloco..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                placeholder="00000-000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                maxLength={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nº de Moradores</Label>
            <Input
              type="number"
              value={formData.num_moradores}
              onChange={(e) => setFormData({ ...formData, num_moradores: e.target.value })}
              min={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Necessidades</Label>
            <Textarea
              value={formData.necessidades}
              onChange={(e) => setFormData({ ...formData, necessidades: e.target.value })}
              placeholder="Descreva as necessidades da família..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações gerais..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Cadastrar Família'
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
