
-- Allow any authenticated user to insert pessoas
DROP POLICY IF EXISTS "Admin/Coord can insert pessoas" ON public.pessoas;
CREATE POLICY "Authenticated can insert pessoas"
  ON public.pessoas FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow any authenticated user to update pessoas
DROP POLICY IF EXISTS "Admin/Coord can update pessoas" ON public.pessoas;
CREATE POLICY "Authenticated can update pessoas"
  ON public.pessoas FOR UPDATE
  TO authenticated
  USING (true);

-- Allow any authenticated user to manage criancas (insert/update)
DROP POLICY IF EXISTS "Admin/Coord can manage criancas" ON public.criancas;
CREATE POLICY "Admin/Coord can delete criancas"
  ON public.criancas FOR DELETE
  TO authenticated
  USING (is_admin_or_coordinator(auth.uid()));

CREATE POLICY "Authenticated can insert criancas"
  ON public.criancas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update criancas"
  ON public.criancas FOR UPDATE
  TO authenticated
  USING (true);
