-- Recreate pessoas_public view with birth_date and phone included
CREATE OR REPLACE VIEW public.pessoas_public AS
SELECT 
  id,
  full_name,
  photo_url,
  is_active,
  created_at,
  updated_at,
  city,
  neighborhood,
  state,
  birth_date,
  phone
FROM public.pessoas;