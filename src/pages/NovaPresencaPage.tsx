import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Users } from "lucide-react";
import { format } from "date-fns";

interface Crianca {
  id: string;
  pessoa: {
    id: string;
    full_name: string;
  };
}

export default function NovaPresencaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [criancas, setCriancas] = useState<Crianca[]>([]);
  const [presencas, setPresencas] = useState<Record<string, boolean>>({});
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [comportamentos, setComportamentos] = useState<Record<string, string>>({});
  const [data, setData] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    fetchCriancas();
  }, []);

  const fetchCriancas = async () => {
    const { data, error } = await supabase
      .from("criancas")
      .select("*, pessoa:pessoas!criancas_pessoa_id_fkey(*)")
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Erro ao carregar crianças", variant: "destructive" });
      return;
    }

    setCriancas(data || []);
    
    // Initialize all as present
    const initialPresencas: Record<string, boolean> = {};
    data?.forEach((c) => {
      initialPresencas[c.pessoa.id] = true;
    });
    setPresencas(initialPresencas);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const registros = criancas.map((c) => ({
        pessoa_id: c.pessoa.id,
        data,
        presente: presencas[c.pessoa.id] ?? false,
        observacoes: observacoes[c.pessoa.id] || null,
        comportamento: comportamentos[c.pessoa.id] || null,
        registrado_por: user?.id || null,
      }));

      const { error } = await supabase.from("presencas").insert(registros);

      if (error) throw error;

      toast({ title: "Presenças registradas com sucesso!" });
      navigate('/frentes/sementinhas');
    } catch (error: any) {
      toast({
        title: "Erro ao registrar presenças",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const presentCount = Object.values(presencas).filter(Boolean).length;
  const totalCount = criancas.length;

  return (
    <AppLayout>
      <PageHeader title="Registrar Presenças" showBack />

      <div className="p-4 pb-32 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label>Data</Label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="border rounded px-3 py-2 bg-background"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {presentCount} de {totalCount} presentes
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {criancas.map((crianca) => (
            <Card key={crianca.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={presencas[crianca.pessoa.id] ?? false}
                      onCheckedChange={(checked) =>
                        setPresencas((prev) => ({
                          ...prev,
                          [crianca.pessoa.id]: !!checked,
                        }))
                      }
                    />
                    <span className="font-medium">{crianca.pessoa.full_name}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      presencas[crianca.pessoa.id]
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {presencas[crianca.pessoa.id] ? "Presente" : "Ausente"}
                  </span>
                </div>

                <Select
                  value={comportamentos[crianca.pessoa.id] || ""}
                  onValueChange={(value) =>
                    setComportamentos((prev) => ({
                      ...prev,
                      [crianca.pessoa.id]: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Comportamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="otimo">Ótimo</SelectItem>
                    <SelectItem value="bom">Bom</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="ruim">Ruim</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Observações sobre a criança..."
                  value={observacoes[crianca.pessoa.id] || ""}
                  onChange={(e) =>
                    setObservacoes((prev) => ({
                      ...prev,
                      [crianca.pessoa.id]: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </CardContent>
            </Card>
          ))}

          {criancas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma criança cadastrada
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t">
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Salvando..." : "Salvar Presenças"}
        </Button>
      </div>
    </AppLayout>
  );
}
