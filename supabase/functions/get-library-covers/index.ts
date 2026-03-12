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
    const { coverPaths } = await req.json()
    
    if (!coverPaths || !Array.isArray(coverPaths)) {
      return new Response(
        JSON.stringify({ error: 'coverPaths array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Signing covers for paths:', coverPaths)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const signedUrls: Record<string, string> = {}

    for (const path of coverPaths) {
      if (!path) continue
      
      // Clean the path - remove any leading slashes
      const cleanPath = path.replace(/^\/+/, '')
      
      console.log('Signing path:', cleanPath)
      
      const { data, error } = await supabase.storage
        .from('event-photos')
        .createSignedUrl(cleanPath, 3600) // 1 hour expiry

      if (error) {
        console.error('Error signing URL for path:', cleanPath, error)
        continue
      }

      if (data?.signedUrl) {
        signedUrls[path] = data.signedUrl
        console.log('Successfully signed:', cleanPath)
      }
    }

    console.log('Returning signed URLs count:', Object.keys(signedUrls).length)

    return new Response(
      JSON.stringify({ signedUrls }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error('Error in get-library-covers:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
