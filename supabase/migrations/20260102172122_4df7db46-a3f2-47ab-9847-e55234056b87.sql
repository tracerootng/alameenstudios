-- Add admin policies for event_photos table to allow photo management

-- Allow admins to insert photos
CREATE POLICY "Admins can insert photos"
ON public.event_photos
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update photos
CREATE POLICY "Admins can update photos"
ON public.event_photos
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete photos
CREATE POLICY "Admins can delete photos"
ON public.event_photos
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all photos
CREATE POLICY "Admins can view all photos"
ON public.event_photos
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));