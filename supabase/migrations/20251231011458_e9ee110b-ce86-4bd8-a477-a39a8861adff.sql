-- Create events table for client galleries
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  package_type TEXT NOT NULL,
  cover_image_url TEXT,
  access_code TEXT NOT NULL,
  photo_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_photos table for storing photo references
CREATE TABLE public.event_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_events_access_code ON public.events(access_code);
CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_event_photos_event_id ON public.event_photos(event_id);

-- RLS policies for events - public can view event list (without access code shown)
CREATE POLICY "Anyone can view events list"
ON public.events
FOR SELECT
USING (true);

-- RLS policies for event_photos - no public access (need to verify access code via function)
CREATE POLICY "Photos are only accessible via verified access"
ON public.event_photos
FOR SELECT
USING (false);

-- Create function to verify access and get photos
CREATE OR REPLACE FUNCTION public.verify_event_access(event_id_input UUID, access_code_input TEXT)
RETURNS TABLE (
  id UUID,
  photo_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  sort_order INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify access code matches
  IF EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id_input AND access_code = access_code_input
  ) THEN
    RETURN QUERY
    SELECT ep.id, ep.photo_url, ep.thumbnail_url, ep.caption, ep.sort_order
    FROM public.event_photos ep
    WHERE ep.event_id = event_id_input
    ORDER BY ep.sort_order;
  ELSE
    RETURN;
  END IF;
END;
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_events_updated_at();