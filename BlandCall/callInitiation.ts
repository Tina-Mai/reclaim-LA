import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const BLAND_API_URL = "https://api.bland.ai/v1/calls";
const BLAND_AUTH_TOKEN = Deno.env.get("BLAND_AUTH_TOKEN");

// Add token check
if (!BLAND_AUTH_TOKEN) {
  throw new Error("BLAND_AUTH_TOKEN environment variable is not set");
}

serve(async (req) => {
  try {
    const response = await fetch(BLAND_API_URL, {
      method: 'POST',
      headers: {
        'authorization': BLAND_AUTH_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: "+18582127078",
        pathway_id: "9ac11b35-8525-4ae8-b75a-adecbe8c2bc4"
      })
    });

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