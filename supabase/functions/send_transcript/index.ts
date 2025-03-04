// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Started send_transcript function")

Deno.serve(async (req) => {
  try {
    const { call_id } = await req.json()
    
    // Get phone number from URL parameters
    const url = new URL(req.url)
    const phone_number = url.searchParams.get('phone_number')
    if (!phone_number) {
      throw new Error('Phone number is required')
    }
    
    // Call Bland AI API to get call details
    const apiKey = Deno.env.get('BLAND_API_KEY');
    if (!apiKey) throw new Error('BLAND_API_KEY is not set');

    const response = await fetch(`https://api.bland.ai/v1/calls/${call_id}`, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      // Get the error message from the response body if possible
      const errorBody = await response.text();
      throw new Error(`Bland API error: ${response.status} ${response.statusText}\nDetails: ${errorBody}`);
    }

    const callData = await response.json()
    
    // Extract transcript and email variable
    const data = {
      prompt: callData.concatenated_transcript,
      email: callData.variables?.email,
      phone_number: phone_number,
      call_id: call_id
    }

    // Call extract_items endpoint
    const extractResponse = await fetch('https://wlbgwlnszsnuhfmjgsxj.supabase.co/functions/v1/extract_items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!extractResponse.ok) {
      throw new Error(`Extract API error: ${extractResponse.status} ${extractResponse.statusText}`);
    }

    const extractedData = await extractResponse.json()

    return new Response(
      JSON.stringify(extractedData),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
})
