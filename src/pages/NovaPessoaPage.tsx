import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useActivityLog } from '@/hooks/useActivityLog';

export default function NovaPessoaPage() {
  const navigate = useNavigate();
  const { logActivity } = useActivityLog();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    cpf: '',
    phone: '',
    phone_secondary: '',
    email: '',
    address: '',
    address_number: '',
    address_complement: '',
    neighborhood: 'Favela Ventosa',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      toast.error('Digite o nome completo');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('pessoas')
        .insert({
          full_name: formData.full_name.trim(),
          birth_date: formData.birth_date || null,
          cpf: formData.cpf || null,
          phone: formData.phone || null,
          phone_secondary: formData.phone_secondary || null,
          email: formData.email || null,
          address: formData.address || null,
          address_number: formData.address_number || null,
          address_complement: formData.address_complement || null,
          neighborhood: formData.neighborhood || null,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code || null,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      await logActivity('create', 'pessoas', data.id, undefined, data as Record<string, unknown>);

      toast.success('Pessoa cadastrada com sucesso!');
      navigate(`/pessoas/${data.id}`);
    } catch (error) {
      console.error('Error creating pessoa:', error);
      toast.error('Erro ao cadastrar pessoa');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Nova Pessoa" showBack />

      <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-6">
        {/* Dados Pessoais */}
        <div className="bg-card rounded-2xl p-4 border border-border/50 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Dados Pessoais
          </h2>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Nome completo"
              className="h-11 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_secondary">Telefone 2</Label>
              <Input
                id="phone_secondary"
                name="phone_secondary"
                type="tel"
                value={formData.phone_secondary}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-card rounded-2xl p-4 border border-border/50 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Endereço
          </h2>

          <div className="space-y-2">
            <Label htmlFor="address">Rua / Logradouro</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Rua, Travessa, Beco..."
              className="h-11 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="address_number">Número</Label>
              <Input
                id="address_number"
                name="address_number"
                value={formData.address_number}
                onChange={handleChange}
                placeholder="123"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="address_complement">Complemento</Label>
              <Input
                id="address_complement"
                name="address_complement"
                value={formData.address_complement}
                onChange={handleChange}
                placeholder="Apto, bloco..."
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              placeholder="Bairro"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">UF</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                maxLength={2}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">CEP</Label>
            <Input
              id="zip_code"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              placeholder="00000-000"
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        {/* Observações */}
        <div className="bg-card rounded-2xl p-4 border border-border/50 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Observações
          </h2>

          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Anotações gerais sobre a pessoa..."
            className="min-h-[100px] rounded-xl resize-none"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-medium"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Cadastrar Pessoa'}
        </Button>
      </form>
    </AppLayout>
  );
}
