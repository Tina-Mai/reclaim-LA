// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Started send_transcript function")

Deno.serve(async (req) => {
  const { call_id } = await req.json()
  
  // Call Bland AI API to get call details
  const apiKey = Deno.env.get('BLAND_API_KEY');
  if (!apiKey) throw new Error('BLAND_API_KEY is not set');

  const response = await fetch(`https://api.bland.ai/v1/calls/${call_id}`, {
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json'
    }
  })

  const callData = await response.json()
  
  // Extract transcript and email variable
  const data = {
    prompt: callData.concatenated_transcript,
    email: callData.variables?.email,
  }

  // Call extract_items endpoint
  const extractResponse = await fetch('https://wlbgwlnszsnuhfmjgsxj.supabase.co/functions/v1/extract_items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const extractedData = await extractResponse.json()

  return new Response(
    JSON.stringify(extractedData),
    { headers: { "Content-Type": "application/json" } },
  )
})
