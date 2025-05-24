
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      restaurant_reviews: {
        Row: {
          created_at: string | null
          id: string
          popular_menu_items: string[] | null
          publication: string | null
          restaurant_id: string
          review_date: string | null
          review_url: string | null
          reviewer: string | null
          sentiment: number | null
          sentiment_confidence: number | null
          sentiment_reason: string | null
          snippet: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          popular_menu_items?: string[] | null
          publication?: string | null
          restaurant_id: string
          review_date?: string | null
          review_url?: string | null
          reviewer?: string | null
          sentiment?: number | null
          sentiment_confidence?: number | null
          sentiment_reason?: string | null
          snippet?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          popular_menu_items?: string[] | null
          publication?: string | null
          restaurant_id?: string
          review_date?: string | null
          review_url?: string | null
          reviewer?: string | null
          sentiment?: number | null
          sentiment_confidence?: number | null
          sentiment_reason?: string | null
          snippet?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          additional_info: Json | null
          address: string | null
          categories: string[] | null
          categoryName: string | null
          cid: string | null
          city: string | null
          claim_this_business: boolean | null
          countryCode: string | null
          cover_image_url: string | null
          created_at: string | null
          critic_review_date: string | null
          critic_review_snippet: string | null
          critic_review_url: string | null
          description: string | null
          fid: string | null
          gas_prices: Json | null
          google_food_url: string | null
          google_place_id: string
          id: string
          image_categories: string[] | null
          images_count: number | null
          is_advertisement: boolean | null
          kgmid: string | null
          language: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          maps_url: string | null
          menu_url: string | null
          name: string | null
          neighborhood: string | null
          opening_hours: Json | null
          owner_updates: Json | null
          people_also_search: Json | null
          permanently_closed: boolean | null
          phone: string | null
          phone_unformatted: string | null
          places_tags: Json | null
          plus_code: string | null
          popular_times: Json | null
          popular_times_histogram: Json | null
          postalCode: string | null
          priceRange: string | null
          questions_and_answers: Json | null
          recommended_dishes: string[] | null
          reserve_table_url: string | null
          reviews_count: number | null
          reviews_distribution: Json | null
          reviews_tags: Json | null
          scraped_at: string | null
          search_string: string | null
          sentiment: number | null
          sentiment_confidence: number | null
          sentiment_reason: string | null
          state: string | null
          street: string | null
          temporarily_closed: boolean | null
          total_score: number | null
          url: string | null
          vibes: string[] | null
          website: string | null
        }
        Insert: {
          additional_info?: Json | null
          address?: string | null
          categories?: string[] | null
          categoryName?: string | null
          cid?: string | null
          city?: string | null
          claim_this_business?: boolean | null
          countryCode?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          critic_review_date?: string | null
          critic_review_snippet?: string | null
          critic_review_url?: string | null
          description?: string | null
          fid?: string | null
          gas_prices?: Json | null
          google_food_url?: string | null
          google_place_id: string
          id?: string
          image_categories?: string[] | null
          images_count?: number | null
          is_advertisement?: boolean | null
          kgmid?: string | null
          language?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          maps_url?: string | null
          menu_url?: string | null
          name?: string | null
          neighborhood?: string | null
          opening_hours?: Json | null
          owner_updates?: Json | null
          people_also_search?: Json | null
          permanently_closed?: boolean | null
          phone?: string | null
          phone_unformatted?: string | null
          places_tags?: Json | null
          plus_code?: string | null
          popular_times?: Json | null
          popular_times_histogram?: Json | null
          postalCode?: string | null
          priceRange?: string | null
          questions_and_answers?: Json | null
          recommended_dishes?: string[] | null
          reserve_table_url?: string | null
          reviews_count?: number | null
          reviews_distribution?: Json | null
          reviews_tags?: Json | null
          scraped_at?: string | null
          search_string?: string | null
          sentiment?: number | null
          sentiment_confidence?: number | null
          sentiment_reason?: string | null
          state?: string | null
          street?: string | null
          temporarily_closed?: boolean | null
          total_score?: number | null
          url?: string | null
          vibes?: string[] | null
          website?: string | null
        }
        Update: {
          additional_info?: Json | null
          address?: string | null
          categories?: string[] | null
          categoryName?: string | null
          cid?: string | null
          city?: string | null
          claim_this_business?: boolean | null
          countryCode?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          critic_review_date?: string | null
          critic_review_snippet?: string | null
          critic_review_url?: string | null
          description?: string | null
          fid?: string | null
          gas_prices?: Json | null
          google_food_url?: string | null
          google_place_id?: string
          id?: string
          image_categories?: string[] | null
          images_count?: number | null
          is_advertisement?: boolean | null
          kgmid?: string | null
          language?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          maps_url?: string | null
          menu_url?: string | null
          name?: string | null
          neighborhood?: string | null
          opening_hours?: Json | null
          owner_updates?: Json | null
          people_also_search?: Json | null
          permanently_closed?: boolean | null
          phone?: string | null
          phone_unformatted?: string | null
          places_tags?: Json | null
          plus_code?: string | null
          popular_times?: Json | null
          popular_times_histogram?: Json | null
          postalCode?: string | null
          priceRange?: string | null
          questions_and_answers?: Json | null
          recommended_dishes?: string[] | null
          reserve_table_url?: string | null
          reviews_count?: number | null
          reviews_distribution?: Json | null
          reviews_tags?: Json | null
          scraped_at?: string | null
          search_string?: string | null
          sentiment?: number | null
          sentiment_confidence?: number | null
          sentiment_reason?: string | null
          state?: string | null
          street?: string | null
          temporarily_closed?: boolean | null
          total_score?: number | null
          url?: string | null
          vibes?: string[] | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
