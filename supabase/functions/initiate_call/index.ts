// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.


// deploy command: supabase functions deploy initiate_call --project-ref wlbgwlnszsnuhfmjgsxj

// Import type definitions for Supabase Edge Runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Import the serve function from Deno's standard HTTP server module
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Define constants for Bland AI API
const BLAND_API_URL = "https://api.bland.ai/v1/calls";
// Get API key from environment variables
const BLAND_API_KEY = Deno.env.get("BLAND_API_KEY");
const PATHWAY_ID = Deno.env.get("BLAND_PATHWAY_ID");

console.log("Started initiate_call function")

// Validate that the API key is present in environment variables
if (!BLAND_API_KEY) {
  throw new Error("BLAND_API_KEY environment variable is not set");
}

// Create HTTP server to handle incoming requests
serve(async (req) => {
  try {
    // Extract phone number from the request body
    const { phone_number } = await req.json();
    
    // Validate that phone number is provided
    if (!phone_number) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }), 
        {
          headers: { "Content-Type": "application/json" },
          status: 400, // Return 400 Bad Request if phone number is missing
        }
      );
    }

    // Make API call to Bland AI to initiate the call
    const response = await fetch(BLAND_API_URL, {
      method: 'POST',
      headers: {
        'authorization': BLAND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number,
        pathway_id: PATHWAY_ID, // Specific pathway ID for the AI conversation
        // Define webhook URL that will receive call transcript
        // {call_id} is a placeholder that Bland AI will replace with the actual call ID
        webhook: `https://wlbgwlnszsnuhfmjgsxj.supabase.co/functions/v1/send_transcript?call_id={call_id}&phone_number=${phone_number}`
      })
    });
    
    // Log the response for debugging purposes
    console.log("Response from Bland API:", response);

    // Parse the response to get the call ID
    const data = await response.json();
    const call_id = data.call_id;
    console.log("Call ID:", call_id);
    
    // Return success response with call data and the complete webhook URL
    return new Response(JSON.stringify({
      ...data, // Include all data from Bland AI response
      // Include the webhook endpoint with the actual call ID for reference
      webhook_endpoint: `https://wlbgwlnszsnuhfmjgsxj.supabase.co/functions/v1/send_transcript?call_id=${call_id}`
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200, // Success status code
    });

  } catch (error) {
    // Handle any errors that occur during execution
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});