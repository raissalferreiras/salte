
-- Add is_active column to criancas for soft delete/deactivation
ALTER TABLE public.criancas 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Create index for filtering active children
CREATE INDEX IF NOT EXISTS idx_criancas_is_active ON public.criancas(is_active);
