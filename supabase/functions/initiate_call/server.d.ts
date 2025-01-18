declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler?: (request: Request) => Response | Promise<Response>;
  }

  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    init?: ServeInit
  ): void;
} 