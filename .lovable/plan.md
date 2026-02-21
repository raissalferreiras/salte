

# Plano: Acesso Total para Todos os Usuarios

## Resumo
Atualizar o sistema para que todos os usuarios tenham acesso completo (equivalente ao admin), removendo todas as restricoes de permissao na interface e no banco de dados.

## Mudancas Necessarias

### 1. Banco de Dados - Atualizar roles existentes
- Alterar todos os 10 usuarios com role `voluntario` para `admin`
- Alterar a funcao `handle_new_user()` para atribuir role `admin` por padrao (em vez de `voluntario`)

### 2. Frontend - Remover restricoes visuais

**`src/contexts/AuthContext.tsx`**
- Alterar `isAdminOrCoordinator` para retornar sempre `true`
- Alterar `isPsicologa` para retornar sempre `false` (para nao restringir navegacao)

**`src/components/layout/AppSidebar.tsx`**
- Remover filtro de `isPsicologa` que esconde itens do menu

**`src/components/layout/TabBar.tsx`**
- Remover filtro de `isPsicologa` que esconde itens da barra inferior

**`src/pages/ConfiguracoesPage.tsx`**
- Remover condicional `isAdminOrCoordinator` que esconde secao admin

**`src/pages/CriancaDetalhesPage.tsx`**
- Remover condicional `isAdminOrCoordinator` que esconde botoes de editar/ativar/desativar

**`src/pages/FrentePsicologicoPage.tsx`**
- Remover verificacao de acesso `hasAccess`

**`src/pages/DashboardPage.tsx`**
- Remover condicional `isPsicologa` no QuickAction

### 3. Banco de Dados - RLS policies
As policies de RLS que usam `is_admin_or_coordinator()` continuarao funcionando corretamente pois todos os usuarios terao role `admin`.

Tabelas afetadas positivamente (acesso completo automatico):
- `familias` (INSERT/UPDATE/DELETE)
- `familia_membros`, `familia_frentes`
- `documentos` (INSERT/DELETE)
- `crianca_responsaveis`
- `cestas_basicas`
- `eventos`, `evento_participantes`, `evento_frentes`, `evento_fornecedores`
- `reunioes`
- `fornecedores`, `materiais`
- `user_roles`
- `activity_logs` (SELECT)
- `alertas`
- `profiles` (SELECT all)
- `atendimentos_psicologicos`

### Secao Tecnica

**Migracao SQL:**
```sql
-- Atualizar todos voluntarios para admin
UPDATE public.user_roles SET role = 'admin' WHERE role = 'voluntario';

-- Alterar funcao handle_new_user para dar admin por padrao
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  
  RETURN NEW;
END;
$$;
```

**AuthContext - simplificacao:**
- `isAdminOrCoordinator` passa a ser sempre `true`
- `isPsicologa` passa a ser sempre `false`

Isso garante que nenhuma verificacao no frontend bloqueie acesso a funcionalidades.

