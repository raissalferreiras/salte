// Tipos base do sistema

export type AppRole = 'admin' | 'coordenador' | 'voluntario' | 'psicologa';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Frente {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  is_active: boolean;
  custom_fields: CustomField[];
  created_at: string;
  updated_at: string;
}

export interface CustomField {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  label: string;
  required?: boolean;
  options?: string[];
}

export interface Pessoa {
  id: string;
  full_name: string;
  birth_date?: string;
  cpf?: string;
  phone?: string;
  phone_secondary?: string;
  email?: string;
  address?: string;
  address_number?: string;
  address_complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Familia {
  id: string;
  responsavel_id?: string;
  responsavel?: Pessoa;
  address: string;
  address_number?: string;
  address_complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  num_moradores: number;
  necessidades?: string;
  observacoes?: string;
  ultima_visita?: string;
  proxima_visita?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  frentes?: Frente[];
  membros?: Pessoa[];
}

export interface Crianca {
  id: string;
  pessoa_id: string;
  pessoa?: Pessoa;
  escola?: string;
  serie?: string;
  turno?: string;
  necessidades_especiais: boolean;
  descricao_necessidades?: string;
  alergias?: string;
  medicamentos?: string;
  responsaveis?: Pessoa[];
  created_at: string;
  updated_at: string;
}

export interface Presenca {
  id: string;
  pessoa_id: string;
  pessoa?: Pessoa;
  acao_id?: string;
  data: string;
  presente: boolean;
  comportamento?: 'excelente' | 'bom' | 'regular' | 'ruim';
  acontecimentos?: string;
  necessita_acompanhamento: boolean;
  observacoes?: string;
  registrado_por?: string;
  created_at: string;
}

export interface Visita {
  id: string;
  familia_id: string;
  familia?: Familia;
  data: string;
  visitante_id?: string;
  visitante?: Profile;
  entregou_cesta: boolean;
  cesta_itens?: string;
  situacao_encontrada?: string;
  necessidades_identificadas?: string;
  encaminhamentos?: string;
  observacoes?: string;
  proxima_visita?: string;
  fotos: string[];
  created_at: string;
}

export interface CestaBasica {
  id: string;
  familia_id: string;
  visita_id?: string;
  data_entrega: string;
  itens?: string;
  observacoes?: string;
  entregue_por?: string;
  created_at: string;
}

export interface AtendimentoPsicologico {
  id: string;
  pessoa_id: string;
  pessoa?: Pessoa;
  profissional_id: string;
  profissional?: Profile;
  data: string;
  horario_inicio?: string;
  horario_fim?: string;
  tipo: 'individual' | 'grupo';
  observacoes_iniciais?: string;
  evolucao?: string;
  proxima_sessao?: string;
  status: 'agendado' | 'realizado' | 'cancelado' | 'falta';
  created_at: string;
  updated_at: string;
}

export interface Evento {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: 'reuniao' | 'acao_social' | 'visita' | 'atendimento' | 'evento_especial' | 'outro';
  data_inicio: string;
  data_fim?: string;
  local?: string;
  endereco?: string;
  latitude?: number;
  longitude?: number;
  status: 'planejado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  created_by?: string;
  created_at: string;
  updated_at: string;
  frentes?: Frente[];
  participantes?: EventoParticipante[];
  reuniao?: Reuniao;
}

export interface EventoParticipante {
  id: string;
  evento_id: string;
  user_id?: string;
  pessoa_id?: string;
  user?: Profile;
  pessoa?: Pessoa;
  funcao?: string;
  confirmado: boolean;
  presente?: boolean;
  created_at: string;
}

export interface Reuniao {
  id: string;
  evento_id: string;
  pauta?: string;
  decisoes?: string;
  encaminhamentos?: string;
  ata?: string;
  anexos: string[];
  created_at: string;
  updated_at: string;
}

export interface Fornecedor {
  id: string;
  nome: string;
  tipo?: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  contato_nome?: string;
  contato_telefone?: string;
  observacoes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  nome: string;
  categoria?: string;
  unidade?: string;
  quantidade_estoque: number;
  fornecedor_id?: string;
  fornecedor?: Fornecedor;
  created_at: string;
  updated_at: string;
}

export interface Alerta {
  id: string;
  titulo: string;
  mensagem?: string;
  tipo: 'info' | 'warning' | 'urgent' | 'success';
  entity_type?: string;
  entity_id?: string;
  para_roles?: AppRole[];
  para_users?: string[];
  lido_por: string[];
  ativo: boolean;
  created_by?: string;
  created_at: string;
}

export interface Documento {
  id: string;
  nome: string;
  descricao?: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  entity_type?: string;
  entity_id?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// Dashboard stats
export interface DashboardStats {
  totalCriancas: number;
  totalFamilias: number;
  visitasMes: number;
  atendimentosMes: number;
  familiasSemVisita: number;
  frentesMaisAtivas: { frente: string; count: number }[];
  criancasAtendidas: { mes: string; count: number }[];
}
