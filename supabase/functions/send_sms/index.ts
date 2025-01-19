// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

//deploy command: supabase functions deploy send_sms --project-ref 

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { TwilioSms } from "./helpers/helper.ts";

const accountSid = Deno.env.get("TWILIO_PROD_SID") || "";
const authToken = Deno.env.get("TWILIO_PROD_AUTH_TOKEN") || "";
const fromMobile = "+18449434713";


Deno.serve(async (req) => {
      const { textMessage, toMobile, mediaUrl } = await req.json();


      const twilioClient = new TwilioSms(accountSid, authToken);
      const message = await twilioClient.sendSms({
        Body: textMessage,
        From: fromMobile,
        To: toMobile,
        MediaUrl: [mediaUrl],
      });
      const data = {
        isSuccess: false,
      };

      if (message.status === "queued") {
        data.isSuccess = true;
      }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send_sms' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
