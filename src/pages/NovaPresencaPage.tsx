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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Users, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface Crianca {
  id: string;
  pessoa: {
    id: string;
    full_name: string;
    photo_url: string | null;
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
  const [presencasExistentes, setPresencasExistentes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCriancas();
  }, []);

  useEffect(() => {
    if (criancas.length > 0) {
      fetchPresencasExistentes();
    }
  }, [data, criancas]);

  const fetchCriancas = async () => {
    const { data, error } = await supabase
      .from("criancas")
      .select("*, pessoa:pessoas_public!criancas_pessoa_id_fkey(id, full_name, photo_url)");

    if (error) {
      toast({ title: "Erro ao carregar crianças", variant: "destructive" });
      return;
    }

    // Sort alphabetically by name
    const sorted = (data || []).sort((a, b) => 
      (a.pessoa?.full_name || "").localeCompare(b.pessoa?.full_name || "", "pt-BR")
    );
    setCriancas(sorted);
  };

  const fetchPresencasExistentes = async () => {
    const pessoaIds = criancas.map((c) => c.pessoa.id);
    
    const { data: existentes, error } = await supabase
      .from("presencas")
      .select("pessoa_id")
      .eq("data", data)
      .in("pessoa_id", pessoaIds);

    if (error) {
      console.error("Erro ao verificar presenças existentes:", error);
      return;
    }

    const existentesSet = new Set(existentes?.map((p) => p.pessoa_id) || []);
    setPresencasExistentes(existentesSet);

    // Initialize presences only for children without existing attendance
    const initialPresencas: Record<string, boolean> = {};
    criancas.forEach((c) => {
      if (!existentesSet.has(c.pessoa.id)) {
        initialPresencas[c.pessoa.id] = true;
      }
    });
    setPresencas(initialPresencas);
    setObservacoes({});
    setComportamentos({});
  };

  const handleSubmit = async () => {
    // Filter only children without existing attendance
    const criancasSemPresenca = criancas.filter(
      (c) => !presencasExistentes.has(c.pessoa.id)
    );

    if (criancasSemPresenca.length === 0) {
      toast({
        title: "Nenhuma presença para registrar",
        description: "Todas as crianças já têm presença registrada para esta data.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const registros = criancasSemPresenca.map((c) => ({
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

  const criancasSemPresenca = criancas.filter(
    (c) => !presencasExistentes.has(c.pessoa.id)
  );
  const presentCount = Object.values(presencas).filter(Boolean).length;
  const totalCount = criancasSemPresenca.length;

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
                {presencasExistentes.size > 0 && (
                  <span className="text-chart-1 ml-1">
                    ({presencasExistentes.size} já registradas)
                  </span>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Children with existing attendance */}
        {presencasExistentes.size > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-chart-1" />
              Presenças já registradas hoje
            </p>
            {criancas
              .filter((c) => presencasExistentes.has(c.pessoa.id))
              .map((crianca) => (
                <Card key={crianca.id} className="opacity-60">
                   <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={crianca.pessoa.photo_url || undefined} />
                          <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                            {crianca.pessoa.full_name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{crianca.pessoa.full_name}</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-chart-1/10 text-chart-1">
                        Já registrada
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Children without attendance - can register */}
        <div className="space-y-3">
          {criancasSemPresenca.length > 0 && presencasExistentes.size > 0 && (
            <p className="text-sm font-medium text-muted-foreground">
              Crianças pendentes
            </p>
          )}
          
          {criancasSemPresenca.map((crianca) => (
            <Card key={crianca.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={crianca.pessoa.photo_url || undefined} />
                      <AvatarFallback className="bg-chart-1/10 text-chart-1 text-sm">
                        {crianca.pessoa.full_name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
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

          {criancas.length > 0 && criancasSemPresenca.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-chart-1" />
              Todas as crianças já têm presença registrada para esta data
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t">
        <Button 
          onClick={handleSubmit} 
          disabled={loading || criancasSemPresenca.length === 0} 
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Salvando..." : "Salvar Presenças"}
        </Button>
      </div>
    </AppLayout>
  );
}
