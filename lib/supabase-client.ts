import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase.types"

// Create a single Supabase client instance to be reused
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      fetch: (...args) => fetch(...args),
    },
  },
)

export type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"]
export type GoogleUserReview = Database["public"]["Tables"]["google_user_reviews"]["Row"]
export type CriticReview = Database["public"]["Tables"]["critic_reviews"]["Row"]
export type CSEReviewSnippet = Database["public"]["Tables"]["cse_review_snippets"]["Row"]

// Combined restaurant type with all related reviews
export type RestaurantWithReviews = Restaurant & {
  google_user_reviews: GoogleUserReview[]
  critic_reviews: CriticReview[]
  cse_review_snippets: CSEReviewSnippet[]
}

// Simple rate limiting mechanism
const requestQueue: { [key: string]: number } = {}
const MIN_REQUEST_INTERVAL = 500 // ms between requests

// Helper function to wait for a specified time
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Helper function to handle rate limiting
async function rateLimit(key: string): Promise<void> {
  const now = Date.now()
  const lastRequest = requestQueue[key] || 0
  const timeToWait = Math.max(0, lastRequest + MIN_REQUEST_INTERVAL - now)

  if (timeToWait > 0) {
    console.log(`Rate limiting: waiting ${timeToWait}ms before next request to ${key}`)
    await wait(timeToWait)
  }

  requestQueue[key] = Date.now()
}

// Fetch restaurant by ID or Google Place ID
export async function fetchRestaurantById(id: string): Promise<RestaurantWithReviews> {
  try {
    await rateLimit("fetchRestaurantById")

    let retries = 0
    const maxRetries = 3

    while (retries < maxRetries) {
      try {
        // First try to find by UUID
        let query = supabase
          .from("restaurants")
          .select(`
            *,
            google_user_reviews (*),
            critic_reviews (*),
            cse_review_snippets (*)
          `)
          .eq("id", id)

        let { data, error } = await query.maybeSingle()

        // If not found by UUID, try by Google Place ID
        if (!data && !error) {
          await rateLimit("fetchRestaurantByPlaceId")

          query = supabase
            .from("restaurants")
            .select(`
              *,
              google_user_reviews (*),
              critic_reviews (*),
              cse_review_snippets (*)
            `)
            .eq("google_place_id", id)

          const result = await query.maybeSingle()
          data = result.data
          error = result.error
        }

        if (error) {
          console.error("Supabase query error:", error)
          throw new Error(error.message)
        }

        if (!data) {
          console.log(`No restaurant found for ID: ${id}`)
          throw new Error("Restaurant not found")
        }

        return data as RestaurantWithReviews
      } catch (error: any) {
        retries++

        // Check if it's a rate limit error
        if (error.message && error.message.includes("Too Many Requests")) {
          console.log(`Rate limit hit, retrying in ${retries * 1000}ms (attempt ${retries}/${maxRetries})`)
          await wait(retries * 1000) // Exponential backoff
        } else {
          // Not a rate limit error, just throw it
          console.error(`Error fetching restaurant with ID ${id} (attempt ${retries}/${maxRetries}):`, error)
          throw error
        }
      }
    }

    throw new Error(`Failed to fetch restaurant with ID ${id} after ${maxRetries} retries`)
  } catch (error) {
    console.error(`Error fetching restaurant with ID ${id}:`, error)
    // Return sample data as fallback
    return getSampleRestaurantData(id)
  }
}

// Get total count of restaurants - REMOVED FILTER TO SHOW ALL 875
export async function getRestaurantCount(): Promise<number> {
  try {
    await rateLimit("getRestaurantCount")

    const { count, error } = await supabase.from("restaurants").select("*", { count: "exact", head: true })

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error("Error getting restaurant count:", error)
    return 0
  }
}

// Search restaurants with filters and pagination - REMOVED CLOSED FILTER
export async function searchRestaurants(
  filters: {
    location?: string
    vibes?: string[]
    priceRange?: string
    minRating?: number
    searchTerm?: string
    page?: number
    limit?: number
    includeClosed?: boolean
  } = {},
): Promise<{ restaurants: Restaurant[]; totalCount: number }> {
  try {
    await rateLimit("searchRestaurants")

    const page = filters.page || 1
    const limit = filters.limit || 24 // Reduced from 50 to avoid rate limits

    let query = supabase.from("restaurants").select("*", { count: "exact" })

    // Apply search term filter
    if (filters.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,description_gmaps.ilike.%${filters.searchTerm}%`)
    }

    // Apply location filter
    if (filters.location) {
      query = query.or(
        `city_gmaps.ilike.%${filters.location}%,neighborhood_gmaps.ilike.%${filters.location}%,location_description_gmaps.ilike.%${filters.location}%`,
      )
    }

    // Apply vibes filter
    if (filters.vibes && filters.vibes.length > 0) {
      query = query.overlaps("vibes_gmaps", filters.vibes)
    }

    // Apply price range filter
    if (filters.priceRange) {
      query = query.eq("price_range_gmaps", filters.priceRange)
    }

    // Apply minimum rating filter
    if (filters.minRating) {
      query = query.gte("total_score_gmaps", filters.minRating)
    }

    // Only filter out closed restaurants if specifically requested
    if (!filters.includeClosed && filters.includeClosed !== undefined) {
      query = query.neq("permanently_closed_gmaps", true)
    }

    // Order by rating and review count
    query = query.order("total_score_gmaps", { ascending: false, nullsLast: true })

    // Apply pagination
    query = query.range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("Supabase search error:", error)
      throw error
    }

    return {
      restaurants: data as Restaurant[],
      totalCount: count || 0,
    }
  } catch (error) {
    console.error("Error searching restaurants:", error)
    // Return empty results instead of throwing
    return {
      restaurants: [],
      totalCount: 0,
    }
  }
}

// Get all restaurants with pagination - REMOVED CLOSED FILTER TO SHOW ALL 875
export async function getAllRestaurants(
  page = 1,
  limit = 24, // Reduced from 50 to avoid rate limits
): Promise<{ restaurants: Restaurant[]; totalCount: number }> {
  try {
    await rateLimit("getAllRestaurants")

    // Add retry logic for rate limiting
    let retries = 0
    const maxRetries = 3

    while (retries < maxRetries) {
      try {
        const { data, error, count } = await supabase
          .from("restaurants")
          .select("*", { count: "exact" })
          .order("total_score_gmaps", { ascending: false, nullsLast: true })
          .range((page - 1) * limit, page * limit - 1)

        if (error) throw error

        console.log(`Loaded ${data?.length || 0} restaurants on page ${page}, total count: ${count}`)

        return {
          restaurants: data as Restaurant[],
          totalCount: count || 0,
        }
      } catch (error: any) {
        retries++

        // Check if it's a rate limit error
        if (error.message && error.message.includes("Too Many Requests")) {
          console.log(`Rate limit hit, retrying in ${retries * 1000}ms (attempt ${retries}/${maxRetries})`)
          await wait(retries * 1000) // Exponential backoff
        } else {
          // Not a rate limit error, just throw it
          throw error
        }
      }
    }

    throw new Error(`Failed to fetch restaurants after ${maxRetries} retries`)
  } catch (error) {
    console.error("Error fetching all restaurants:", error)
    // Return empty results instead of throwing
    return {
      restaurants: [],
      totalCount: 0,
    }
  }
}

// Get ALL restaurants without pagination - REMOVED CLOSED FILTER
export async function getAllRestaurantsNoPagination(): Promise<Restaurant[]> {
  try {
    await rateLimit("getAllRestaurantsNoPagination")

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("total_score_gmaps", { ascending: false, nullsLast: true })

    if (error) throw error

    console.log(`Loaded ALL ${data?.length || 0} restaurants without pagination`)
    return data as Restaurant[]
  } catch (error) {
    console.error("Error fetching all restaurants without pagination:", error)
    return []
  }
}

// Get featured restaurants (high-rated restaurants)
export async function getFeaturedRestaurants(limit = 6): Promise<Restaurant[]> {
  try {
    await rateLimit("getFeaturedRestaurants")

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .gte("total_score_gmaps", 4.5)
      .gte("reviews_count_gmaps", 50)
      .neq("permanently_closed_gmaps", true) // Keep this filter for featured restaurants
      .order("total_score_gmaps", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as Restaurant[]
  } catch (error) {
    console.error("Error fetching featured restaurants:", error)
    return []
  }
}

// Get trending restaurants (recently added or updated)
export async function getTrendingRestaurants(limit = 6): Promise<Restaurant[]> {
  try {
    await rateLimit("getTrendingRestaurants")

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .neq("permanently_closed_gmaps", true) // Keep this filter for trending restaurants
      .order("updated_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as Restaurant[]
  } catch (error) {
    console.error("Error fetching trending restaurants:", error)
    return []
  }
}

// Sample data function for fallback
function getSampleRestaurantData(id: string): RestaurantWithReviews {
  const restaurantId = `sample-restaurant-${id}`
  const currentDate = new Date().toISOString()

  const sampleData: RestaurantWithReviews = {
    id: restaurantId,
    created_at: currentDate,
    updated_at: currentDate,
    google_place_id: `sample-gpid-${id}`,
    name: `Sample Restaurant #${id}`,
    sub_title: null,
    location_description_gmaps: "Central London",
    description_gmaps:
      "This is a sample restaurant with delicious food and a great atmosphere. The restaurant offers a variety of dishes that will satisfy any palate.",
    price_range_gmaps: "££",
    category_name_gmaps: "Restaurant",
    categories_gmaps: ["Restaurant", "Food"],
    address_gmaps: `${123 + Number(id)} Sample Street, London`,
    neighborhood_gmaps: Number(id) % 3 === 0 ? "Shoreditch" : Number(id) % 2 === 0 ? "Hackney" : "Covent Garden",
    street_gmaps: `${123 + Number(id)} Sample Street`,
    city_gmaps: "London",
    restaurant_state_gmaps: "England",
    postal_code_gmaps: "SW1A 1AA",
    country_code_gmaps: "GB",
    phone_gmaps: "+44 20 7946 0958",
    phone_unformatted_gmaps: "02079460958",
    website_gmaps: `https://sample-restaurant-${id}.com`,
    menu_url_gmaps: `https://maps.google.com/search/sample-restaurant-${id}`,
    latitude_gmaps: 51.5074,
    longitude_gmaps: -0.1278,
    plus_code_gmaps: "9C3XGV8C+2V",
    located_in_gmaps: "London",
    total_score_gmaps: 4.0 + (Number(id) % 10) / 10,
    reviews_count_gmaps: 30 + Number(id),
    reviews_distribution_gmaps: {
      fiveStar: 20,
      fourStar: 8,
      threeStar: 2,
      twoStar: 1,
      oneStar: 0,
    },
    permanently_closed_gmaps: false,
    temporarily_closed_gmaps: false,
    claim_this_business_gmaps: false,
    is_advertisement_gmaps: false,
    opening_hours_gmaps: {
      Monday: "10:00 - 22:00",
      Tuesday: "10:00 - 22:00",
      Wednesday: "10:00 - 22:00",
      Thursday: "10:00 - 22:00",
      Friday: "10:00 - 23:00",
      Saturday: "11:00 - 23:00",
      Sunday: "11:00 - 22:00",
    },
    additional_opening_hours_gmaps: null,
    opening_hours_confirmation_text_gmaps: null,
    popular_times_live_text_gmaps: "Usually busy",
    popular_times_live_percent_gmaps: 75,
    popular_times_histogram_gmaps: null,
    cover_image_url_gmaps: "/placeholder.svg?height=600&width=1200",
    image_urls_gmaps: ["/placeholder.svg?height=400&width=600"],
    images_count_gmaps: 1,
    image_categories_gmaps: ["Food", "Interior"],
    raw_google_images_data_gmaps: null,
    people_also_search_gmaps: null,
    places_tags_gmaps: null,
    reviews_tags_gmaps: null,
    additional_info_gmaps: null,
    vibes_gmaps: ["Cozy", "Friendly", "Relaxed"].slice(0, (Number(id) % 3) + 1),
    gas_prices_gmaps: null,
    questions_and_answers_gmaps: null,
    owner_updates_gmaps: null,
    updates_from_customers_gmaps: null,
    hotel_stars_gmaps: null,
    hotel_description_gmaps: null,
    check_in_date_gmaps: null,
    check_out_date_gmaps: null,
    similar_hotels_nearby_gmaps: null,
    hotel_review_summary_gmaps: null,
    hotel_ads_gmaps: null,
    reserve_table_url_gmaps: `https://sample-restaurant-${id}.com/reservations`,
    table_reservation_links_gmaps: null,
    booking_links_gmaps: null,
    order_by_gmaps: null,
    restaurant_data_gmaps: null,
    google_food_url_gmaps: null,
    user_place_note_gmaps: null,
    web_results_gmaps: null,
    leads_enrichment_gmaps: null,
    language_gmaps: "en",
    search_string_gmaps: `sample restaurant ${id}`,
    gmaps_scraped_at: currentDate,
    gmaps_scrape_input_name: `Sample Restaurant ${id}`,
    gmaps_scrape_input_location: "London",
    gmaps_scrape_trigger_url: null,
    kgmid: null,
    fid: null,
    cid: null,
    // Related reviews (empty for sample data)
    google_user_reviews: [],
    critic_reviews: [],
    cse_review_snippets: [],
  }

  return sampleData
}
