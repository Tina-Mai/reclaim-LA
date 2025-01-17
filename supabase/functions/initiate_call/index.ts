// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BLAND_API_URL = "https://api.bland.ai/v1/calls";
const BLAND_API_KEY = Deno.env.get("BLAND_API_KEY");

console.log("Started initiate_call function")

// Add token check
if (!BLAND_API_KEY) {
  throw new Error("BLAND_API_KEY environment variable is not set");
}

serve(async (req) => {
  try {
    // Parse the request body to get the phone number
    const { phone_number } = await req.json();
    
    if (!phone_number) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }), 
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const response = await fetch(BLAND_API_URL, {
      method: 'POST',
      headers: {
        'authorization': BLAND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number,
        pathway_id: "9ac11b35-8525-4ae8-b75a-adecbe8c2bc4"
      })
    });
    
    console.log("Response from Bland API:", response);

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});