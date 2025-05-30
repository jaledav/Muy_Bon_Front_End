BEGIN;

-- Enable UUID generator
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Alternative if gen_random_uuid() is not preferred

------------------------------------------------------------
-- 1️⃣  Restaurants (Mainly from Google Maps Scrapes)
------------------------------------------------------------
DROP TABLE IF EXISTS restaurants CASCADE;
CREATE TABLE restaurants (
  id                                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                              timestamptz DEFAULT now(),
  updated_at                              timestamptz DEFAULT now(), -- For tracking updates

  -- Core Google Identifiers & Data
  google_place_id                         text UNIQUE NOT NULL,
  kgmid                                   text,
  fid                                     text,
  cid                                     text,
  name                                    text, -- "title" from Google JSON
  sub_title                               text, -- "subTitle" from Google JSON
  location_description_gmaps              text, -- General location text if available, or "address"
  description_gmaps                       text, -- "description" from Google JSON
  price_range_gmaps                       text, -- "price" from Google JSON
  category_name_gmaps                     text, -- "categoryName" from Google JSON
  categories_gmaps                        text[], -- "categories" from Google JSON
  address_gmaps                           text, -- "address" from Google JSON
  neighborhood_gmaps                      text, -- "neighborhood" from Google JSON
  street_gmaps                            text, -- "street" from Google JSON
  city_gmaps                              text, -- "city" from Google JSON
  restaurant_state_gmaps                  text, -- "state" from Google JSON (quoted if "state" is keyword)
  postal_code_gmaps                       text, -- "postalCode" from Google JSON
  country_code_gmaps                      text, -- "countryCode" from Google JSON
  phone_gmaps                             text, -- "phone" from Google JSON
  phone_unformatted_gmaps                 text, -- "phoneUnformatted" from Google JSON
  website_gmaps                           text, -- "website" from Google JSON
  menu_url_gmaps                          text, -- "menu" from Google JSON
  maps_search_url_gmaps                   text, -- "url" (search URL) from Google JSON
  latitude_gmaps                          numeric, -- "location.lat"
  longitude_gmaps                         numeric, -- "location.lng"
  plus_code_gmaps                         text, -- "plusCode"
  located_in_gmaps                        text, -- "locatedIn"
  
  -- Ratings & Counts from Google
  total_score_gmaps                       numeric(4,2), -- "totalScore"
  reviews_count_gmaps                     int, -- "reviewsCount"
  reviews_distribution_gmaps              jsonb, -- "reviewsDistribution"
  
  -- Status & Flags from Google
  permanently_closed_gmaps                boolean, -- "permanentlyClosed"
  temporarily_closed_gmaps                boolean, -- "temporarilyClosed"
  claim_this_business_gmaps               boolean, -- "claimThisBusiness"
  is_advertisement_gmaps                  boolean, -- "isAdvertisement"

  -- Timings & Hours from Google
  opening_hours_gmaps                     jsonb, -- "openingHours"
  additional_opening_hours_gmaps          jsonb, -- "additionalOpeningHours"
  opening_hours_confirmation_text_gmaps   text,  -- "openingHoursBusinessConfirmationText"
  popular_times_live_text_gmaps           text,
  popular_times_live_percent_gmaps        int,
  popular_times_histogram_gmaps           jsonb, -- "popularTimesHistogram"

  -- Images from Google
  cover_image_url_gmaps                   text, -- "imageUrl"
  image_urls_gmaps                        text[], -- "imageUrls"
  images_count_gmaps                      int, -- "imagesCount"
  image_categories_gmaps                  text[], -- "imageCategories"
  raw_google_images_data_gmaps            jsonb, -- "images" (if it contains structured data)

  -- Other Google Data (mostly JSONB)
  people_also_search_gmaps                jsonb, -- "peopleAlsoSearch"
  places_tags_gmaps                       jsonb, -- "placesTags"
  reviews_tags_gmaps                      jsonb, -- "reviewsTags" (user review keyword tags)
  additional_info_gmaps                   jsonb, -- "additionalInfo" (amenities, service options etc.)
  -- Derived from additional_info_gmaps.Atmosphere
  vibes_gmaps                             text[], 
  gas_prices_gmaps                        jsonb, -- "gasPrices"
  questions_and_answers_gmaps             jsonb, -- "questionsAndAnswers"
  owner_updates_gmaps                     jsonb, -- "ownerUpdates"
  updates_from_customers_gmaps            jsonb, -- "updatesFromCustomers"
  
  -- Hotel Specific Data from Google (if applicable, consider grouping into one JSONB if rarely used)
  hotel_stars_gmaps                       text,
  hotel_description_gmaps                 text,
  check_in_date_gmaps                     text, -- Or date type if format is consistent
  check_out_date_gmaps                    text, -- Or date type if format is consistent
  similar_hotels_nearby_gmaps             jsonb,
  hotel_review_summary_gmaps              jsonb,
  hotel_ads_gmaps                         jsonb,

  -- Links & Misc from Google
  reserve_table_url_gmaps                 text, -- "reserveTableUrl" (direct)
  table_reservation_links_gmaps           jsonb, -- "tableReservationLinks" (array)
  booking_links_gmaps                     jsonb, -- "bookingLinks" (array)
  order_by_gmaps                          jsonb, -- "orderBy" (array)
  restaurant_data_gmaps                   jsonb, -- "restaurantData" (contains provider info)
  google_food_url_gmaps                   text, -- "googleFoodUrl"
  user_place_note_gmaps                   text, -- "userPlaceNote"
  web_results_gmaps                       jsonb, -- "webResults"
  leads_enrichment_gmaps                  jsonb, -- "leadsEnrichment"
  language_gmaps                          text, -- "language"
  search_string_gmaps                     text, -- "searchString" (how it was found by scraper)
  
  -- Scrape Metadata
  gmaps_scraped_at                        timestamptz, -- "scrapedAt"
  gmaps_scrape_input_name                 text, -- "_input_restaurant_name"
  gmaps_scrape_input_location             text, -- "_input_location"
  gmaps_scrape_trigger_url                text  -- "_input_source_url" (e.g., Hot Dinners URL that led to this scrape)
);

-- Insert sample data into the restaurants table
INSERT INTO restaurants (google_place_id, name, sub_title, location_description_gmaps, description_gmaps, price_range_gmaps, category_name_gmaps, categories_gmaps, address_gmaps, neighborhood_gmaps, street_gmaps, city_gmaps, restaurant_state_gmaps, postal_code_gmaps, country_code_gmaps, phone_gmaps, phone_unformatted_gmaps, website_gmaps, menu_url_gmaps, maps_search_url_gmaps, latitude_gmaps, longitude_gmaps, plus_code_gmaps, located_in_gmaps, total_score_gmaps, reviews_count_gmaps, reviews_distribution_gmaps, permanently_closed_gmaps, temporarily_closed_gmaps, claim_this_business_gmaps, is_advertisement_gmaps, opening_hours_gmaps, additional_opening_hours_gmaps, opening_hours_confirmation_text_gmaps, popular_times_live_text_gmaps, popular_times_live_percent_gmaps, popular_times_histogram_gmaps, cover_image_url_gmaps, image_urls_gmaps, images_count_gmaps, image_categories_gmaps, raw_google_images_data_gmaps, people_also_search_gmaps, places_tags_gmaps, reviews_tags_gmaps, additional_info_gmaps, vibes_gmaps, gas_prices_gmaps, questions_and_answers_gmaps, owner_updates_gmaps, updates_from_customers_gmaps, hotel_stars_gmaps, hotel_description_gmaps, check_in_date_gmaps, check_out_date_gmaps, similar_hotels_nearby_gmaps, hotel_review_summary_gmaps, hotel_ads_gmaps, reserve_table_url_gmaps, table_reservation_links_gmaps, booking_links_gmaps, order_by_gmaps, restaurant_data_gmaps, google_food_url_gmaps, user_place_note_gmaps, web_results_gmaps, leads_enrichment_gmaps, language_gmaps, search_string_gmaps, gmaps_scraped_at, gmaps_scrape_input_name, gmaps_scrape_input_location, gmaps_scrape_trigger_url)
VALUES
('ChIJU3xXv-uYpZERzX_Y_Y_Y_Y_Y', 'The Great Grub', 'Delicious Food', 'Downtown', 'A place with great food and vibes.', '$$', 'Restaurant', '{"Restaurant", "American"}', '123 Main St, Anytown, CA 91234', 'Downtown', 'Main St', 'Anytown', 'CA', '91234', 'US', '555-123-4567', '5551234567', 'http://www.greatgrub.com', 'http://www.greatgrub.com/menu', 'https://maps.google.com/?q=The+Great+Grub', 34.0522, -118.2437, '8QJ7+22 Anytown', NULL, 4.5, 150, '{}', FALSE, FALSE, FALSE, FALSE, '{}', NULL, NULL, NULL, NULL, NULL, 'http://www.greatgrub.com/cover.jpg', '{"http://www.greatgrub.com/img1.jpg", "http://www.greatgrub.com/img2.jpg"}', 2, '{"Food", "Interior"}', NULL, NULL, NULL, NULL, NULL, '{"Casual", "Lively"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'The Great Grub Anytown', NOW(), 'The Great Grub', 'Anytown', NULL),
('ChIJU3xXv-uYpZERzX_Y_Y_Y_Y_Z', 'Pasta Paradise', 'Italian Cuisine', 'Uptown', 'Authentic Italian dishes.', '$$$', 'Italian Restaurant', '{"Restaurant", "Italian"}', '456 Oak Ave, Anytown, CA 91234', 'Uptown', 'Oak Ave', 'Anytown', 'CA', '91234', 'US', '555-987-6543', '5559876543', 'http://www.pastaparadise.com', 'http://www.pastaparadise.com/menu', 'https://maps.google.com/?q=Pasta+Paradise', 34.0600, -118.2500, '8QJ7+44 Anytown', NULL, 4.2, 90, '{}', FALSE, FALSE, FALSE, FALSE, '{}', NULL, NULL, NULL, NULL, NULL, 'http://www.pastaparadise.com/cover.jpg', '{"http://www.pastaparadise.com/img1.jpg"}', 1, '{"Food"}', NULL, NULL, NULL, NULL, NULL, '{"Romantic", "Quiet"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pasta Paradise Anytown', NOW(), 'Pasta Paradise', 'Anytown', NULL);

CREATE INDEX IF NOT EXISTS idx_restaurants_google_place_id ON restaurants (google_place_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_name ON restaurants (name); -- For searching by name
CREATE INDEX IF NOT EXISTS idx_restaurants_location_gmaps ON restaurants USING GIN (to_tsvector('english', city_gmaps || ' ' || neighborhood_gmaps || ' ' || postal_code_gmaps));


------------------------------------------------------------
-- 2️⃣ Google User Reviews (from Google Maps Scrapes)
------------------------------------------------------------
DROP TABLE IF EXISTS google_user_reviews CASCADE;
CREATE TABLE google_user_reviews (
  id                                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id                     uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  gmaps_review_id                   text NOT NULL, -- "reviewId" from Google JSON
  created_at                        timestamptz DEFAULT now(),
  
  reviewer_id_gmaps                 text,    -- "reviewerId"
  reviewer_name_gmaps               text,    -- "name"
  reviewer_url_gmaps                text,    -- "reviewerUrl"
  reviewer_photo_url_gmaps          text,    -- "reviewerPhotoUrl"
  reviewer_num_reviews_gmaps        int,     -- "reviewerNumberOfReviews"
  is_local_guide_gmaps              boolean, -- "isLocalGuide"
  
  review_text_gmaps                 text,    -- "text"
  review_text_translated_gmaps      text,    -- "textTranslated"
  published_at_text_gmaps           text,    -- "publishAt" (e.g., "3 hours ago")
  published_at_date_gmaps           timestamptz, -- "publishedAtDate"
  stars_gmaps                       int,     -- "stars"
  likes_count_gmaps                 int,     -- "likesCount"
  review_url_gmaps                  text,    -- "reviewUrl"
  review_origin_gmaps               text,    -- "reviewOrigin"
  
  response_from_owner_text_gmaps    text,    -- "responseFromOwnerText"
  response_from_owner_date_gmaps    timestamptz, -- "responseFromOwnerDate"
  
  image_urls_gmaps                  text[],  -- "reviewImageUrls"
  context_gmaps                     jsonb,   -- "reviewContext"
  detailed_rating_gmaps             jsonb,   -- "reviewDetailedRating"
  visited_in_gmaps                  text,    -- "visitedIn"
  original_language_gmaps           text,    -- "originalLanguage"
  translated_language_gmaps         text,    -- "translatedLanguage"
  
  gmaps_profile_scraped_at          timestamptz NOT NULL -- When the parent restaurant profile (and this review) was scraped
);

CREATE INDEX IF NOT EXISTS idx_guserreviews_restaurant_id ON google_user_reviews (restaurant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_guserreviews_unique_review ON google_user_reviews (restaurant_id, gmaps_review_id);


------------------------------------------------------------
-- 3️⃣ Critic Reviews (from Full Scraped Reviews - Data Source 2)
------------------------------------------------------------
DROP TABLE IF EXISTS critic_reviews CASCADE;
CREATE TABLE critic_reviews (
  id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                      timestamptz DEFAULT now(),
  updated_at                      timestamptz DEFAULT now(),
  
  -- Link to restaurants table. This assumes the restaurant entry is created/found first.
  restaurant_id                   uuid REFERENCES restaurants(id) ON DELETE SET NULL, -- Nullable if GID match fails initially
  
  -- Information from the review source itself
  restaurant_name_critic_source   text,   -- "restaurant_name" from critic review JSON
  location_critic_source          text,   -- "location" from critic review JSON
  summary_critic                  text,   -- "summary" from critic review JSON
  reviewer_critic                 text,   -- "reviewer"
  publication_critic              text,   -- "publication"
  vibe_critic                     text[], -- "vibe" (can be a single string, stored as array)
  sentiment_critic                text,   -- "sentiment" (e.g., "Positive", "Negative")
  sentiment_reason_critic         text,   -- "sentiment_reason"
  sentiment_confidence_critic     text,   -- "sentiment_confidence" (e.g., "High", "Medium")
  review_snippet_critic           text,   -- "review_snippet"
  popular_menu_items_critic       text[], -- "popular_menu_items"
  other_details_critic            text,   -- "other"
  review_date_critic              date,   -- "date" (parsed from YYYY-MM-DD)
  review_url_critic               text UNIQUE NOT NULL, -- "URL"
  
  -- Data quality & linking info from processing the critic review
  needs_manual_review_dq          boolean,      -- "needs_review"
  google_place_id_from_critic_src text,         -- "google_place_id" found/associated with this critic review
  google_place_name_api_dq        text,         -- "google_place_name_api"
  name_match_score_to_google_dq   integer,      -- "name_match_score_to_google"
  place_id_confidence_dq          text,         -- "place_id_confidence"
  review_processing_reasons_dq    text[]        -- "review_reasons"
);

CREATE INDEX IF NOT EXISTS idx_critic_reviews_restaurant_id ON critic_reviews (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_critic_reviews_review_url ON critic_reviews (review_url_critic);
CREATE INDEX IF NOT EXISTS idx_critic_reviews_google_place_id ON critic_reviews (google_place_id_from_critic_src);


------------------------------------------------------------
-- 4️⃣ Review Snippets (from Google CSE - Data Source 3)
------------------------------------------------------------
DROP TABLE IF EXISTS cse_review_snippets CASCADE;
CREATE TABLE cse_review_snippets (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                    timestamptz DEFAULT now(),
  
  -- Link to restaurants table. Derived from input_google_place_id_cse_search.
  restaurant_id                 uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  
  -- Snippet URL Details
  url                           text UNIQUE NOT NULL, -- "link" from CSE result
  title                         text,                 -- "title" from CSE result
  html_title_cse                text,                 -- "htmlTitle" from CSE result
  snippet_text_cse              text,                 -- "snippet" from CSE result
  publication_cse               text,                 -- "og:site_name" from CSE result pagemap
  domain_cse                    text,                 -- "displayLink" from CSE result
  og_description_cse            text,                 -- "og:description" from CSE result pagemap
  article_published_date_cse    timestamptz,          -- "article:published_time" or "datecreated" from CSE result pagemap
  formatted_url_cse             text,                 -- "formattedUrl" from CSE result
  html_formatted_url_cse        text,                 -- "htmlFormattedUrl" from CSE result
  full_pagemap_cse              jsonb,                -- Store the whole pagemap for future use

  -- Metadata about the CSE search that yielded this snippet
  restaurant_name_searched_cse  text,                 -- "restaurant_name_searched" from parent JSON
);

------------------------------------------------------------
-- 5️⃣ User Profiles and Favorites
------------------------------------------------------------

-- Create a function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text,
  avatar_url text
);

-- Create favorites table for the many-to-many relationship between users and restaurants
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  UNIQUE(user_id, restaurant_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_restaurant_id ON favorites(restaurant_id);

-- Add RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Allow users to manage their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Handle updated_at timestamps
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

COMMIT;
