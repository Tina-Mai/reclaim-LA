// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// deplpoy command:  supabase functions deploy extract_items --project-ref wlbgwlnszsnuhfmjgsxj
// test command: supabase functions invoke extract_items --data '{"prompt": "Gray leather couch, $1000, blue, leather, living room, couch"}'

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

console.log("API Key exists:", !!Deno.env.get("OPENAI_API_KEY_SECRET"));

Deno.serve(async (req) => {
  const { prompt, email } = await req.json();

  console.log("Received prompt:", prompt);
  
  const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY_SECRET"),
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        "role": "system",
        "content": [
          {
            "type": "text",
            "text": "You are an insurance claims helper.\nThe user will describe one or more items they wish to claim. For each item, you must capture the following details:\n\t1.\tItem name\n\t2.\tEstimated price \n\t3.\tColor\n\t4.\tBrief description\n\t5.\tBrand\n\t6.\tRoom where the item is located\n\nTask:\nBased on the user’s statements (provided as a transcript), output a JSON array of arrays, where each inner array corresponds to a single claimed item. If price is not given, set it to -1.\nJSON Format:\t\t\n1. Do not include any extra fields beyond these six.\n2.\tGround your answers in the context of the user’s transcript (i.e., only include items that the user actually mentioned).\n3.\tIf an item detail is missing or not mentioned, leave that position blank (as an empty string)."
          }
        ]
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": prompt
          }
        ]
      },
    ],
    response_format: {
      "type": "json_schema",
      "json_schema": {
        "name": "item_list",
        "strict": true,
        "schema": {
          "type": "object",
          "properties": {
            "items": {
              "type": "array",
              "description": "A list of items, each represented by its properties.",
              "items": {
                "type": "object",
                "properties": {
                  "item_name": {
                    "type": "string",
                    "description": "The name of the item."
                  },
                  "price": {
                    "type": "number",
                    "description": "The price of the item in USD."
                  },
                  "color": {
                    "type": "string",
                    "description": "The color of the item."
                  },
                  "brand": {
                    "type": "string",
                    "description": "The brand of the item."
                  },
                  "room": {
                    "type": "string",
                    "description": "The room where the item was located."
                  },
                  "description": {
                    "type": "string",
                    "description": "A short description of the item."
                  }
                },
                "required": [
                  "item_name",
                  "price",
                  "color",
                  "brand",
                  "room",
                  "description"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": [
            "items"
          ],
          "additionalProperties": false
        }
      }
    },
    temperature: 1,
    max_completion_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  });

  const data = {
    json: response.choices[0].message.content,
  }

  // Parse the JSON string
  const parsedData = JSON.parse(data.json);
  
  // Create CSV header
  const csvHeader = ['item_name', 'price', 'color', 'brand', 'room', 'description'].join(',');
  
  // Convert items to CSV rows
  const csvRows = parsedData.items.map(item => [
    `"${item.item_name}"`,
    item.price,
    `"${item.color}"`,
    `"${item.brand}"`,
    `"${item.room}"`,
    `"${item.description}"`
  ].join(','));
  
  // Combine header and rows
  const csv = [csvHeader, ...csvRows].join('\n');

  console.log(csv)

  // Send email with CSV
  const emailResponse = await fetch('https://wlbgwlnszsnuhfmjgsxj.supabase.co/functions/v1/send_email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email || 'zanesabbagh@stanford.edu',
      csvContent: csv
    })
  });

  const emailData = await emailResponse.json();
  console.log('Email sent:', emailData);

  // Return both JSON and CSV
  return new Response(
    JSON.stringify({ ...data, csv }),
    { headers: { "Content-Type": "application/json" } },
  )
})

// response format:
// {"json":"{\"items\":[{\"item_name\":\"Bed\",\"price\":1000,\"color\":\"Gray\",\"brand\":\"\",\"room\":\"Bedroom\",\"description\":\"\"},{\"item_name\":\"Nightstand\",\"price\":-1,\"color\":\"Gray\",\"brand\":\"\",\"room\":\"Bedroom\",\"description\":\"\"},{\"item_name\":\"TV\",\"price\":1000,\"color\":\"\",\"brand\":\"LG\",\"room\":\"Bedroom\",\"description\":\"Bought from Best Buy\"}]}",
//   "csv":"item_name,price,color,brand,room,description\n\"Bed\",1000,\"Gray\",\"\",\"Bedroom\",\"\"\n\"Nightstand\",-1,\"Gray\",\"\",\"Bedroom\",\"\"\n\"TV\",1000,\"\",\"LG\",\"Bedroom\",\"Bought from Best Buy\""}%     



/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/extract_items' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
