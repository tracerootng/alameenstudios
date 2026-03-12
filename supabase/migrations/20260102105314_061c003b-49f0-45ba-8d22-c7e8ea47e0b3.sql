-- Make the event-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'event-photos';

-- Drop the public SELECT policy
DROP POLICY IF EXISTS "Anyone can view event photos" ON storage.objects;

-- Create policy for admins to manage all files
CREATE POLICY "Admins can manage event photos"
ON storage.objects
FOR ALL
USING (bucket_id = 'event-photos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'event-photos' AND public.has_role(auth.uid(), 'admin'));

-- Create policy for authenticated users to read photos (needed for signed URL generation)
CREATE POLICY "Authenticated users can read event photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'event-photos' AND auth.role() = 'authenticated');