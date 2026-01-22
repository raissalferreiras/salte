-- 1. Drop existing permissive SELECT policy on fornecedores
DROP POLICY IF EXISTS "Fornecedores viewable by authenticated" ON public.fornecedores;

-- 2. Create restrictive policy - only admin and coordinators can view fornecedores
CREATE POLICY "Admin/Coord can view fornecedores"
ON public.fornecedores
FOR SELECT
TO authenticated
USING (is_admin_or_coordinator(auth.uid()));