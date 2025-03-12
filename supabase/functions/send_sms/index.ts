// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

//deploy command: supabase functions deploy send_sms --project-ref 

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { TwilioSms } from "./helpers/helper.ts";

// Logger function to standardize log format
const log = (message: string, data?: any) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    message,
    data: data || null,
  }));
};

const accountSid = Deno.env.get("TWILIO_PROD_SID") || "";
const authToken = Deno.env.get("TWILIO_PROD_AUTH_TOKEN") || "";
const fromMobile = "+18449434713";

Deno.serve(async (req) => {
  try {
    const { textMessage, toMobile, mediaUrl } = await req.json();
    log("Received SMS request", { toMobile, mediaUrl: mediaUrl || 'not provided' });

    if (!accountSid || !authToken) {
      log("Missing Twilio credentials");
      throw new Error("Missing Twilio credentials");
    }

    const twilioClient = new TwilioSms(accountSid, authToken);
    log("Initiating Twilio SMS send");

    const message = await twilioClient.sendSms({
      Body: textMessage,
      From: fromMobile,
      To: toMobile,
      ...(mediaUrl ? { MediaUrl: [mediaUrl] } : {}),
    });

    log("Received Twilio response", message);

    const data = {
      isSuccess: false,
    };

    if (message.status === "queued") {
      data.isSuccess = true;
      log("SMS successfully queued", { messageId: message.sid });
    } else {
      log("SMS not queued", { 
        status: message.status, 
        errorCode: message.error_code,
        errorMessage: message.error_message 
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    log("Error in SMS function", { error: errorMessage });
    return new Response(
      JSON.stringify({ 
        isSuccess: false, 
        error: errorMessage 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send_sms' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
