import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { eventId, accessCode } = await req.json()
    
    if (!eventId || !accessCode) {
      return new Response(
        JSON.stringify({ error: 'eventId and accessCode are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Unlocking gallery for event:', eventId)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify access code and get photos using the RPC function
    const { data: photos, error: rpcError } = await supabase.rpc('verify_event_access', {
      event_id_input: eventId,
      access_code_input: accessCode
    })

    if (rpcError) {
      console.error('RPC error:', rpcError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify access' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!photos || photos.length === 0) {
      console.log('Invalid access code or no photos found')
      return new Response(
        JSON.stringify({ error: 'Invalid access code', photos: [] }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Found photos:', photos.length)

    // Sign URLs for all photos
    const signedPhotos = await Promise.all(
      photos.map(async (photo: any) => {
        const result: any = {
          id: photo.id,
          caption: photo.caption,
          sort_order: photo.sort_order,
        }

        // Sign photo_url
        if (photo.photo_url) {
          const cleanPhotoPath = photo.photo_url.replace(/^\/+/, '')
          const { data: photoData } = await supabase.storage
            .from('event-photos')
            .createSignedUrl(cleanPhotoPath, 3600)
          
          result.photo_url = photo.photo_url
          result.signed_photo_url = photoData?.signedUrl || null
        }

        // Sign thumbnail_url if exists
        if (photo.thumbnail_url) {
          const cleanThumbPath = photo.thumbnail_url.replace(/^\/+/, '')
          const { data: thumbData } = await supabase.storage
            .from('event-photos')
            .createSignedUrl(cleanThumbPath, 3600)
          
          result.thumbnail_url = photo.thumbnail_url
          result.signed_thumbnail_url = thumbData?.signedUrl || null
        }

        return result
      })
    )

    console.log('Returning signed photos:', signedPhotos.length)

    return new Response(
      JSON.stringify({ photos: signedPhotos }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error('Error in unlock-event-gallery:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
