-- Fix the overly permissive alertas SELECT policy
-- Users should only see alerts targeted to their role or user ID

DROP POLICY IF EXISTS "Users can view relevant alertas" ON public.alertas;

CREATE POLICY "Users can view relevant alertas"
ON public.alertas
FOR SELECT
TO authenticated
USING (
  ativo = true AND (
    -- User is directly in para_users array
    auth.uid() = ANY(para_users) OR
    -- User's role is in para_roles array
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = ANY(para_roles)
    ) OR
    -- User created the alert
    created_by = auth.uid() OR
    -- Admin/Coordinator can see all alerts
    is_admin_or_coordinator(auth.uid())
  )
);