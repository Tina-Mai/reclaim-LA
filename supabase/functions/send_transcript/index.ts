// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Started send_transcript function")

Deno.serve(async (req) => {
  const { call_id } = await req.json()
  
  // Call Bland AI API to get call details
  const response = await fetch(`https://api.bland.ai/v1/calls/${call_id}`, {
    headers: {
      'Authorization': Deno.env.get('BLAND_API_KEY'),
      'Content-Type': 'application/json'
    }
  })

  const callData = await response.json()
  
  // Extract transcript and email variable
  const data = {
    transcript: callData.concatenated_transcript,
    email: callData.variables?.email, // Using optional chaining in case variables is undefined
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})
