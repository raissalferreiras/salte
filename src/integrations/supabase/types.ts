export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      alertas: {
        Row: {
          ativo: boolean | null
          created_at: string
          created_by: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          lido_por: Json | null
          mensagem: string | null
          para_roles: Database["public"]["Enums"]["app_role"][] | null
          para_users: string[] | null
          tipo: string | null
          titulo: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          lido_por?: Json | null
          mensagem?: string | null
          para_roles?: Database["public"]["Enums"]["app_role"][] | null
          para_users?: string[] | null
          tipo?: string | null
          titulo: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          lido_por?: Json | null
          mensagem?: string | null
          para_roles?: Database["public"]["Enums"]["app_role"][] | null
          para_users?: string[] | null
          tipo?: string | null
          titulo?: string
        }
        Relationships: []
      }
      atendimentos_psicologicos: {
        Row: {
          created_at: string
          data: string
          evolucao: string | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          observacoes_iniciais: string | null
          pessoa_id: string
          profissional_id: string
          proxima_sessao: string | null
          status: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: string
          evolucao?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          observacoes_iniciais?: string | null
          pessoa_id: string
          profissional_id: string
          proxima_sessao?: string | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          evolucao?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          observacoes_iniciais?: string | null
          pessoa_id?: string
          profissional_id?: string
          proxima_sessao?: string | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atendimentos_psicologicos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimentos_psicologicos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_public"
            referencedColumns: ["id"]
          },
        ]
      }
      cestas_basicas: {
        Row: {
          created_at: string
          data_entrega: string
          entregue_por: string | null
          familia_id: string
          id: string
          itens: string | null
          observacoes: string | null
          visita_id: string | null
        }
        Insert: {
          created_at?: string
          data_entrega?: string
          entregue_por?: string | null
          familia_id: string
          id?: string
          itens?: string | null
          observacoes?: string | null
          visita_id?: string | null
        }
        Update: {
          created_at?: string
          data_entrega?: string
          entregue_por?: string | null
          familia_id?: string
          id?: string
          itens?: string | null
          observacoes?: string | null
          visita_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cestas_basicas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cestas_basicas_visita_id_fkey"
            columns: ["visita_id"]
            isOneToOne: false
            referencedRelation: "visitas"
            referencedColumns: ["id"]
          },
        ]
      }
      crianca_responsaveis: {
        Row: {
          created_at: string
          crianca_id: string
          id: string
          is_principal: boolean | null
          parentesco: string | null
          responsavel_id: string
        }
        Insert: {
          created_at?: string
          crianca_id: string
          id?: string
          is_principal?: boolean | null
          parentesco?: string | null
          responsavel_id: string
        }
        Update: {
          created_at?: string
          crianca_id?: string
          id?: string
          is_principal?: boolean | null
          parentesco?: string | null
          responsavel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crianca_responsaveis_crianca_id_fkey"
            columns: ["crianca_id"]
            isOneToOne: false
            referencedRelation: "criancas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crianca_responsaveis_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crianca_responsaveis_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas_public"
            referencedColumns: ["id"]
          },
        ]
      }
      criancas: {
        Row: {
          alergias: string | null
          created_at: string
          descricao_necessidades: string | null
          escola: string | null
          id: string
          is_active: boolean
          medicamentos: string | null
          necessidades_especiais: boolean | null
          pessoa_id: string
          serie: string | null
          turno: string | null
          updated_at: string
        }
        Insert: {
          alergias?: string | null
          created_at?: string
          descricao_necessidades?: string | null
          escola?: string | null
          id?: string
          is_active?: boolean
          medicamentos?: string | null
          necessidades_especiais?: boolean | null
          pessoa_id: string
          serie?: string | null
          turno?: string | null
          updated_at?: string
        }
        Update: {
          alergias?: string | null
          created_at?: string
          descricao_necessidades?: string | null
          escola?: string | null
          id?: string
          is_active?: boolean
          medicamentos?: string | null
          necessidades_especiais?: boolean | null
          pessoa_id?: string
          serie?: string | null
          turno?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "criancas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "criancas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "pessoas_public"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          created_at: string
          descricao: string | null
          entity_id: string | null
          entity_type: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          nome: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          nome: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          nome?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      evento_fornecedores: {
        Row: {
          evento_id: string
          fornecedor_id: string
          id: string
          material_id: string | null
          observacoes: string | null
          quantidade: number | null
          valor: number | null
        }
        Insert: {
          evento_id: string
          fornecedor_id: string
          id?: string
          material_id?: string | null
          observacoes?: string | null
          quantidade?: number | null
          valor?: number | null
        }
        Update: {
          evento_id?: string
          fornecedor_id?: string
          id?: string
          material_id?: string | null
          observacoes?: string | null
          quantidade?: number | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evento_fornecedores_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_fornecedores_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_frentes: {
        Row: {
          evento_id: string
          frente_id: string
          id: string
        }
        Insert: {
          evento_id: string
          frente_id: string
          id?: string
        }
        Update: {
          evento_id?: string
          frente_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evento_frentes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_frentes_frente_id_fkey"
            columns: ["frente_id"]
            isOneToOne: false
            referencedRelation: "frentes"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_participantes: {
        Row: {
          confirmado: boolean | null
          created_at: string
          evento_id: string
          funcao: string | null
          id: string
          pessoa_id: string | null
          presente: boolean | null
          user_id: string | null
        }
        Insert: {
          confirmado?: boolean | null
          created_at?: string
          evento_id: string
          funcao?: string | null
          id?: string
          pessoa_id?: string | null
          presente?: boolean | null
          user_id?: string | null
        }
        Update: {
          confirmado?: boolean | null
          created_at?: string
          evento_id?: string
          funcao?: string | null
          id?: string
          pessoa_id?: string | null
          presente?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evento_participantes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_participantes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_participantes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_public"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          endereco: string | null
          id: string
          latitude: number | null
          local: string | null
          longitude: number | null
          status: string | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          endereco?: string | null
          id?: string
          latitude?: number | null
          local?: string | null
          longitude?: number | null
          status?: string | null
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          endereco?: string | null
          id?: string
          latitude?: number | null
          local?: string | null
          longitude?: number | null
          status?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      familia_frentes: {
        Row: {
          created_at: string
          custom_data: Json | null
          data_fim: string | null
          data_inicio: string | null
          familia_id: string
          frente_id: string
          id: string
          is_active: boolean | null
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_data?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          familia_id: string
          frente_id: string
          id?: string
          is_active?: boolean | null
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_data?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          familia_id?: string
          frente_id?: string
          id?: string
          is_active?: boolean | null
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "familia_frentes_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "familia_frentes_frente_id_fkey"
            columns: ["frente_id"]
            isOneToOne: false
            referencedRelation: "frentes"
            referencedColumns: ["id"]
          },
        ]
      }
      familia_membros: {
        Row: {
          created_at: string
          familia_id: string
          id: string
          is_responsavel: boolean | null
          parentesco: string | null
          pessoa_id: string
        }
        Insert: {
          created_at?: string
          familia_id: string
          id?: string
          is_responsavel?: boolean | null
          parentesco?: string | null
          pessoa_id: string
        }
        Update: {
          created_at?: string
          familia_id?: string
          id?: string
          is_responsavel?: boolean | null
          parentesco?: string | null
          pessoa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "familia_membros_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "familia_membros_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "familia_membros_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_public"
            referencedColumns: ["id"]
          },
        ]
      }
      familias: {
        Row: {
          address: string
          address_complement: string | null
          address_number: string | null
          city: string | null
          created_at: string
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          necessidades: string | null
          neighborhood: string | null
          num_moradores: number | null
          observacoes: string | null
          proxima_visita: string | null
          responsavel_id: string | null
          state: string | null
          ultima_visita: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address: string
          address_complement?: string | null
          address_number?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          necessidades?: string | null
          neighborhood?: string | null
          num_moradores?: number | null
          observacoes?: string | null
          proxima_visita?: string | null
          responsavel_id?: string | null
          state?: string | null
          ultima_visita?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string
          address_complement?: string | null
          address_number?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          necessidades?: string | null
          neighborhood?: string | null
          num_moradores?: number | null
          observacoes?: string | null
          proxima_visita?: string | null
          responsavel_id?: string | null
          state?: string | null
          ultima_visita?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "familias_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "familias_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas_public"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          cnpj: string | null
          contato_nome: string | null
          contato_telefone: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          is_active: boolean | null
          nome: string
          observacoes: string | null
          telefone: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          contato_nome?: string | null
          contato_telefone?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          is_active?: boolean | null
          nome: string
          observacoes?: string | null
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          contato_nome?: string | null
          contato_telefone?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          is_active?: boolean | null
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      frentes: {
        Row: {
          color: string | null
          created_at: string
          custom_fields: Json | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      materiais: {
        Row: {
          categoria: string | null
          created_at: string
          fornecedor_id: string | null
          id: string
          nome: string
          quantidade_estoque: number | null
          unidade: string | null
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          fornecedor_id?: string | null
          id?: string
          nome: string
          quantidade_estoque?: number | null
          unidade?: string | null
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          fornecedor_id?: string | null
          id?: string
          nome?: string
          quantidade_estoque?: number | null
          unidade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiais_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_sync_queue: {
        Row: {
          action: string
          created_at: string
          data: Json
          entity_id: string | null
          entity_type: string
          id: string
          synced: boolean | null
          synced_at: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          data: Json
          entity_id?: string | null
          entity_type: string
          id?: string
          synced?: boolean | null
          synced_at?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          data?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
          synced?: boolean | null
          synced_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pessoa_frentes: {
        Row: {
          created_at: string
          custom_data: Json | null
          data_fim: string | null
          data_inicio: string | null
          frente_id: string
          id: string
          is_active: boolean | null
          observacoes: string | null
          pessoa_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_data?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          frente_id: string
          id?: string
          is_active?: boolean | null
          observacoes?: string | null
          pessoa_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_data?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          frente_id?: string
          id?: string
          is_active?: boolean | null
          observacoes?: string | null
          pessoa_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pessoa_frentes_frente_id_fkey"
            columns: ["frente_id"]
            isOneToOne: false
            referencedRelation: "frentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoa_frentes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoa_frentes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_public"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas: {
        Row: {
          address: string | null
          address_complement: string | null
          address_number: string | null
          birth_date: string | null
          city: string | null
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          notes: string | null
          phone: string | null
          phone_secondary: string | null
          photo_url: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          birth_date?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          notes?: string | null
          phone?: string | null
          phone_secondary?: string | null
          photo_url?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          birth_date?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          notes?: string | null
          phone?: string | null
          phone_secondary?: string | null
          photo_url?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      presencas: {
        Row: {
          acao_id: string | null
          acontecimentos: string | null
          comportamento: string | null
          created_at: string
          data: string
          id: string
          necessita_acompanhamento: boolean | null
          observacoes: string | null
          pessoa_id: string
          presente: boolean | null
          registrado_por: string | null
        }
        Insert: {
          acao_id?: string | null
          acontecimentos?: string | null
          comportamento?: string | null
          created_at?: string
          data?: string
          id?: string
          necessita_acompanhamento?: boolean | null
          observacoes?: string | null
          pessoa_id: string
          presente?: boolean | null
          registrado_por?: string | null
        }
        Update: {
          acao_id?: string | null
          acontecimentos?: string | null
          comportamento?: string | null
          created_at?: string
          data?: string
          id?: string
          necessita_acompanhamento?: boolean | null
          observacoes?: string | null
          pessoa_id?: string
          presente?: boolean | null
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presencas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reunioes: {
        Row: {
          anexos: Json | null
          ata: string | null
          created_at: string
          decisoes: string | null
          encaminhamentos: string | null
          evento_id: string
          id: string
          pauta: string | null
          updated_at: string
        }
        Insert: {
          anexos?: Json | null
          ata?: string | null
          created_at?: string
          decisoes?: string | null
          encaminhamentos?: string | null
          evento_id: string
          id?: string
          pauta?: string | null
          updated_at?: string
        }
        Update: {
          anexos?: Json | null
          ata?: string | null
          created_at?: string
          decisoes?: string | null
          encaminhamentos?: string | null
          evento_id?: string
          id?: string
          pauta?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reunioes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: true
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitas: {
        Row: {
          cesta_itens: string | null
          created_at: string
          data: string
          encaminhamentos: string | null
          entregou_cesta: boolean | null
          familia_id: string
          fotos: Json | null
          id: string
          necessidades_identificadas: string | null
          observacoes: string | null
          proxima_visita: string | null
          situacao_encontrada: string | null
          visitante_id: string | null
        }
        Insert: {
          cesta_itens?: string | null
          created_at?: string
          data?: string
          encaminhamentos?: string | null
          entregou_cesta?: boolean | null
          familia_id: string
          fotos?: Json | null
          id?: string
          necessidades_identificadas?: string | null
          observacoes?: string | null
          proxima_visita?: string | null
          situacao_encontrada?: string | null
          visitante_id?: string | null
        }
        Update: {
          cesta_itens?: string | null
          created_at?: string
          data?: string
          encaminhamentos?: string | null
          entregou_cesta?: boolean | null
          familia_id?: string
          fotos?: Json | null
          id?: string
          necessidades_identificadas?: string | null
          observacoes?: string | null
          proxima_visita?: string | null
          situacao_encontrada?: string | null
          visitante_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      pessoas_public: {
        Row: {
          birth_date: string | null
          city: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          is_active: boolean | null
          neighborhood: string | null
          phone: string | null
          photo_url: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          neighborhood?: string | null
          phone?: string | null
          photo_url?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          neighborhood?: string | null
          phone?: string | null
          photo_url?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_activity_log: {
        Args: {
          p_action: string
          p_entity_id?: string
          p_entity_type: string
          p_ip_address?: string
          p_new_data?: Json
          p_old_data?: Json
          p_user_id: string
        }
        Returns: string
      }
      is_admin_or_coordinator: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "coordenador" | "voluntario" | "psicologa"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "coordenador", "voluntario", "psicologa"],
    },
  },
} as const
