
-- Create storage bucket for child photos
INSERT INTO storage.buckets (id, name, public) VALUES ('child-photos', 'child-photos', true);

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload child photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'child-photos' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update child photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'child-photos' AND auth.uid() IS NOT NULL);

-- Allow public read access to child photos
CREATE POLICY "Anyone can view child photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'child-photos');

-- Allow authenticated users to delete child photos
CREATE POLICY "Authenticated users can delete child photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'child-photos' AND auth.uid() IS NOT NULL);
