// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

console.log("Hello from Functions!")

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

interface PhoneCsv {
  phone: string;
  csv_content: string;
  created_at: string;
}

Deno.serve(async (req) => {
  const formData = await req.formData()
  // extract csv from form data

  
  // Extract SMS details from the form data
  const messageBody = formData.get('Body')
  const from = formData.get('From')

  console.log("Message Body: ", messageBody);
  console.log("From: ", from);

  const phoneNumber = from
  console.log("Processing extraction for phone number: ", phoneNumber);

  // Query Supabase for the most recent CSV content from the phone_csvs table
  const { data, error } = await supabase
    .from<PhoneCsv>('phone_csvs')
    .select('csv_content')
    .eq('phone', phoneNumber)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error("Error querying Supabase:", error);
    return new Response("Error querying Supabase", { status: 500 });
  }

  if (!data || data.length === 0) {
    console.error("No CSV data found for phone number:", phoneNumber);
    return new Response("No CSV data found", { status: 404 });
  }

  const [latestEntry] = data;
  if (!latestEntry?.csv_content) {
    console.error("CSV content is undefined for latest entry");
    return new Response("CSV content is missing", { status: 500 });
  }

  const csvContent = latestEntry.csv_content;
  console.log("CSV Content: ", csvContent);
  
  // Create TwiML response
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Message>Thanks! We just sent an email with your claims document to: ${messageBody}\nDon't forget to check your spam if you don't see it.</Message>
    </Response>`

  // Send email with CSV
  const emailResponse = await fetch('https://wlbgwlnszsnuhfmjgsxj.supabase.co/functions/v1/send_email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: messageBody,
      csvContent: csvContent
    })
  });

  const emailData = await emailResponse.json();
  console.log('Email sent:', emailData);

  // Return TwiML response
  return new Response(twimlResponse, { 
    headers: { 
      "Content-Type": "application/xml"
    }
  })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process_sms' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
