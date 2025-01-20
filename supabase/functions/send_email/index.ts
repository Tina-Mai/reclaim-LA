// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const handler = async (request: Request): Promise<Response> => {
    // Parse request body or use defaults
    const { email, csvContent } = await request.json().catch(() => ({}));
    
    const finalEmail = email || 'mwirtz@stanford.edu';
    const finalCsvContent = csvContent || "name,age,city\nJohn,30,New York\nJane,25,Los Angeles";
    const finalCsvBase64 = btoa(finalCsvContent);

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
            from: 'catalog@reclaimla.org',
            to: finalEmail,
            subject: 'Your Reclaim LA Claims Document',
            html: 'Great chatting with you on the phone today! \n\nWe\'ve attached your claims document to this email, which you can either send directly to your insurance company or edit in Microsoft Excel, Google Sheets, or Apple Numbers. \n\nBest of luck, and please do not hesitate to reach out to us at team@reclaimLA.org if there\'s any other way we could help. \n\nZane, Matthew, and Tina (the Reclaim team) \nwww.reclaimLA.org',
            attachments: [{
                filename: 'data.csv',
                content: finalCsvBase64,
                type: 'text/csv'
            }]
        })
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

serve(handler);

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send_email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
