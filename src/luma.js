import { LumaAI } from 'lumaai';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';

dotenv.config();

const client = new LumaAI({
  apiKey: process.env.LUMAAI_API_KEY
});

async function generateImage(prompt = "A teddy bear in sunglasses playing electric guitar and dancing") {
    let generation = await client.generations.image.create({
        prompt: prompt
    });

    let completed = false;

    while (!completed) {
        generation = await client.generations.get(generation.id);

        if (generation.state === "completed") {
            completed = true;
        } else if (generation.state === "failed") {
            throw new Error(`Generation failed: ${generation.failure_reason}`);
        } else {
            console.log("Dreaming...");
            await new Promise(r => setTimeout(r, 3000)); // Wait for 3 seconds
        }
    }

    const imageUrl = generation.assets.image;

    const response = await fetch(imageUrl);
    const fileStream = fs.createWriteStream(`${generation.id}.jpg`);
    await new Promise((resolve, reject) => {
        response.body.pipe(fileStream);
        response.body.on('error', reject);
        fileStream.on('finish', resolve);
    });

    console.log(`File downloaded as ${generation.id}.jpg`);
}


export { generateImage };