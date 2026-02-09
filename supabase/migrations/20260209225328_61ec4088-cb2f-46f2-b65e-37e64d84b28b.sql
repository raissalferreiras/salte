
-- 1. activity_logs: Admin/Coord can view
DROP POLICY IF EXISTS "Admins can view logs" ON public.activity_logs;
CREATE POLICY "Admin/Coord can view logs"
ON public.activity_logs FOR SELECT TO authenticated
USING (is_admin_or_coordinator(auth.uid()));

-- 2. atendimentos_psicologicos: Admin/Coord have full access, psicologa own records
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

-- 3. user_roles: Admin/Coord can manage
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admin/Coord can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (is_admin_or_coordinator(auth.uid()));

-- 4. profiles: Admin/Coord can view all
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admin/Coord can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (is_admin_or_coordinator(auth.uid()));
