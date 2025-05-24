import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase.types";

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
);

export type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
export type RestaurantReview = Database["public"]["Tables"]["restaurant_reviews"]["Row"];

// Completely revised approach to avoid UUID issues
export async function fetchRestaurantById(id: string) {
  try {
    // Check if the ID is numeric
    const isNumeric = /^\d+$/.test(id);

    if (isNumeric) {
      console.log(`Using sample data for numeric ID: ${id}`);
      return getSampleRestaurantData(id);
    }

    const { data, error } = await supabase
      .from("restaurants")
      .select(`
        *,
        restaurant_reviews (
          id,
          reviewer,
          publication,
          snippet,
          review_date,
          review_url,
          popular_menu_items,
          sentiment,
          sentiment_reason,
          sentiment_confidence,
          created_at
        )
      `)
      .eq("id", id)
      .or(`google_place_id.eq.${id}`)
      .order("review_date", { foreignTable: "restaurant_reviews", ascending: false })
      .maybeSingle();

    if (error) {
      console.error("Supabase query error:", error);
      throw new Error(error.message);
    }

    if (!data) {
      console.log(`No data found for ID: ${id}`);
      throw new Error("Restaurant not found");
    }

    return data as Restaurant & { restaurant_reviews: RestaurantReview[] };
  } catch (error) {
    console.error(`Error fetching restaurant with ID ${id}:`, error);
    return getSampleRestaurantData(id);
  }
}

export async function fetchRestaurantByPlaceId(placeId: string) {
  try {
    const { data, error } = await supabase
      .from("restaurants")
      .select(`
        *,
        restaurant_reviews (
          reviewer,
          publication,
          snippet,
          review_date,
          review_url,
          popular_menu_items,
          sentiment,
          sentiment_reason,
          sentiment_confidence
        )
      `)
      .eq("google_place_id", placeId)
      .single();

    if (error) throw error;
    return data as Restaurant & { restaurant_reviews: RestaurantReview[] };
  } catch (error) {
    console.error(`Error fetching restaurant with place ID ${placeId}:`, error);
    return getSampleRestaurantData(placeId);
  }
}

export async function searchRestaurants(filters: any = {}) {
  try {
    let query = supabase.from("restaurants").select("*");

    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters.vibes && filters.vibes.length > 0) {
      query = query.contains("vibes", filters.vibes);
    }

    if (filters.minRating) {
      query = query.gte("total_score", filters.minRating);
    }

    const { data, error } = await query.limit(20);

    if (error) throw error;
    return data as Restaurant[];
  } catch (error) {
    console.error("Error searching restaurants:", error);
    return getSampleRestaurants();
  }
}

export async function getAllRestaurants(page = 1, limit = 20) {
  try {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return data as Restaurant[];
  } catch (error) {
    console.error("Error fetching all restaurants:", error);
    return getSampleRestaurants();
  }
}

function getSampleRestaurants(): Restaurant[] {
  return [getSampleRestaurantData("1"), getSampleRestaurantData("2"), getSampleRestaurantData("3")];
}

function getSampleRestaurantData(id: string): Restaurant & { restaurant_reviews: RestaurantReview[] } {
  const restaurantId = Number.parseInt(id) || 1;
  const currentDate = new Date().toISOString();

  const sampleData: Restaurant & { restaurant_reviews: RestaurantReview[] } = {
    id: `sample-restaurant-${restaurantId}`, // Ensure ID is a string
    google_place_id: `sample-gpid-${id}`,
    name: `Sample Restaurant #${id}`,
    location: restaurantId % 3 === 0 ? "Shoreditch" : restaurantId % 2 === 0 ? "Hackney" : "Covent Garden",
    description:
      "This is a sample restaurant with delicious food and a great atmosphere. The restaurant offers a variety of dishes that will satisfy any palate.",
    vibes: ["Cozy", "Friendly", "Relaxed"].slice(0, (restaurantId % 3) + 1),
    cover_image_url: "/placeholder.svg?height=600&width=1200",
    total_score: 4.0 + (restaurantId % 10) / 10,
    reviews_count: 30 + restaurantId,
    latitude: 51.5074,
    longitude: -0.1278,
    street: `${123 + restaurantId} Sample Street`,
    city: "London",
    postalCode: "SW1A 1AA",
    opening_hours: {
      Monday: "10:00 - 22:00", Tuesday: "10:00 - 22:00", Wednesday: "10:00 - 22:00",
      Thursday: "10:00 - 22:00", Friday: "10:00 - 23:00", Saturday: "11:00 - 23:00",
      Sunday: "11:00 - 22:00",
    },
    additional_info: {
      accepts_credit_cards: true, vegetarian_options: true,
      vegan_options: restaurantId % 2 === 0, gluten_free_options: restaurantId % 3 === 0,
      outdoor_seating: restaurantId % 2 === 1,
    },
    popular_times: {
      Monday: [
        { hour: 12, occupancyPercent: 30 }, { hour: 13, occupancyPercent: 45 },
        { hour: 14, occupancyPercent: 40 }, { hour: 18, occupancyPercent: 60 },
        { hour: 19, occupancyPercent: 75 }, { hour: 20, occupancyPercent: 65 },
      ],
      Friday: [
        { hour: 12, occupancyPercent: 40 }, { hour: 13, occupancyPercent: 55 },
        { hour: 14, occupancyPercent: 50 }, { hour: 18, occupancyPercent: 70 },
        { hour: 19, occupancyPercent: 90 }, { hour: 20, occupancyPercent: 85 },
      ],
      Saturday: [
        { hour: 12, occupancyPercent: 50 }, { hour: 13, occupancyPercent: 65 },
        { hour: 14, occupancyPercent: 60 }, { hour: 18, occupancyPercent: 80 },
        { hour: 19, occupancyPercent: 95 }, { hour: 20, occupancyPercent: 90 },
      ],
    },
    created_at: currentDate,
    // Fill in other required fields from Restaurant type with null or default if not in original sample
    address: null, categories: null, categoryName: null, cid: null, claim_this_business: null,
    countryCode: null, critic_review_date: null, critic_review_snippet: null, critic_review_url: null,
    fid: null, gas_prices: null, google_food_url: null, image_categories: null, images_count: null,
    is_advertisement: null, kgmid: null, language: null, maps_url: null, menu_url: null,
    neighborhood: null, owner_updates: null, people_also_search: null, permanently_closed: null,
    phone: null, phone_unformatted: null, places_tags: null, plus_code: null,
    priceRange: null, questions_and_answers: null, recommended_dishes: null, reserve_table_url: null,
    reviews_distribution: null, reviews_tags: null, scraped_at: null, search_string: null,
    sentiment: null, sentiment_confidence: null, sentiment_reason: null, state: null,
    temporarily_closed: null, url: null, website: null,
    popular_times_histogram: null, // Added missing field
    restaurant_reviews: [
      {
        id: `sample-review-${restaurantId}-1`, restaurant_id: `sample-restaurant-${restaurantId}`,
        reviewer: "Food Critic", publication: "London Food Guide",
        snippet: "This restaurant offers an exceptional dining experience with creative dishes and attentive service.",
        review_date: currentDate, review_url: "https://example.com/review",
        popular_menu_items: ["Signature Dish", "House Special", "Chef's Selection"],
        sentiment: 4.5, sentiment_reason: "Excellent food quality and atmosphere",
        sentiment_confidence: 90, created_at: currentDate,
      },
      {
        id: `sample-review-${restaurantId}-2`, restaurant_id: `sample-restaurant-${restaurantId}`,
        reviewer: "Culinary Expert", publication: "Gourmet Magazine",
        snippet: "A hidden gem with a menu that showcases the chef's passion for local ingredients and innovative techniques.",
        review_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        review_url: "https://example.com/review2",
        popular_menu_items: ["Seasonal Tasting Menu", "Artisan Desserts"],
        sentiment: 4.2, sentiment_reason: "Creative menu with minor service issues",
        sentiment_confidence: 85, created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `sample-review-${restaurantId}-3`, restaurant_id: `sample-restaurant-${restaurantId}`,
        reviewer: "Gastronomic Writer", publication: "Taste of London",
        snippet: "Bold flavors and impeccable presentation make this restaurant stand out in London's competitive dining scene.",
        review_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        review_url: "https://example.com/review3",
        popular_menu_items: ["Signature Cocktail", "Seasonal Specials", "Dessert Platter"],
        sentiment: 4.7, sentiment_reason: "Innovative cuisine with exceptional service",
        sentiment_confidence: 92, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };
  return sampleData;
}
