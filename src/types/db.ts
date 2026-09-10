// ---------------------------------------------------------------------------
// PLACEHOLDER generated-shape types.
//
// CLAUDE.md rule: never hand-write DB types. Once a Supabase project is
// linked, regenerate this file and overwrite it wholesale:
//
//   supabase gen types typescript --linked > src/types/db.ts
//
// Regenerate after EVERY migration. This stub only covers the tables used
// by build steps 1 (auth/profiles/onboarding) and 2 (catalog + search) so
// the typed client compiles before the project is linked.
// ---------------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          home_city: string | null;
          phone_verified_at: string | null;
          is_adult: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          home_city?: string | null;
          phone_verified_at?: string | null;
          is_adult?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      shops: {
        Row: {
          id: string;
          name: string;
          slug: string;
          is_chain: boolean;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          is_chain?: boolean;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["shops"]["Insert"]>;
        Relationships: [];
      };
      shop_locations: {
        Row: {
          id: string;
          shop_id: string;
          google_place_id: string | null;
          address: string | null;
          city: string;
          geo: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          google_place_id?: string | null;
          address?: string | null;
          city: string;
          geo: unknown;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["shop_locations"]["Insert"]>;
        Relationships: [];
      };
      drinks: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          category: string | null;
          base_tea: string | null;
          description: string | null;
          image_url: string | null;
          created_by: string | null;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          name: string;
          category?: string | null;
          base_tea?: string | null;
          description?: string | null;
          image_url?: string | null;
          created_by?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["drinks"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [key: string]: never };
    Functions: {
      is_blocked: {
        Args: { a: string; b: string };
        Returns: boolean;
      };
    };
    Enums: { [key: string]: never };
    CompositeTypes: { [key: string]: never };
  };
}
