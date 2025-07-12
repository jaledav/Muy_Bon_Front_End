export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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
          id: string
          created_at: string
          updated_at: string
          google_place_id: string
          kgmid: string | null
          fid: string | null
          cid: string | null
          name: string | null
          sub_title: string | null
          location_description_gmaps: string | null
          description_gmaps: string | null
          price_range_gmaps: string | null
          category_name_gmaps: string | null
          categories_gmaps: string[] | null
          address_gmaps: string | null
          neighborhood_gmaps: string | null
          street_gmaps: string | null
          city_gmaps: string | null
          restaurant_state_gmaps: string | null
          postal_code_gmaps: string | null
          country_code_gmaps: string | null
          phone_gmaps: string | null
          phone_unformatted_gmaps: string | null
          website_gmaps: string | null
          menu_url_gmaps: string | null
          maps_search_url_gmaps: string | null
          latitude_gmaps: number | null
          longitude_gmaps: number | null
          plus_code_gmaps: string | null
          located_in_gmaps: string | null
          total_score_gmaps: number | null
          reviews_count_gmaps: number | null
          reviews_distribution_gmaps: Json | null
          permanently_closed_gmaps: boolean | null
          temporarily_closed_gmaps: boolean | null
          claim_this_business_gmaps: boolean | null
          is_advertisement_gmaps: boolean | null
          opening_hours_gmaps: Json | null
          additional_opening_hours_gmaps: Json | null
          opening_hours_confirmation_text_gmaps: string | null
          popular_times_live_text_gmaps: string | null
          popular_times_live_percent_gmaps: number | null
          popular_times_histogram_gmaps: Json | null
          cover_image_url_gmaps: string | null
          image_urls_gmaps: string[] | null
          images_count_gmaps: number | null
          image_categories_gmaps: string[] | null
          raw_google_images_data_gmaps: Json | null
          people_also_search_gmaps: Json | null
          places_tags_gmaps: Json | null
          reviews_tags_gmaps: Json | null
          additional_info_gmaps: Json | null
          vibes_gmaps: string[] | null
          gas_prices_gmaps: Json | null
          questions_and_answers_gmaps: Json | null
          owner_updates_gmaps: Json | null
          updates_from_customers_gmaps: Json | null
          hotel_stars_gmaps: string | null
          hotel_description_gmaps: string | null
          check_in_date_gmaps: string | null
          check_out_date_gmaps: string | null
          similar_hotels_nearby_gmaps: Json | null
          hotel_review_summary_gmaps: Json | null
          hotel_ads_gmaps: Json | null
          reserve_table_url_gmaps: string | null
          table_reservation_links_gmaps: Json | null
          booking_links_gmaps: Json | null
          order_by_gmaps: Json | null
          restaurant_data_gmaps: Json | null
          google_food_url_gmaps: string | null
          user_place_note_gmaps: string | null
          web_results_gmaps: Json | null
          leads_enrichment_gmaps: Json | null
          language_gmaps: string | null
          search_string_gmaps: string | null
          gmaps_scraped_at: string | null
          gmaps_scrape_input_name: string | null
          gmaps_scrape_input_location: string | null
          gmaps_scrape_trigger_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          google_place_id: string
          kgmid?: string | null
          fid?: string | null
          cid?: string | null
          name?: string | null
          sub_title?: string | null
          location_description_gmaps?: string | null
          description_gmaps?: string | null
          price_range_gmaps?: string | null
          category_name_gmaps?: string | null
          categories_gmaps?: string[] | null
          address_gmaps?: string | null
          neighborhood_gmaps?: string | null
          street_gmaps?: string | null
          city_gmaps?: string | null
          restaurant_state_gmaps?: string | null
          postal_code_gmaps?: string | null
          country_code_gmaps?: string | null
          phone_gmaps?: string | null
          phone_unformatted_gmaps?: string | null
          website_gmaps?: string | null
          menu_url_gmaps?: string | null
          maps_search_url_gmaps?: string | null
          latitude_gmaps?: number | null
          longitude_gmaps?: number | null
          plus_code_gmaps?: string | null
          located_in_gmaps?: string | null
          total_score_gmaps?: number | null
          reviews_count_gmaps?: number | null
          reviews_distribution_gmaps?: Json | null
          permanently_closed_gmaps?: boolean | null
          temporarily_closed_gmaps?: boolean | null
          claim_this_business_gmaps?: boolean | null
          is_advertisement_gmaps?: boolean | null
          opening_hours_gmaps?: Json | null
          additional_opening_hours_gmaps?: Json | null
          opening_hours_confirmation_text_gmaps?: string | null
          popular_times_live_text_gmaps?: string | null
          popular_times_live_percent_gmaps?: number | null
          popular_times_histogram_gmaps?: Json | null
          cover_image_url_gmaps?: string | null
          image_urls_gmaps?: string[] | null
          images_count_gmaps?: number | null
          image_categories_gmaps?: string[] | null
          raw_google_images_data_gmaps?: Json | null
          people_also_search_gmaps?: Json | null
          places_tags_gmaps?: Json | null
          reviews_tags_gmaps?: Json | null
          additional_info_gmaps?: Json | null
          vibes_gmaps?: string[] | null
          gas_prices_gmaps?: Json | null
          questions_and_answers_gmaps?: Json | null
          owner_updates_gmaps?: Json | null
          updates_from_customers_gmaps?: Json | null
          hotel_stars_gmaps?: string | null
          hotel_description_gmaps?: string | null
          check_in_date_gmaps?: string | null
          check_out_date_gmaps?: string | null
          similar_hotels_nearby_gmaps?: Json | null
          hotel_review_summary_gmaps?: Json | null
          hotel_ads_gmaps?: Json | null
          reserve_table_url_gmaps?: string | null
          table_reservation_links_gmaps?: Json | null
          booking_links_gmaps?: Json | null
          order_by_gmaps?: Json | null
          restaurant_data_gmaps?: Json | null
          google_food_url_gmaps?: string | null
          user_place_note_gmaps?: string | null
          web_results_gmaps?: Json | null
          leads_enrichment_gmaps?: Json | null
          language_gmaps?: string | null
          search_string_gmaps?: string | null
          gmaps_scraped_at?: string | null
          gmaps_scrape_input_name?: string | null
          gmaps_scrape_input_location?: string | null
          gmaps_scrape_trigger_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          google_place_id?: string
          kgmid?: string | null
          fid?: string | null
          cid?: string | null
          name?: string | null
          sub_title?: string | null
          location_description_gmaps?: string | null
          description_gmaps?: string | null
          price_range_gmaps?: string | null
          category_name_gmaps?: string | null
          categories_gmaps?: string[] | null
          address_gmaps?: string | null
          neighborhood_gmaps?: string | null
          street_gmaps?: string | null
          city_gmaps?: string | null
          restaurant_state_gmaps?: string | null
          postal_code_gmaps?: string | null
          country_code_gmaps?: string | null
          phone_gmaps?: string | null
          phone_unformatted_gmaps?: string | null
          website_gmaps?: string | null
          menu_url_gmaps?: string | null
          maps_search_url_gmaps?: string | null
          latitude_gmaps?: number | null
          longitude_gmaps?: number | null
          plus_code_gmaps?: string | null
          located_in_gmaps?: string | null
          total_score_gmaps?: number | null
          reviews_count_gmaps?: number | null
          reviews_distribution_gmaps?: Json | null
          permanently_closed_gmaps?: boolean | null
          temporarily_closed_gmaps?: boolean | null
          claim_this_business_gmaps?: boolean | null
          is_advertisement_gmaps?: boolean | null
          opening_hours_gmaps?: Json | null
          additional_opening_hours_gmaps?: Json | null
          opening_hours_confirmation_text_gmaps?: string | null
          popular_times_live_text_gmaps?: string | null
          popular_times_live_percent_gmaps?: number | null
          popular_times_histogram_gmaps?: Json | null
          cover_image_url_gmaps?: string | null
          image_urls_gmaps?: string[] | null
          images_count_gmaps?: number | null
          image_categories_gmaps?: string[] | null
          raw_google_images_data_gmaps?: Json | null
          people_also_search_gmaps?: Json | null
          places_tags_gmaps?: Json | null
          reviews_tags_gmaps?: Json | null
          additional_info_gmaps?: Json | null
          vibes_gmaps?: string[] | null
          gas_prices_gmaps?: Json | null
          questions_and_answers_gmaps?: Json | null
          owner_updates_gmaps?: Json | null
          updates_from_customers_gmaps?: Json | null
          hotel_stars_gmaps?: string | null
          hotel_description_gmaps?: string | null
          check_in_date_gmaps?: string | null
          check_out_date_gmaps?: string | null
          similar_hotels_nearby_gmaps?: Json | null
          hotel_review_summary_gmaps?: Json | null
          hotel_ads_gmaps?: Json | null
          reserve_table_url_gmaps?: string | null
          table_reservation_links_gmaps?: Json | null
          booking_links_gmaps?: Json | null
          order_by_gmaps?: Json | null
          restaurant_data_gmaps?: Json | null
          google_food_url_gmaps?: string | null
          user_place_note_gmaps?: string | null
          web_results_gmaps?: Json | null
          leads_enrichment_gmaps?: Json | null
          language_gmaps?: string | null
          search_string_gmaps?: string | null
          gmaps_scraped_at?: string | null
          gmaps_scrape_input_name?: string | null
          gmaps_scrape_input_location?: string | null
          gmaps_scrape_trigger_url?: string | null
        }
        Relationships: []
      }
      google_user_reviews: {
        Row: {
          id: string
          restaurant_id: string
          gmaps_review_id: string
          created_at: string
          reviewer_id_gmaps: string | null
          reviewer_name_gmaps: string | null
          reviewer_url_gmaps: string | null
          reviewer_photo_url_gmaps: string | null
          reviewer_num_reviews_gmaps: number | null
          is_local_guide_gmaps: boolean | null
          review_text_gmaps: string | null
          review_text_translated_gmaps: string | null
          published_at_text_gmaps: string | null
          published_at_date_gmaps: string | null
          stars_gmaps: number | null
          likes_count_gmaps: number | null
          review_url_gmaps: string | null
          review_origin_gmaps: string | null
          response_from_owner_text_gmaps: string | null
          response_from_owner_date_gmaps: string | null
          image_urls_gmaps: string[] | null
          context_gmaps: Json | null
          detailed_rating_gmaps: Json | null
          visited_in_gmaps: string | null
          original_language_gmaps: string | null
          translated_language_gmaps: string | null
          gmaps_profile_scraped_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          gmaps_review_id: string
          created_at?: string
          reviewer_id_gmaps?: string | null
          reviewer_name_gmaps?: string | null
          reviewer_url_gmaps?: string | null
          reviewer_photo_url_gmaps?: string | null
          reviewer_num_reviews_gmaps?: number | null
          is_local_guide_gmaps?: boolean | null
          review_text_gmaps?: string | null
          review_text_translated_gmaps?: string | null
          published_at_text_gmaps?: string | null
          published_at_date_gmaps?: string | null
          stars_gmaps?: number | null
          likes_count_gmaps?: number | null
          review_url_gmaps?: string | null
          review_origin_gmaps?: string | null
          response_from_owner_text_gmaps?: string | null
          response_from_owner_date_gmaps?: string | null
          image_urls_gmaps?: string[] | null
          context_gmaps?: Json | null
          detailed_rating_gmaps?: Json | null
          visited_in_gmaps?: string | null
          original_language_gmaps?: string | null
          translated_language_gmaps?: string | null
          gmaps_profile_scraped_at: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          gmaps_review_id?: string
          created_at?: string
          reviewer_id_gmaps?: string | null
          reviewer_name_gmaps?: string | null
          reviewer_url_gmaps?: string | null
          reviewer_photo_url_gmaps?: string | null
          reviewer_num_reviews_gmaps?: number | null
          is_local_guide_gmaps?: boolean | null
          review_text_gmaps?: string | null
          review_text_translated_gmaps?: string | null
          published_at_text_gmaps?: string | null
          published_at_date_gmaps?: string | null
          stars_gmaps?: number | null
          likes_count_gmaps?: number | null
          review_url_gmaps?: string | null
          review_origin_gmaps?: string | null
          response_from_owner_text_gmaps?: string | null
          response_from_owner_date_gmaps?: string | null
          image_urls_gmaps?: string[] | null
          context_gmaps?: Json | null
          detailed_rating_gmaps?: Json | null
          visited_in_gmaps?: string | null
          original_language_gmaps?: string | null
          translated_language_gmaps?: string | null
          gmaps_profile_scraped_at?: string
        }
      }
      critic_reviews: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          restaurant_id: string | null
          restaurant_name_critic_source: string | null
          location_critic_source: string | null
          summary_critic: string | null
          reviewer_critic: string | null
          publication_critic: string | null
          vibe_critic: string[] | null
          sentiment_critic: string | null
          sentiment_reason_critic: string | null
          sentiment_confidence_critic: string | null
          review_snippet_critic: string | null
          popular_menu_items_critic: string[] | null
          other_details_critic: string | null
          review_date_critic: string | null
          review_url_critic: string
          needs_manual_review_dq: boolean | null
          google_place_id_from_critic_src: string | null
          google_place_name_api_dq: string | null
          name_match_score_to_google_dq: number | null
          place_id_confidence_dq: string | null
          review_processing_reasons_dq: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          restaurant_id?: string | null
          restaurant_name_critic_source?: string | null
          location_critic_source?: string | null
          summary_critic?: string | null
          reviewer_critic?: string | null
          publication_critic?: string | null
          vibe_critic?: string[] | null
          sentiment_critic?: string | null
          sentiment_reason_critic?: string | null
          sentiment_confidence_critic?: string | null
          review_snippet_critic?: string | null
          popular_menu_items_critic?: string[] | null
          other_details_critic?: string | null
          review_date_critic?: string | null
          review_url_critic: string
          needs_manual_review_dq?: boolean | null
          google_place_id_from_critic_src?: string | null
          google_place_name_api_dq?: string | null
          name_match_score_to_google_dq?: number | null
          place_id_confidence_dq?: string | null
          review_processing_reasons_dq?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          restaurant_id?: string | null
          restaurant_name_critic_source?: string | null
          location_critic_source?: string | null
          summary_critic?: string | null
          reviewer_critic?: string | null
          publication_critic?: string | null
          vibe_critic?: string[] | null
          sentiment_critic?: string | null
          sentiment_reason_critic?: string | null
          sentiment_confidence_critic?: string | null
          review_snippet_critic?: string | null
          popular_menu_items_critic?: string[] | null
          other_details_critic?: string | null
          review_date_critic?: string | null
          review_url_critic?: string
          needs_manual_review_dq?: boolean | null
          google_place_id_from_critic_src?: string | null
          google_place_name_api_dq?: string | null
          name_match_score_to_google_dq?: number | null
          place_id_confidence_dq?: string | null
          review_processing_reasons_dq?: string[] | null
        }
      }
      cse_review_snippets: {
        Row: {
          id: string
          created_at: string
          restaurant_id: string
          url: string
          title: string | null
          html_title_cse: string | null
          snippet_text_cse: string | null
          publication_cse: string | null
          domain_cse: string | null
          og_description_cse: string | null
          article_published_date_cse: string | null
          formatted_url_cse: string | null
          html_formatted_url_cse: string | null
          full_pagemap_cse: Json | null
          restaurant_name_searched_cse: string | null
          location_searched_cse: string | null
          input_google_place_id_cse_search: string | null
          input_source_url_cse_trigger: string | null
          search_timestamp_cse: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          restaurant_id: string
          url: string
          title?: string | null
          html_title_cse?: string | null
          snippet_text_cse?: string | null
          publication_cse?: string | null
          domain_cse?: string | null
          og_description_cse?: string | null
          article_published_date_cse?: string | null
          formatted_url_cse?: string | null
          html_formatted_url_cse?: string | null
          full_pagemap_cse?: Json | null
          restaurant_name_searched_cse?: string | null
          location_searched_cse?: string | null
          input_google_place_id_cse_search?: string | null
          input_source_url_cse_trigger?: string | null
          search_timestamp_cse?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          restaurant_id?: string
          url?: string
          title?: string | null
          html_title_cse?: string | null
          snippet_text_cse?: string | null
          publication_cse?: string | null
          domain_cse?: string | null
          og_description_cse?: string | null
          article_published_date_cse?: string | null
          formatted_url_cse?: string | null
          html_formatted_url_cse?: string | null
          full_pagemap_cse?: Json | null
          restaurant_name_searched_cse?: string | null
          location_searched_cse?: string | null
          input_google_place_id_cse_search?: string | null
          input_source_url_cse_trigger?: string | null
          search_timestamp_cse?: string | null
        }
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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
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
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
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
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
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
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
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
