declare module "https://deno.land/x/openai@v4.20.1/mod.ts" {
  export default class OpenAI {
    constructor(config: { apiKey: string | undefined });
    chat: {
      completions: {
        create(params: {
          model: string;
          messages: Array<{
            role: string;
            content: Array<{ type: string; text: string; }>;
          }>;
          response_format?: {
            type: string;
            json_schema: {
              name: string;
              strict: boolean;
              schema: {
                type: string;
                properties: Record<string, unknown>;
                required: string[];
                additionalProperties: boolean;
              };
            };
          };
          temperature?: number;
          max_completion_tokens?: number;
          top_p?: number;
          frequency_penalty?: number;
          presence_penalty?: number;
        }): Promise<{
          choices: Array<{
            message: {
              content: string;
            };
          }>;
        }>;
      };
    };
  }
} 