declare module "jsr:@supabase/supabase-js@2" {
  export interface SupabaseClientOptions {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
  }

  export interface PostgrestFilterBuilder<T> {
    eq: (column: string, value: unknown) => PostgrestFilterBuilder<T>;
    neq: (column: string, value: unknown) => PostgrestFilterBuilder<T>;
    select: (columns?: string) => PostgrestFilterBuilder<T>;
    single: () => Promise<{ data: T | null; error: Error | null }>;
    maybeSingle: () => Promise<{ data: T | null; error: Error | null }>;
    insert: (values: Partial<T>) => PostgrestFilterBuilder<T>;
    update: (values: Partial<T>) => PostgrestFilterBuilder<T>;
    delete: () => PostgrestFilterBuilder<T>;
    order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean; foreignTable?: string }) => PostgrestFilterBuilder<T>;
    limit: (count: number) => PostgrestFilterBuilder<T>;
    then: (onfulfilled?: (value: { data: T[]; error: Error | null }) => unknown) => Promise<unknown>;
  }

  export interface SupabaseClient {
    from: <T>(table: string) => PostgrestFilterBuilder<T>;
    auth: {
      signIn(credentials: { email: string; password: string }): Promise<{ user: unknown; error: Error | null }>;
      signOut(): Promise<{ error: Error | null }>;
    };
    storage: {
      from(bucket: string): {
        upload(path: string, file: File): Promise<{ data: unknown; error: Error | null }>;
        download(path: string): Promise<{ data: Blob; error: Error | null }>;
      };
    };
  }

  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: SupabaseClientOptions
  ): SupabaseClient;
} 