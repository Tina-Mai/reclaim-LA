// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// deploy command: supabase functions deploy process_sms --project-ref wlbgwlnszsnuhfmjgsxj
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
  const numMedia = formData.get('NumMedia')
  const messageSid = formData.get('MessageSid')

  console.log("Message Body: ", messageBody);
  console.log("From: ", from);
  console.log("Number of Media Items: ", numMedia);

  // Remove the '+' prefix from the phone number
  const phoneNumber = from

  console.log("Raw from value:", from);
  console.log("Final phoneNumber being queried:", phoneNumber);

  var twimlResponse = ``;

  // Check if there are any media items in the request
  if (numMedia && parseInt(numMedia.toString()) > 0) {
    console.log("Media items detected in the request");
    console.log(`Total media items: ${numMedia}`);
    
    // Log each media URL
    for (let i = 0; i < parseInt(numMedia.toString()); i++) {
      console.log(`Processing media item ${i+1} of ${numMedia}`);
      const mediaUrl = formData.get(`MediaUrl${i}`);
      const contentType = formData.get(`MediaContentType${i}`);
      
      console.log(`Media ${i} URL: ${mediaUrl}`);
      console.log(`Media ${i} Content Type: ${contentType}`);

      // Insert the media URL into the item_images table
      if (mediaUrl) {
        const { data: insertData, error: insertError } = await supabase
          .from('item_images')
          .insert({
            url: mediaUrl.toString(),
            phone_num: from?.toString()
          });
        
        if (insertError) {
          console.error(`Error inserting media URL ${i} into item_images:`, insertError);
        } else {
          console.log(`Successfully inserted media URL ${i} into item_images`);
          console.log(`Insert response data:`, insertData);
        }
      } else {
        console.log(`No media URL found for media item ${i}, skipping insertion`);
      }
      console.log(`Finished processing media item ${i+1} of ${numMedia}`);
    }
    
    console.log("Completed processing all media items");
    
    // Call the add_image function with the phone number after processing all media items
    console.log(`Calling add_image function after processing all media items`);

    twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Message>We're processing your photo(s). If you send more, we'll add them to your claim. Otherwise, reply with the best email for us to send it to</Message>
    </Response>`


  } else {


    // if no media items, call add_image function
    console.log("No media items in the request");
    // Create TwiML response
    try {
      const addImageResponse = await fetch('https://wlbgwlnszsnuhfmjgsxj.supabase.co/functions/v1/add_image', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsYmd3bG5zenNudWhmbWpnc3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4MDU0MDUsImV4cCI6MjA1MjM4MTQwNX0.NZT3FcuHlQYQiGiac-JNj0FJHIXPaRvGeJ7lYIIbKc0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Functions',
          phone_num: from?.toString(),
          email: messageBody
        })
      });
      
      const addImageData = await addImageResponse.json();
      console.log('addImageData', addImageData);
    } catch (error) {
      console.error(`Error calling add_image function:`, error);
    }


    // Create TwiML response
    twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Thanks! We just sent an email with your doc to: ${messageBody}\n\nIt might take a few minutes to arrive, and don't forget to check your spam if you don't see it.\n\nThanks for using Reclaim!\n- Zane, Matthew, and Tina</Message>
      </Response>`

    console.log("TwiML response:", twimlResponse);
    console.log("Should send thank you message")

  }

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
