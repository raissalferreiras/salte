import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { CameraCapture } from '@/components/CameraCapture';

export default function EditarCriancaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pessoaId, setPessoaId] = useState('');
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    phone: '',
    escola: '',
    serie: '',
    turno: 'manha',
    alergias: '',
    medicamentos: '',
    necessidades_especiais: false,
    descricao_necessidades: '',
  });

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      const { data, error } = await supabase
        .from('criancas')
        .select('*, pessoa:pessoas!criancas_pessoa_id_fkey(*)')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast.error('Criança não encontrada');
        navigate('/criancas');
        return;
      }

      setPessoaId(data.pessoa_id);
      setCurrentPhotoUrl(data.pessoa?.photo_url || null);
      setFormData({
        full_name: data.pessoa?.full_name || '',
        birth_date: data.pessoa?.birth_date || '',
        phone: data.pessoa?.phone || '',
        escola: data.escola || '',
        serie: data.serie || '',
        turno: data.turno || 'manha',
        alergias: data.alergias || '',
        medicamentos: data.medicamentos || '',
        necessidades_especiais: data.necessidades_especiais || false,
        descricao_necessidades: data.descricao_necessidades || '',
      });
      setIsLoading(false);
    }

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name) {
      toast.error('Nome é obrigatório');
      return;
    }

    setIsSaving(true);

    // Update pessoa
    const pessoaUpdate: Record<string, unknown> = {
      full_name: formData.full_name,
      birth_date: formData.birth_date || null,
      phone: formData.phone || null,
    };

    // Upload new photo if captured
    if (photoBlob) {
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

      pessoaUpdate.photo_url = urlData.publicUrl;
    }

    const { error: pessoaError } = await supabase
      .from('pessoas')
      .update(pessoaUpdate)
      .eq('id', pessoaId);

    if (pessoaError) {
      toast.error('Erro ao atualizar dados pessoais');
      console.error(pessoaError);
      setIsSaving(false);
      return;
    }

    // Update crianca
    const { error } = await supabase
      .from('criancas')
      .update({
        escola: formData.escola || null,
        serie: formData.serie || null,
        turno: formData.turno || null,
        alergias: formData.alergias || null,
        medicamentos: formData.medicamentos || null,
        necessidades_especiais: formData.necessidades_especiais,
        descricao_necessidades: formData.descricao_necessidades || null,
      })
      .eq('id', id);

    setIsSaving(false);

    if (error) {
      toast.error('Erro ao salvar criança');
      console.error(error);
      return;
    }

    toast.success('Criança atualizada!');
    navigate(`/criancas/${id}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader title="Editar Criança" showBack />
        <div className="px-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Editar Criança" showBack />

      <div className="px-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo */}
          <div className="space-y-2">
            <Label>Foto da Criança</Label>
            <CameraCapture
              onCapture={setPhotoBlob}
              currentPhotoUrl={currentPhotoUrl}
            />
          </div>

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
              'Salvar Alterações'
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
