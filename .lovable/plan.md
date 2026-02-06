
# Plano: Unificar Políticas de Acesso Administrativo no Banco de Dados

## Visão Geral

Atualmente existem **inconsistências** nas políticas RLS do banco de dados. Algumas tabelas permitem acesso apenas para `admin`, enquanto outras usam `is_admin_or_coordinator()` que inclui tanto `admin` quanto `coordenador`.

## Problema Identificado

| Tabela | Política Atual | Problema |
|--------|----------------|----------|
| `activity_logs` | `has_role('admin')` | Coordenador não vê logs |
| `atendimentos_psicologicos` | `has_role('admin')` | Coordenador não acessa atendimentos |
| `user_roles` | `has_role('admin')` | Coordenador não gerencia roles |
| `profiles` | `has_role('admin')` | Coordenador não vê perfis de outros |

## Solução Proposta

Atualizar todas as políticas para usar `is_admin_or_coordinator(auth.uid())` de forma consistente, garantindo que **tanto admin quanto coordenador** tenham os mesmos privilégios administrativos em todo o sistema.

## Mudanças no Banco de Dados

### 1. Tabela `activity_logs`
```sql
-- Atualizar policy de SELECT
DROP POLICY IF EXISTS "Admins can view logs" ON public.activity_logs;
CREATE POLICY "Admin/Coord can view logs"
ON public.activity_logs FOR SELECT TO authenticated
USING (is_admin_or_coordinator(auth.uid()));
```

### 2. Tabela `atendimentos_psicologicos`
```sql
-- Atualizar policy ALL e SELECT para incluir coordenador
DROP POLICY IF EXISTS "Psicologos can manage own atendimentos" ON public.atendimentos_psicologicos;
DROP POLICY IF EXISTS "Psicologos can view own atendimentos" ON public.atendimentos_psicologicos;

CREATE POLICY "Admin/Coord/Psicologa can manage atendimentos"
ON public.atendimentos_psicologicos FOR ALL TO authenticated
USING (
  is_admin_or_coordinator(auth.uid()) OR 
  (has_role(auth.uid(), 'psicologa') AND profissional_id = auth.uid())
);

CREATE POLICY "Admin/Coord/Psicologa can view atendimentos"
ON public.atendimentos_psicologicos FOR SELECT TO authenticated
USING (
  is_admin_or_coordinator(auth.uid()) OR 
  (has_role(auth.uid(), 'psicologa') AND profissional_id = auth.uid())
);
```

### 3. Tabela `user_roles`
```sql
-- Atualizar policy de gerenciamento de roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admin/Coord can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (is_admin_or_coordinator(auth.uid()));
```

### 4. Tabela `profiles`
```sql
-- Atualizar policy de visualização
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admin/Coord can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (is_admin_or_coordinator(auth.uid()));
```

## Resumo das Mudanças

```text
+---------------------------+--------------------------------+--------------------------------+
|         Tabela            |        Política Atual          |        Nova Política           |
+---------------------------+--------------------------------+--------------------------------+
| activity_logs (SELECT)    | has_role('admin')              | is_admin_or_coordinator()      |
| atendimentos (ALL/SELECT) | has_role('admin') OR psicologa | is_admin_or_coord OR psicologa |
| user_roles (ALL)          | has_role('admin')              | is_admin_or_coordinator()      |
| profiles (SELECT)         | has_role('admin')              | is_admin_or_coordinator()      |
+---------------------------+--------------------------------+--------------------------------+
```

## Resultado Esperado

Após a migração:
- **Admin e Coordenador** terão acesso idêntico a todas as funcionalidades administrativas
- **Psicólogas** continuam com acesso apenas aos próprios atendimentos
- **Voluntários** mantêm acesso de leitura a dados não sensíveis
- O sistema ficará com padrão de acesso **unificado e consistente**

## Arquivos Afetados

- Nova migração SQL em `supabase/migrations/`
- Nenhuma alteração no código frontend (já usa `isAdminOrCoordinator`)
