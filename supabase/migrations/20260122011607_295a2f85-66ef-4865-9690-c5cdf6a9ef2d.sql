-- Fix the remaining permissive INSERT policies

-- 1. documentos: Restrict INSERT to admin/coordinator only
DROP POLICY IF EXISTS "Authenticated can upload documentos" ON public.documentos;
CREATE POLICY "Admin/Coord can upload documentos"
ON public.documentos
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_coordinator(auth.uid()));

-- 2. familias: Restrict INSERT to admin/coordinator only  
DROP POLICY IF EXISTS "Authenticated can insert familias" ON public.familias;
CREATE POLICY "Admin/Coord can insert familias"
ON public.familias
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_coordinator(auth.uid()));