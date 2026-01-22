-- 1. Fix the update_updated_at_column function to have a fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Fix activity_logs INSERT policy - restrict to service role or trusted functions only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can insert logs" ON public.activity_logs;

-- Create a more restrictive INSERT policy using SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.insert_activity_log(
  p_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid DEFAULT NULL,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL,
  p_ip_address text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Only allow authenticated users to insert their own logs
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot insert log for another user';
  END IF;
  
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, old_data, new_data, ip_address)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_old_data, p_new_data, p_ip_address)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Create restrictive INSERT policy - only via the function
CREATE POLICY "Insert logs via function only"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (false);

-- 3. Fix overly permissive UPDATE policies on various tables
-- cestas_basicas: Restrict to admin/coordinator
DROP POLICY IF EXISTS "Authenticated can manage cestas" ON public.cestas_basicas;
CREATE POLICY "Admin/Coord can manage cestas"
ON public.cestas_basicas
FOR ALL
TO authenticated
USING (is_admin_or_coordinator(auth.uid()));

-- crianca_responsaveis: Restrict to admin/coordinator
DROP POLICY IF EXISTS "Authenticated can manage crianca responsaveis" ON public.crianca_responsaveis;
CREATE POLICY "Admin/Coord can manage crianca_responsaveis"
ON public.crianca_responsaveis
FOR ALL
TO authenticated
USING (is_admin_or_coordinator(auth.uid()));

-- criancas: Restrict to admin/coordinator
DROP POLICY IF EXISTS "Authenticated can manage criancas" ON public.criancas;
CREATE POLICY "Admin/Coord can manage criancas"
ON public.criancas
FOR ALL
TO authenticated
USING (is_admin_or_coordinator(auth.uid()));

-- evento_frentes: Restrict to admin/coordinator
DROP POLICY IF EXISTS "Authenticated can manage evento frentes" ON public.evento_frentes;
CREATE POLICY "Admin/Coord can manage evento_frentes"
ON public.evento_frentes
FOR ALL
TO authenticated
USING (is_admin_or_coordinator(auth.uid()));

-- evento_participantes: Restrict management to admin/coordinator, but allow users to manage their own participation
DROP POLICY IF EXISTS "Authenticated can manage evento participantes" ON public.evento_participantes;
CREATE POLICY "Admin/Coord can manage evento_participantes"
ON public.evento_participantes
FOR ALL
TO authenticated
USING (is_admin_or_coordinator(auth.uid()) OR user_id = auth.uid());

-- eventos: Restrict to admin/coordinator or event creator
DROP POLICY IF EXISTS "Authenticated can manage eventos" ON public.eventos;
CREATE POLICY "Admin/Coord/Creator can manage eventos"
ON public.eventos
FOR ALL
TO authenticated
USING (is_admin_or_coordinator(auth.uid()) OR created_by = auth.uid());

-- familia_frentes: Restrict to admin/coordinator
DROP POLICY IF EXISTS "Authenticated can manage familia frentes" ON public.familia_frentes;
CREATE POLICY "Admin/Coord can manage familia_frentes"
ON public.familia_frentes
FOR ALL
TO authenticated
USING (is_admin_or_coordinator(auth.uid()));

-- familia_membros: Restrict to admin/coordinator
DROP POLICY IF EXISTS "Authenticated can manage familia membros" ON public.familia_membros;
CREATE POLICY "Admin/Coord can manage familia_membros"
ON public.familia_membros
FOR ALL
TO authenticated
USING (is_admin_or_coordinator(auth.uid()));

-- pessoa_frentes: Restrict to admin/coordinator
DROP POLICY IF EXISTS "Authenticated can manage pessoa frentes" ON public.pessoa_frentes;
CREATE POLICY "Admin/Coord can manage pessoa_frentes"
ON public.pessoa_frentes
FOR ALL
TO authenticated
USING (is_admin_or_coordinator(auth.uid()));

-- visitas: Restrict to admin/coordinator or the visitor
DROP POLICY IF EXISTS "Authenticated can manage visitas" ON public.visitas;
CREATE POLICY "Admin/Coord/Visitor can manage visitas"
ON public.visitas
FOR ALL
TO authenticated
USING (is_admin_or_coordinator(auth.uid()) OR visitante_id = auth.uid());

-- familias: Fix the update policy to be more restrictive
DROP POLICY IF EXISTS "Authenticated can update familias" ON public.familias;
CREATE POLICY "Admin/Coord can update familias"
ON public.familias
FOR UPDATE
TO authenticated
USING (is_admin_or_coordinator(auth.uid()));

-- presencas: Fix to restrict who can insert/update
DROP POLICY IF EXISTS "Authenticated can insert presencas" ON public.presencas;
DROP POLICY IF EXISTS "Authenticated can update presencas" ON public.presencas;

CREATE POLICY "Admin/Coord/Registrant can insert presencas"
ON public.presencas
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_coordinator(auth.uid()) OR registrado_por = auth.uid());

CREATE POLICY "Admin/Coord/Registrant can update presencas"
ON public.presencas
FOR UPDATE
TO authenticated
USING (is_admin_or_coordinator(auth.uid()) OR registrado_por = auth.uid());

-- 4. Restrict evento_participantes SELECT to relevant users only (privacy fix)
DROP POLICY IF EXISTS "Evento participantes viewable by authenticated" ON public.evento_participantes;
CREATE POLICY "Evento participantes viewable by authorized"
ON public.evento_participantes
FOR SELECT
TO authenticated
USING (
  is_admin_or_coordinator(auth.uid()) 
  OR user_id = auth.uid()
  OR pessoa_id IN (SELECT id FROM pessoas WHERE is_active = true)
);