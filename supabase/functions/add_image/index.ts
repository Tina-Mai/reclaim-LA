// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { parse } from "https://deno.land/std@0.177.0/encoding/csv.ts"
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts"

console.log("Started Add Image Function!")

async function getImageLinks(supabaseClient, phone_num) {
  // Query the item_images table for all entries
  console.log("Attempting to query item_images table...")
  const { data, error } = await supabaseClient
    .from('item_images')
    .select('url')
    .eq('phone_num', phone_num)

  if (error) {
    console.error("Database query error:", error)
    throw new Error(error.message)
  }

  // Extract the 'url' fields into a list called image_links
  return data.map(item => item.url)
}

async function getItemNames(supabaseClient, phone_num) {
  // Query the phone_csvs table for the most recent entry
  console.log("Attempting to query phone_csvs table for the most recent entry...")
  const { data, error } = await supabaseClient
    .from('phone_csvs')
    .select('id, csv_content') // Include 'id' in the selection
    .eq('phone', phone_num)
    .order('created_at', { ascending: false }) // Assuming 'created_at' is the timestamp column
    .limit(1)

  if (error) {
    console.error("Database query error:", error)
    throw new Error(error.message)
  }

  if (data.length > 0) {
    const csv_content = data[0].csv_content;
    console.log("Type of csv_content:", typeof csv_content);

    try {
      // Parse the CSV content using Deno's CSV parser
      const records = parse(csv_content, {
        skipFirstRow: false,
        columns: true,        // Use the first row as header
        separator: ",",       // Explicitly set the separator
        trimLeadingSpace: true,
        quote: ['"'],         // Handle quoted fields properly
        comment: undefined    // No comment character
      });

      console.log("Parsed CSV content:", records);
      return { id: data[0].id, csv_content: records };
    } catch (csvError) {
      console.error("CSV parsing error:", csvError);
      
      // If parsing fails, try a more lenient approach
      try {
        const fallbackRecords = parse(csv_content, {
          skipFirstRow: true,  // Skip header row
          columns: ["item_name", "price", "color", "brand", "room", "description"],  // Define columns manually
          separator: ",",
          trimLeadingSpace: true,
          quote: ['"']
        });
        
        console.log("Fallback parsing successful:", fallbackRecords);
        return { id: data[0].id, csv_content: fallbackRecords };
      } catch (fallbackError) {
        console.error("Fallback parsing error:", fallbackError);
        // Return the raw content if all parsing fails
        return { id: data[0].id, csv_content: csv_content, parsing_error: csvError.message };
      }
    }
  }

  return null;
}

async function tagItems(imageLink, csvContent) {
  console.log("Tagging items with image:", imageLink);
  
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY_SECRET"),
    });
    
    // Ensure csvContent is an array we can iterate through
    const itemsToCheck = Array.isArray(csvContent) ? csvContent : [];
    console.log(`Processing ${itemsToCheck.length} items against image`);
    
    // Create a list to store just the boolean results
    const results = [];
    
    // Fetch the image data with a timeout to prevent hanging
    console.log("Fetching image from URL:", imageLink);
    const imageResponse = await fetch(imageLink);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    // Get the image as base64
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Resize the image to a reasonable size before processing
    // We'll use a data URL with max dimensions of 800px while maintaining aspect ratio
    const resizedImageData = await resizeImage(imageBuffer, 800);
    
    // Process each item individually
    for (const item of itemsToCheck) {
      console.log(`Checking if image contains item: ${item.item_name}`);
      
      // Call OpenAI vision model for this specific item
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            "role": "system",
            "content": [
              {
                "type": "text",
                "text": "You are an insurance claims assistant that analyzes images. Your task is to determine if a specific item described by the user is visible in the provided image. Don't worry about quantities in the description. Respond with a clear yes or no assessment."
              }
            ]
          },
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": `Is the following item visible in this image? Please analyze carefully and respond with a structured assessment.
                
                Item details:
                - Name: ${item.item_name || 'Not specified'}
                - Color: ${item.color || 'Not specified'}
                - Brand: ${item.brand || 'Not specified'}
                - Description: ${item.description || 'Not specified'}
                - Room: ${item.room || 'Not specified'}`
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": resizedImageData
                }
              }
            ]
          },
        ],
        response_format: {
          "type": "json_schema",
          "json_schema": {
            "name": "item_detection",
            "strict": true,
            "schema": {
              "type": "object",
              "properties": {
                "is_present": {
                  "type": "boolean",
                  "description": "Whether the described item is visible in the image"
                }
              },
              "required": [
                "is_present"
              ],
              "additionalProperties": false
            }
          }
        },
        temperature: 0.3,
        max_completion_tokens: 1024
      });
      
      // Parse the response
      const result = JSON.parse(response.choices[0].message.content);
      
      // Just add the boolean result to our array
      results.push(result.is_present);
      
      console.log(`Result for ${item.item_name}: ${result.is_present ? "Found" : "Not found"}`);
    }
    
    // Return just the array of boolean results
    return {
      results: results
    };
  } catch (error) {
    console.error("Error tagging items:", error);
    return {
      success: false,
      error: error.message,
      image: imageLink
    };
  }
}

// Helper function to resize images
async function resizeImage(imageBuffer, maxDimension = 800) {
  try {
    // For very large images, we'll use a simpler approach to avoid stack overflow
    const base64Image = btoa(
      new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const contentType = "image/jpeg"; // Default to JPEG
    const dataUrl = `data:${contentType};base64,${base64Image}`;
    
    // Create an off-screen canvas
    const img = new Image();
    
    // Create a promise to handle image loading
    return new Promise((resolve, reject) => {
      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.warn("Image resizing timed out, using original image");
        resolve(dataUrl);
      }, 5000); // 5 second timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
          
          // Create canvas with new dimensions
          const canvas = new OffscreenCanvas(width, height);
          const ctx = canvas.getContext('2d');
          
          // Draw resized image on canvas
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert canvas to blob with lower quality for large images
          canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 })
            .then(blob => {
              // Convert blob to base64
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve(reader.result);
              };
              reader.onerror = () => {
                console.warn("Error reading blob, using original image");
                resolve(dataUrl);
              };
              reader.readAsDataURL(blob);
            })
            .catch(error => {
              console.warn("Error converting canvas to blob:", error);
              resolve(dataUrl);
            });
        } catch (error) {
          console.warn("Error during canvas operations:", error);
          resolve(dataUrl);
        }
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        console.warn("Image loading failed, using original image");
        resolve(dataUrl);
      };
      
      // Set src after setting up event handlers
      img.src = dataUrl;
    });
  } catch (error) {
    console.error("Error in resizeImage function:", error);
    // Create a simple base64 encoding as fallback
    try {
      const base64Image = btoa(
        new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      return `data:image/jpeg;base64,${base64Image}`;
    } catch (btoa_error) {
      console.error("Fatal error encoding image:", btoa_error);
      throw new Error("Unable to process image: " + error.message);
    }
  }
}

async function updateCSV(taggingResults, csvContent, imageLinks) {
  console.log("Updating CSV with tagging results");
  
  // Ensure we have valid inputs
  if (!taggingResults || !csvContent || !csvContent.csv_content || !imageLinks) {
    console.error("Missing required data for CSV update");
    return { success: false, error: "Missing required data" };
  }
  
  try {
    // Get the CSV content as an array
    const items = Array.isArray(csvContent.csv_content) ? csvContent.csv_content : [];
    
    console.log("Items:", items);

    if (items.length === 0) {
      return { success: false, error: "No items found in CSV" };
    }
    
    // Create a new array to store the updated items
    const updatedItems = [...items];
    
    // Process each tagging result and add new columns for each image
    imageLinks.forEach((imageLink, imageIndex) => {
      const columnName = `Image ${imageIndex + 1}`;
      const tagResult = taggingResults[imageIndex];
      
      // Skip if the result doesn't have the expected format
      if (!tagResult || !tagResult.results || !Array.isArray(tagResult.results)) {
        console.warn(`Skipping invalid tagging result for ${columnName}:`, tagResult);
        return;
      }
      
      // Add the image link to each item based on the corresponding result
      tagResult.results.forEach((isPresent, itemIndex) => {
        if (itemIndex < updatedItems.length) {
          // If the boolean is true, add the image link to the new column
          // If false, leave it empty
          updatedItems[itemIndex][columnName] = isPresent ? imageLink : '';
        }
      });
    });
    
    // Return the updated items and the original CSV ID
    return {
      success: true,
      id: csvContent.id,
      updated_items: updatedItems
    };
  } catch (error) {
    console.error("Error updating CSV:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function updateSupabaseCSV(supabaseClient, csvId, updatedItems) {
  console.log("Updating Supabase CSV record with ID:", csvId);
  
  try {
    // Convert the updated items back to CSV format
    const headers = Object.keys(updatedItems[0]);
    const csvRows = [headers.join(',')];
    
    // Add each item as a row in the CSV
    updatedItems.forEach(item => {
      const row = headers.map(header => {
        // Handle values that might contain commas by quoting them
        const value = item[header] || '';
        return value.includes(',') ? `"${value}"` : value;
      }).join(',');
      csvRows.push(row);
    });
    
    // Join all rows with newlines to create the final CSV content
    const newCsvContent = csvRows.join('\n');
    
    // Update the record in the database
    const { data, error } = await supabaseClient
      .from('phone_csvs')
      .update({ csv_content: newCsvContent })
      .eq('id', csvId);
      
    if (error) {
      console.error("Error updating CSV in database:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, id: csvId };
  } catch (error) {
    console.error("Error in updateSupabaseCSV:", error);
    return { success: false, error: error.message };
  }
}

Deno.serve(async (req) => {
  try {
    // Get the phone number and email from the request
    const { phone_num, email } = await req.json()
    
    // Check if phone_num is provided
    if (!phone_num) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Create a Supabase client using the built-in environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // Use the getImageLinks function to get image URLs
    const image_links = await getImageLinks(supabaseClient, phone_num)

    // Use the getItemNames function to get the most recent csv_content
    const csv_content = await getItemNames(supabaseClient, phone_num)
    
    // TEMPORARY: Use hardcoded tagging results instead of calling tagItems
    // const tagging_results = [
    //   {"results":[false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
    //   {"results":[false,false,false,false,false,false,true,true,false,false,true,true,true,false]}
    // ];
    
    // Comment out the original code that calls tagItems
    const tagging_results = []
    for (const imageLink of image_links) {
      const result = await tagItems(imageLink, csv_content?.csv_content)
      tagging_results.push(result)
    }
    
    // Update the CSV with the tagging results and image links
    const updated_csv = await updateCSV(tagging_results, csv_content, image_links)
    
    // Add this new code to update the database with the modified CSV
    let supabase_update_result = null;
    if (updated_csv.success && updated_csv.updated_items) {
      supabase_update_result = await updateSupabaseCSV(
        supabaseClient, 
        updated_csv.id, 
        updated_csv.updated_items
      );
      
      // Call the send_email function if email is provided
      if (email) {
        console.log("Sending email to:", email);
        
        // Get the most recent CSV content from Supabase
        const { data: csvData, error: csvError } = await supabaseClient
          .from('phone_csvs')
          .select('csv_content')
          .eq('phone', phone_num)
          .order('created_at', { ascending: false })
          .limit(1);

        if (csvError) {
          throw new Error(`Error fetching CSV: ${csvError.message}`);
        }
        console.log("CSV Content being sent:", csvData[0].csv_content);

        const emailResponse = await fetch('https://wlbgwlnszsnuhfmjgsxj.supabase.co/functions/v1/send_email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            email: email,
            csvContent: csvData[0].csv_content
          })
        });
        const emailResult = await emailResponse.json();
        supabase_update_result = { ...supabase_update_result, emailResult };
      }
    }

    return new Response(
      JSON.stringify({ 
        image_links, 
        csv_content, 
        tagging_results, 
        updated_csv, 
        supabase_update_result 
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/addEvidence' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
