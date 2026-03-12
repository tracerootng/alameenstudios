-- Fix the verify_event_access function to use proper column prefixes
CREATE OR REPLACE FUNCTION public.verify_event_access(event_id_input uuid, access_code_input text)
 RETURNS TABLE(id uuid, photo_url text, thumbnail_url text, caption text, sort_order integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify access code matches
  IF EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id_input AND e.access_code = access_code_input
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
$function$;