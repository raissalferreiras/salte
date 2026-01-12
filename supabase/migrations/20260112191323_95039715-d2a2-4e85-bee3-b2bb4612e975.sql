-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'coordenador', 'voluntario', 'psicologa');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de roles de usuário (separada por segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Tabela de frentes (dinâmicas, não hardcoded)
CREATE TABLE public.frentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#10B981',
  icon TEXT DEFAULT 'Heart',
  is_active BOOLEAN DEFAULT true,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de pessoas (genérica para crianças, adultos, etc)
CREATE TABLE public.pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  birth_date DATE,
  cpf TEXT,
  phone TEXT,
  phone_secondary TEXT,
  email TEXT,
  address TEXT,
  address_number TEXT,
  address_complement TEXT,
  neighborhood TEXT,
  city TEXT DEFAULT 'São Paulo',
  state TEXT DEFAULT 'SP',
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  photo_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de famílias
CREATE TABLE public.familias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  responsavel_id UUID REFERENCES public.pessoas(id) ON DELETE SET NULL,
  address TEXT NOT NULL,
  address_number TEXT,
  address_complement TEXT,
  neighborhood TEXT DEFAULT 'Favela Ventosa',
  city TEXT DEFAULT 'São Paulo',
  state TEXT DEFAULT 'SP',
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  num_moradores INTEGER DEFAULT 1,
  necessidades TEXT,
  observacoes TEXT,
  ultima_visita DATE,
  proxima_visita DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Relacionamento pessoas-famílias
CREATE TABLE public.familia_membros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID REFERENCES public.familias(id) ON DELETE CASCADE NOT NULL,
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE NOT NULL,
  parentesco TEXT,
  is_responsavel BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (familia_id, pessoa_id)
);

-- Vínculo pessoas-frentes
CREATE TABLE public.pessoa_frentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE NOT NULL,
  frente_id UUID REFERENCES public.frentes(id) ON DELETE CASCADE NOT NULL,
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  observacoes TEXT,
  custom_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pessoa_id, frente_id)
);

-- Vínculo famílias-frentes
CREATE TABLE public.familia_frentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID REFERENCES public.familias(id) ON DELETE CASCADE NOT NULL,
  frente_id UUID REFERENCES public.frentes(id) ON DELETE CASCADE NOT NULL,
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  observacoes TEXT,
  custom_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (familia_id, frente_id)
);

-- Crianças (extensão para Sementinhas)
CREATE TABLE public.criancas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE NOT NULL UNIQUE,
  escola TEXT,
  serie TEXT,
  turno TEXT,
  necessidades_especiais BOOLEAN DEFAULT false,
  descricao_necessidades TEXT,
  alergias TEXT,
  medicamentos TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Responsáveis das crianças
CREATE TABLE public.crianca_responsaveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crianca_id UUID REFERENCES public.criancas(id) ON DELETE CASCADE NOT NULL,
  responsavel_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE NOT NULL,
  parentesco TEXT,
  is_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (crianca_id, responsavel_id)
);

-- Presenças em ações (Sementinhas)
CREATE TABLE public.presencas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE NOT NULL,
  acao_id UUID,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  presente BOOLEAN DEFAULT true,
  comportamento TEXT CHECK (comportamento IN ('excelente', 'bom', 'regular', 'ruim')),
  acontecimentos TEXT,
  necessita_acompanhamento BOOLEAN DEFAULT false,
  observacoes TEXT,
  registrado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Visitas domiciliares (Conhecendo Histórias)
CREATE TABLE public.visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID REFERENCES public.familias(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  visitante_id UUID REFERENCES auth.users(id),
  entregou_cesta BOOLEAN DEFAULT false,
  cesta_itens TEXT,
  situacao_encontrada TEXT,
  necessidades_identificadas TEXT,
  encaminhamentos TEXT,
  observacoes TEXT,
  proxima_visita DATE,
  fotos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Histórico de cestas básicas
CREATE TABLE public.cestas_basicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID REFERENCES public.familias(id) ON DELETE CASCADE NOT NULL,
  visita_id UUID REFERENCES public.visitas(id) ON DELETE SET NULL,
  data_entrega DATE NOT NULL DEFAULT CURRENT_DATE,
  itens TEXT,
  observacoes TEXT,
  entregue_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Atendimentos psicológicos
CREATE TABLE public.atendimentos_psicologicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE NOT NULL,
  profissional_id UUID REFERENCES auth.users(id) NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  horario_inicio TIME,
  horario_fim TIME,
  tipo TEXT CHECK (tipo IN ('individual', 'grupo')) DEFAULT 'individual',
  observacoes_iniciais TEXT,
  evolucao TEXT,
  proxima_sessao DATE,
  status TEXT CHECK (status IN ('agendado', 'realizado', 'cancelado', 'falta')) DEFAULT 'agendado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Eventos e ações
CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN ('reuniao', 'acao_social', 'visita', 'atendimento', 'evento_especial', 'outro')) NOT NULL,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  local TEXT,
  endereco TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status TEXT CHECK (status IN ('planejado', 'confirmado', 'em_andamento', 'concluido', 'cancelado')) DEFAULT 'planejado',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evento-frentes
CREATE TABLE public.evento_frentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE NOT NULL,
  frente_id UUID REFERENCES public.frentes(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (evento_id, frente_id)
);

-- Participantes de eventos
CREATE TABLE public.evento_participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE,
  funcao TEXT,
  confirmado BOOLEAN DEFAULT false,
  presente BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reuniões (extensão de eventos)
CREATE TABLE public.reunioes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pauta TEXT,
  decisoes TEXT,
  encaminhamentos TEXT,
  ata TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fornecedores
CREATE TABLE public.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT,
  cnpj TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  contato_nome TEXT,
  contato_telefone TEXT,
  observacoes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Materiais/recursos
CREATE TABLE public.materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT,
  unidade TEXT,
  quantidade_estoque INTEGER DEFAULT 0,
  fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evento-fornecedores
CREATE TABLE public.evento_fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE NOT NULL,
  fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE CASCADE NOT NULL,
  material_id UUID REFERENCES public.materiais(id) ON DELETE SET NULL,
  quantidade INTEGER,
  valor DECIMAL(10, 2),
  observacoes TEXT,
  UNIQUE (evento_id, fornecedor_id, material_id)
);

-- Logs de ações do sistema
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documentos e arquivos
CREATE TABLE public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  entity_type TEXT,
  entity_id UUID,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alertas
CREATE TABLE public.alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  mensagem TEXT,
  tipo TEXT CHECK (tipo IN ('info', 'warning', 'urgent', 'success')) DEFAULT 'info',
  entity_type TEXT,
  entity_id UUID,
  para_roles app_role[],
  para_users UUID[],
  lido_por JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dados offline pendentes de sync
CREATE TABLE public.offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  data JSONB NOT NULL,
  synced BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Função para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para obter roles do usuário
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(role), ARRAY[]::app_role[])
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- Função para verificar se é admin ou coordenador
CREATE OR REPLACE FUNCTION public.is_admin_or_coordinator(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'coordenador')
  )
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers de updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_frentes_updated_at BEFORE UPDATE ON public.frentes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pessoas_updated_at BEFORE UPDATE ON public.pessoas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_familias_updated_at BEFORE UPDATE ON public.familias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pessoa_frentes_updated_at BEFORE UPDATE ON public.pessoa_frentes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_familia_frentes_updated_at BEFORE UPDATE ON public.familia_frentes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_criancas_updated_at BEFORE UPDATE ON public.criancas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_atendimentos_updated_at BEFORE UPDATE ON public.atendimentos_psicologicos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON public.eventos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reunioes_updated_at BEFORE UPDATE ON public.reunioes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON public.fornecedores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_materiais_updated_at BEFORE UPDATE ON public.materiais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  
  -- Primeiro usuário vira admin automaticamente
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'voluntario');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir frentes padrão
INSERT INTO public.frentes (name, description, color, icon) VALUES
  ('Sementinhas', 'Trabalho com crianças e adolescentes', '#10B981', 'Baby'),
  ('Conhecendo Histórias', 'Visitas domiciliares e acompanhamento de famílias', '#3B82F6', 'Home'),
  ('Atendimento Psicológico', 'Suporte psicológico individual e em grupo', '#8B5CF6', 'Brain');

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familia_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoa_frentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familia_frentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crianca_responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cestas_basicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos_psicologicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento_frentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reunioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento_fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: usuários veem todos, editam o próprio
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User roles: apenas admin pode modificar
CREATE POLICY "Roles viewable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Frentes: todos autenticados podem ver, admin/coordenador podem gerenciar
CREATE POLICY "Frentes viewable by authenticated" ON public.frentes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/Coord can manage frentes" ON public.frentes FOR ALL TO authenticated USING (public.is_admin_or_coordinator(auth.uid()));

-- Pessoas: todos autenticados podem ver e gerenciar
CREATE POLICY "Pessoas viewable by authenticated" ON public.pessoas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert pessoas" ON public.pessoas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update pessoas" ON public.pessoas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin/Coord can delete pessoas" ON public.pessoas FOR DELETE TO authenticated USING (public.is_admin_or_coordinator(auth.uid()));

-- Famílias: mesma lógica de pessoas
CREATE POLICY "Familias viewable by authenticated" ON public.familias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert familias" ON public.familias FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update familias" ON public.familias FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin/Coord can delete familias" ON public.familias FOR DELETE TO authenticated USING (public.is_admin_or_coordinator(auth.uid()));

-- Família membros
CREATE POLICY "Familia membros viewable by authenticated" ON public.familia_membros FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage familia membros" ON public.familia_membros FOR ALL TO authenticated USING (true);

-- Pessoa frentes
CREATE POLICY "Pessoa frentes viewable by authenticated" ON public.pessoa_frentes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage pessoa frentes" ON public.pessoa_frentes FOR ALL TO authenticated USING (true);

-- Família frentes
CREATE POLICY "Familia frentes viewable by authenticated" ON public.familia_frentes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage familia frentes" ON public.familia_frentes FOR ALL TO authenticated USING (true);

-- Crianças
CREATE POLICY "Criancas viewable by authenticated" ON public.criancas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage criancas" ON public.criancas FOR ALL TO authenticated USING (true);

-- Criança responsáveis
CREATE POLICY "Crianca responsaveis viewable by authenticated" ON public.crianca_responsaveis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage crianca responsaveis" ON public.crianca_responsaveis FOR ALL TO authenticated USING (true);

-- Presenças
CREATE POLICY "Presencas viewable by authenticated" ON public.presencas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert presencas" ON public.presencas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update presencas" ON public.presencas FOR UPDATE TO authenticated USING (true);

-- Visitas
CREATE POLICY "Visitas viewable by authenticated" ON public.visitas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage visitas" ON public.visitas FOR ALL TO authenticated USING (true);

-- Cestas básicas
CREATE POLICY "Cestas viewable by authenticated" ON public.cestas_basicas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage cestas" ON public.cestas_basicas FOR ALL TO authenticated USING (true);

-- Atendimentos psicológicos: apenas psicólogos e admins
CREATE POLICY "Psicologos can view own atendimentos" ON public.atendimentos_psicologicos FOR SELECT TO authenticated 
  USING (
    public.has_role(auth.uid(), 'psicologa') AND profissional_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Psicologos can manage own atendimentos" ON public.atendimentos_psicologicos FOR ALL TO authenticated 
  USING (
    (public.has_role(auth.uid(), 'psicologa') AND profissional_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Eventos
CREATE POLICY "Eventos viewable by authenticated" ON public.eventos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage eventos" ON public.eventos FOR ALL TO authenticated USING (true);

-- Evento frentes
CREATE POLICY "Evento frentes viewable by authenticated" ON public.evento_frentes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage evento frentes" ON public.evento_frentes FOR ALL TO authenticated USING (true);

-- Evento participantes
CREATE POLICY "Evento participantes viewable by authenticated" ON public.evento_participantes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage evento participantes" ON public.evento_participantes FOR ALL TO authenticated USING (true);

-- Reuniões
CREATE POLICY "Reunioes viewable by authenticated" ON public.reunioes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/Coord can manage reunioes" ON public.reunioes FOR ALL TO authenticated USING (public.is_admin_or_coordinator(auth.uid()));

-- Fornecedores
CREATE POLICY "Fornecedores viewable by authenticated" ON public.fornecedores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/Coord can manage fornecedores" ON public.fornecedores FOR ALL TO authenticated USING (public.is_admin_or_coordinator(auth.uid()));

-- Materiais
CREATE POLICY "Materiais viewable by authenticated" ON public.materiais FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/Coord can manage materiais" ON public.materiais FOR ALL TO authenticated USING (public.is_admin_or_coordinator(auth.uid()));

-- Evento fornecedores
CREATE POLICY "Evento fornecedores viewable by authenticated" ON public.evento_fornecedores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/Coord can manage evento fornecedores" ON public.evento_fornecedores FOR ALL TO authenticated USING (public.is_admin_or_coordinator(auth.uid()));

-- Activity logs: apenas admin pode ver
CREATE POLICY "Admins can view logs" ON public.activity_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Documentos
CREATE POLICY "Documentos viewable by authenticated" ON public.documentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can upload documentos" ON public.documentos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin/Coord can delete documentos" ON public.documentos FOR DELETE TO authenticated USING (public.is_admin_or_coordinator(auth.uid()));

-- Alertas
CREATE POLICY "Users can view relevant alertas" ON public.alertas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/Coord can manage alertas" ON public.alertas FOR ALL TO authenticated USING (public.is_admin_or_coordinator(auth.uid()));

-- Offline sync queue: usuário só vê/gerencia os próprios
CREATE POLICY "Users can manage own sync queue" ON public.offline_sync_queue FOR ALL TO authenticated USING (auth.uid() = user_id);