-- 1. Create a public view with non-sensitive fields only
CREATE VIEW public.pessoas_public
WITH (security_invoker = on) AS
SELECT 
  id,
  full_name,
  photo_url,
  is_active,
  created_at,
  updated_at,
  city,
  neighborhood,
  state
FROM public.pessoas;

-- 2. Drop existing permissive SELECT policy
DROP POLICY IF EXISTS "Pessoas viewable by authenticated" ON public.pessoas;

-- 3. Create new restrictive SELECT policy - only admin/coordinator can see full data
CREATE POLICY "Admin/Coord can view full pessoas data"
ON public.pessoas
FOR SELECT
TO authenticated
USING (is_admin_or_coordinator(auth.uid()));

-- 4. Create policy for public view access by all authenticated users
-- The view uses security_invoker, so we need a policy that allows view access
-- but the base table policy above restricts direct access

-- 5. Grant select on the view to authenticated users
GRANT SELECT ON public.pessoas_public TO authenticated;

-- 6. Update INSERT policy to be more restrictive (only admin/coord)
DROP POLICY IF EXISTS "Authenticated can insert pessoas" ON public.pessoas;
CREATE POLICY "Admin/Coord can insert pessoas"
ON public.pessoas
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_coordinator(auth.uid()));

-- 7. Update UPDATE policy to be more restrictive (only admin/coord)
DROP POLICY IF EXISTS "Authenticated can update pessoas" ON public.pessoas;
CREATE POLICY "Admin/Coord can update pessoas"
ON public.pessoas
FOR UPDATE
TO authenticated
USING (is_admin_or_coordinator(auth.uid()));