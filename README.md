# ZU-LM

A research-driven podcast generator that creates engaging conversations about any topic. We've organized the code into an overall project with some subparts. After going throught his ReadMe, you will want to open the ReadMe file located in the zu-chat folder. If you don't want to set up the API keys you can see a detailed Demo here for full funcitonality: https://www.youtube.com/watch?v=aR2ksz0StmI. 

## Environment Setup

This project requires several API keys to function properly. Follow these steps to set up your environment:

1. Copy the example environment files:
   ```bash
   # Root directory
   cp .env.example .env

   # zu-chat directory
   cd zu-chat
   cp .env.example .env.local

   # researcher directory
   cd ../researcher
   cp .env.example .env
   ```

2. Obtain the required API keys:
   - [ElevenLabs](https://elevenlabs.io/) - For text-to-speech
   - [Groq](https://groq.com/) - For LLM inference
   - [OpenAI](https://openai.com/) - For AI capabilities
   - [Luma AI](https://lumalabs.ai/) - For image generation
   - [Perplexity](https://www.perplexity.ai/) - For search capabilities

3. Fill in your API keys in the respective .env files

## Required API Keys

The following API keys are required for full functionality:

- `ELEVENLABS_API_KEY` - For text-to-speech generation
- `GROQ_API_KEY` - For LLM inference
- `OPENAI_API_KEY` - For AI capabilities
- `LUMAAI_API_KEY` - For image generation
- `PERPLEXITY_API_KEY` - For search functionality

## Optional Configuration

Some features can be configured through environment variables:

- `LOCAL_LLM` - Specify which local LLM to use (default: "deepseek-r1:8b")
- `MAX_WEB_RESEARCH_LOOPS` - Control research depth (default: 1)
- `SEARCH_API` - Search provider to use (default: "perplexity")


## Run the project

To run the frontend server:

```
cd zu-chat
npm install
npm run dev
```

To run the Rust backend:
```
cd researcher
cargo run
```

Enjoy!
