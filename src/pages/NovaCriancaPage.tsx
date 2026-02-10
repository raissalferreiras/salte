import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { CameraCapture } from '@/components/CameraCapture';
import type { Tables } from '@/integrations/supabase/types';

type Pessoa = Tables<'pessoas'>;

export default function NovaCriancaPage() {
  const navigate = useNavigate();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    pessoa_id: '',
    // New person fields
    full_name: '',
    birth_date: '',
    phone: '',
    // Child specific fields
    escola: '',
    serie: '',
    turno: 'manha',
    alergias: '',
    medicamentos: '',
    necessidades_especiais: false,
    descricao_necessidades: '',
  });

  const [createNewPerson, setCreateNewPerson] = useState(true);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);

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
    
    if (createNewPerson && !formData.full_name) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    if (!createNewPerson && !formData.pessoa_id) {
      toast.error('Selecione uma pessoa');
      return;
    }

    if (!photoBlob) {
      toast.error('A foto da criança é obrigatória');
      return;
    }

    setIsSaving(true);

    let pessoaId = formData.pessoa_id;

    // Create new person if needed
    if (createNewPerson) {
      const { data: newPessoa, error: pessoaError } = await supabase
        .from('pessoas')
        .insert({
          full_name: formData.full_name,
          birth_date: formData.birth_date || null,
          phone: formData.phone || null,
        })
        .select()
        .single();

      if (pessoaError) {
        toast.error('Erro ao criar pessoa');
        console.error(pessoaError);
        setIsSaving(false);
        return;
      }

      pessoaId = newPessoa.id;
    }

    // Upload photo
    const fileName = `${pessoaId}-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('child-photos')
      .upload(fileName, photoBlob, { contentType: 'image/jpeg', upsert: true });

    if (uploadError) {
      toast.error('Erro ao enviar foto');
      console.error(uploadError);
      setIsSaving(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('child-photos')
      .getPublicUrl(fileName);

    // Update pessoa with photo_url
    await supabase.from('pessoas').update({ photo_url: urlData.publicUrl }).eq('id', pessoaId);
    
    const { error } = await supabase.from('criancas').insert({
      pessoa_id: pessoaId,
      escola: formData.escola || null,
      serie: formData.serie || null,
      turno: formData.turno || null,
      alergias: formData.alergias || null,
      medicamentos: formData.medicamentos || null,
      necessidades_especiais: formData.necessidades_especiais,
      descricao_necessidades: formData.descricao_necessidades || null,
    });

    setIsSaving(false);

    if (error) {
      toast.error('Erro ao salvar criança');
      console.error(error);
      return;
    }

    toast.success('Criança cadastrada!');
    navigate('/criancas');
  };

  return (
    <AppLayout>
      <PageHeader title="Nova Criança" showBack />

      <div className="px-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <Label>Criar nova pessoa?</Label>
            <Switch
              checked={createNewPerson}
              onCheckedChange={setCreateNewPerson}
            />
          </div>

          {createNewPerson ? (
            <>
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Nome da criança"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone Responsável</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </>
          ) : (
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
          )}

          {/* Photo capture */}
          <div className="space-y-2">
            <Label>Foto da Criança *</Label>
            <CameraCapture onCapture={setPhotoBlob} />
          </div>

          <div className="space-y-2">
            <Label>Escola</Label>
            <Input
              value={formData.escola}
              onChange={(e) => setFormData({ ...formData, escola: e.target.value })}
              placeholder="Nome da escola"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Série/Ano</Label>
              <Input
                value={formData.serie}
                onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                placeholder="Ex: 3º ano"
              />
            </div>
            <div className="space-y-2">
              <Label>Turno</Label>
              <Select
                value={formData.turno}
                onValueChange={(value) => setFormData({ ...formData, turno: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha">Manhã</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="integral">Integral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alergias</Label>
            <Textarea
              value={formData.alergias}
              onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
              placeholder="Liste alergias conhecidas..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Medicamentos</Label>
            <Textarea
              value={formData.medicamentos}
              onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
              placeholder="Medicamentos de uso contínuo..."
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label>Necessidades Especiais?</Label>
            <Switch
              checked={formData.necessidades_especiais}
              onCheckedChange={(checked) => setFormData({ ...formData, necessidades_especiais: checked })}
            />
          </div>

          {formData.necessidades_especiais && (
            <div className="space-y-2">
              <Label>Descrição das Necessidades</Label>
              <Textarea
                value={formData.descricao_necessidades}
                onChange={(e) => setFormData({ ...formData, descricao_necessidades: e.target.value })}
                placeholder="Descreva as necessidades especiais..."
                rows={3}
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Cadastrar Criança'
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
