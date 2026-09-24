/// <reference types="expo/types" />

declare module "process" {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        EXPO_PUBLIC_SUPABASE_URL: string;
        EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
        EXPO_PUBLIC_DEFAULT_PARISH_SLUG?: string;
      }
    }
  }
}
