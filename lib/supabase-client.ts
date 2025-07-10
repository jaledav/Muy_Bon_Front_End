import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
  )
}

export const supabase = createClient<Database>(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

console.log("[Supabase Client] URL:", supabaseUrl)
console.log(
  "[Supabase Client] Anon Key (first 5 chars):",
  supabaseAnonKey ? supabaseAnonKey.substring(0, 5) + "..." : "N/A",
)

export type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"]
export type GoogleUserReview = Database["public"]["Tables"]["google_user_reviews"]["Row"]
export type CriticReview = Database["public"]["Tables"]["critic_reviews"]["Row"]
export type CSEReviewSnippet = Database["public"]["Tables"]["cse_review_snippets"]["Row"]

export type RestaurantWithReviews = Restaurant & {
  google_user_reviews: GoogleUserReview[]
  critic_reviews: CriticReview[]
  cse_review_snippets: CSEReviewSnippet[]
}

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
  const page = filters.page || 1
  const limit = filters.limit || 24
  const maxRetries = 3
  let retries = 0

  console.log("[searchRestaurants] Received filters:", JSON.stringify(filters, null, 2))

  while (retries < maxRetries) {
    try {
      if (retries > 0) {
        const delay = Math.pow(2, retries) * 1000
        console.log(
          `[searchRestaurants] Rate limit or error encountered. Retrying in ${delay / 1000}s (attempt ${retries + 1}/${maxRetries})`,
        )
        await wait(delay)
      }

      let query = supabase.from("restaurants").select("*", { count: "exact" })

      console.log("[searchRestaurants] Initial query object:", query)

      if (filters.searchTerm && filters.searchTerm.trim() !== "") {
        const searchTermPattern = `%${filters.searchTerm.trim()}%`
        console.log("[searchRestaurants] Applying searchTermPattern:", searchTermPattern)
        query = query.or(
          `name.ilike.${searchTermPattern},` +
            `description_gmaps.ilike.${searchTermPattern},` +
            `sub_title.ilike.${searchTermPattern},` +
            `category_name_gmaps.ilike.${searchTermPattern}`,
        )
      } else {
        console.log("[searchRestaurants] No searchTerm provided or it's empty.")
      }

      if (filters.location) {
        console.log("[searchRestaurants] Applying location filter:", filters.location)
        const locationPattern = `%${filters.location}%`
        query = query.or(
          `city_gmaps.ilike.${locationPattern},` +
            `neighborhood_gmaps.ilike.${locationPattern},` +
            `location_description_gmaps.ilike.${locationPattern}`,
        )
      }

      if (filters.vibes && filters.vibes.length > 0) {
        console.log("[searchRestaurants] Applying vibes filter:", filters.vibes)
        query = query.overlaps("vibes_gmaps", filters.vibes)
      }

      if (filters.priceRange) {
        console.log("[searchRestaurants] Applying priceRange filter:", filters.priceRange)
        query = query.eq("price_range_gmaps", filters.priceRange)
      }

      if (filters.minRating !== undefined && Number.isFinite(filters.minRating)) {
        console.log("[searchRestaurants] Applying minRating filter:", filters.minRating)
        query = query.gte("total_score_gmaps", filters.minRating)
      }

      if (filters.includeClosed !== true) {
        console.log("[searchRestaurants] Filtering out permanently closed restaurants.")
        query = query.neq("permanently_closed_gmaps", true)
      } else {
        console.log("[searchRestaurants] Including permanently closed restaurants.")
      }

      query = query.order("total_score_gmaps", { ascending: false })
      query = query.order("reviews_count_gmaps", { ascending: false })

      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      console.log("[searchRestaurants] Final query object:", query)

      const { data, error, count, status, statusText } = await query

      console.log("[searchRestaurants] Supabase response - data:", data)
      console.log("[searchRestaurants] Supabase response - error:", error)
      console.log("[searchRestaurants] Supabase response - count:", count)
      console.log("[searchRestaurants] Supabase response - status:", status)
      console.log("[searchRestaurants] Supabase response - statusText:", statusText)

      if (error) {
        const errorMessage = error.message || ""
        if (
          (status === 429 ||
            errorMessage.toLowerCase().includes("too many requests") ||
            errorMessage.includes("not valid JSON")) &&
          retries < maxRetries - 1
        ) {
          console.warn(
            `[searchRestaurants] Supabase query error (likely rate limit or non-JSON response), status: ${status}, message: ${errorMessage}. Will retry.`,
          )
          retries++
          continue
        }
        console.error(
          "[searchRestaurants] Supabase query error (non-retryable or max retries reached):",
          JSON.stringify(error, null, 2),
          "Status:",
          status,
          "StatusText:",
          statusText,
        )
        throw error
      }

      console.log(
        `[searchRestaurants] Query successful. Found ${data?.length || 0} restaurants on this page (limit: ${limit}). Total matching count: ${count}`,
      )

      return {
        restaurants: (data as Restaurant[]) || [],
        totalCount: count || 0,
      }
    } catch (error: any) {
      console.error(`[searchRestaurants] Error after ${retries} retries or non-retryable error:`, error.message)
      if (retries >= maxRetries - 1) {
        console.error("[searchRestaurants] Max retries reached. Returning empty results.")
      } else {
        console.error(
          "[searchRestaurants] Unhandled error in try block, returning empty results. Error:",
          error.message,
        )
      }
      retries++
      if (retries >= maxRetries) {
        console.error("[searchRestaurants] Final attempt failed or unexpected error path. Returning empty results.")
        return { restaurants: [], totalCount: 0 }
      }
    }
  }
  console.warn("[searchRestaurants] Max retries reached for the operation. Returning empty results.")
  return { restaurants: [], totalCount: 0 }
}

export async function getAllRestaurants(
  page = 1,
  limit = 20,
): Promise<{ restaurants: Restaurant[]; totalCount: number }> {
  const maxRetries = 3
  let retries = 0

  while (retries < maxRetries) {
    try {
      if (retries > 0) {
        const delay = Math.pow(2, retries) * 1000
        console.log(`[getAllRestaurants] Retrying in ${delay / 1000}s (attempt ${retries + 1}/${maxRetries})`)
        await wait(delay)
      }

      const { data, error, count, status } = await supabase
        .from("restaurants")
        .select("*", { count: "exact" })
        .order("total_score_gmaps", { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) {
        const errorMessage = error.message || ""
        if (
          (status === 429 ||
            errorMessage.toLowerCase().includes("too many requests") ||
            errorMessage.includes("not valid JSON")) &&
          retries < maxRetries - 1
        ) {
          console.warn(
            `[getAllRestaurants] Supabase query error (likely rate limit), status: ${status}, message: ${errorMessage}. Will retry.`,
          )
          retries++
          continue
        }
        console.error("[getAllRestaurants] Supabase query error:", JSON.stringify(error, null, 2))
        throw error
      }
      return {
        restaurants: (data as Restaurant[]) || [],
        totalCount: count || 0,
      }
    } catch (error: any) {
      console.error(`[getAllRestaurants] Error after ${retries} retries or non-retryable error:`, error.message)
      retries++
      if (retries >= maxRetries) {
        console.error("[getAllRestaurants] Final attempt failed. Returning empty results.")
        return { restaurants: [], totalCount: 0 }
      }
    }
  }
  console.warn("[getAllRestaurants] Max retries reached. Returning empty results.")
  return { restaurants: [], totalCount: 0 }
}

export async function fetchRestaurantById(id: string): Promise<RestaurantWithReviews | null> {
  if (!id || id.trim() === "" || id === "undefined" || id === "null") {
    console.error("[fetchRestaurantById] Invalid ID provided:", id)
    throw new Error("Invalid restaurant ID provided")
  }

  const maxRetries = 3
  let retries = 0
  while (retries < maxRetries) {
    try {
      if (retries > 0) {
        const delay = Math.pow(2, retries) * 1000
        console.log(`[fetchRestaurantById] Retrying in ${delay / 1000}s (attempt ${retries + 1}/${maxRetries})`)
        await wait(delay)
      }

      console.log(`[fetchRestaurantById] Querying for ID: "${id}"`)

      // First, let's check if CSE snippets exist for any restaurant
      console.log("[fetchRestaurantById] Checking CSE snippets table...")
      const {
        data: cseCheck,
        error: cseCheckError,
        count: cseCount,
      } = await supabase.from("cse_review_snippets").select("*", { count: "exact" }).limit(1)

      console.log(`[fetchRestaurantById] CSE snippets table check - Count: ${cseCount}, Error:`, cseCheckError)
      if (cseCheck && cseCheck.length > 0) {
        console.log("[fetchRestaurantById] Sample CSE snippet:", cseCheck[0])
      }

      // Now let's try the main query
      const query = supabase
        .from("restaurants")
        .select(`
          *,
          google_user_reviews (*),
          critic_reviews (*),
          cse_review_snippets (*)
        `)
        .eq("id", id)

      console.log("[fetchRestaurantById] Main query:", query)

      let { data, error, status } = await query.maybeSingle()

      console.log("[fetchRestaurantById] Raw data from Supabase:", data)
      console.log("[fetchRestaurantById] Query error:", error)
      console.log("[fetchRestaurantById] Query status:", status)

      if (data) {
        console.log("[fetchRestaurantById] Restaurant found:", data.name)
        console.log("[fetchRestaurantById] Google reviews count:", data.google_user_reviews?.length || 0)
        console.log("[fetchRestaurantById] Critic reviews count:", data.critic_reviews?.length || 0)
        console.log("[fetchRestaurantById] CSE snippets count:", data.cse_review_snippets?.length || 0)

        // Enhanced image debugging
        console.log("[fetchRestaurantById] ===== IMAGE DEBUG =====")
        console.log("[fetchRestaurantById] cover_image_url_gmaps:", data.cover_image_url_gmaps)
        console.log("[fetchRestaurantById] image_urls_gmaps:", data.image_urls_gmaps)
        console.log("[fetchRestaurantById] image_urls_gmaps type:", typeof data.image_urls_gmaps)
        console.log(
          "[fetchRestaurantById] image_urls_gmaps length:",
          Array.isArray(data.image_urls_gmaps) ? data.image_urls_gmaps.length : "not array",
        )

        if (Array.isArray(data.image_urls_gmaps)) {
          console.log("[fetchRestaurantById] First 3 image URLs:", data.image_urls_gmaps.slice(0, 3))
        }
        console.log("[fetchRestaurantById] ========================")

        if (data.cse_review_snippets && data.cse_review_snippets.length > 0) {
          console.log("[fetchRestaurantById] First CSE snippet:", data.cse_review_snippets[0])
        } else {
          console.log("[fetchRestaurantById] No CSE snippets found for this restaurant")

          // Let's check if this restaurant has CSE snippets with a direct query
          const { data: directCSE, error: directCSEError } = await supabase
            .from("cse_review_snippets")
            .select("*")
            .eq("restaurant_id", id)

          console.log("[fetchRestaurantById] Direct CSE query result:", directCSE)
          console.log("[fetchRestaurantById] Direct CSE query error:", directCSEError)
        }
      }

      if (!data && !error) {
        console.log(`[fetchRestaurantById] Not found by ID ${id}, trying google_place_id.`)
        const gpidResult = await supabase
          .from("restaurants")
          .select(`
            *,
            google_user_reviews (*),
            critic_reviews (*),
            cse_review_snippets (*)
          `)
          .eq("google_place_id", id)
          .maybeSingle()
        data = gpidResult.data
        error = gpidResult.error
        status = gpidResult.status

        if (data?.cse_review_snippets) {
          console.log("[fetchRestaurantById] CSE snippets from GPID query:", data.cse_review_snippets.length)
        }

        // Enhanced image debugging for GPID query too
        if (data) {
          console.log("[fetchRestaurantById] ===== IMAGE DEBUG (GPID) =====")
          console.log("[fetchRestaurantById] cover_image_url_gmaps:", data.cover_image_url_gmaps)
          console.log("[fetchRestaurantById] image_urls_gmaps:", data.image_urls_gmaps)
          console.log("[fetchRestaurantById] image_urls_gmaps type:", typeof data.image_urls_gmaps)
          console.log(
            "[fetchRestaurantById] image_urls_gmaps length:",
            Array.isArray(data.image_urls_gmaps) ? data.image_urls_gmaps.length : "not array",
          )
          console.log("[fetchRestaurantById] ===============================")
        }
      }

      if (error) {
        const errorMessage = error.message || ""
        if (
          (status === 429 ||
            errorMessage.toLowerCase().includes("too many requests") ||
            errorMessage.includes("not valid JSON")) &&
          retries < maxRetries - 1
        ) {
          console.warn(
            `[fetchRestaurantById] Supabase query error (likely rate limit), status: ${status}, message: ${errorMessage}. Will retry.`,
          )
          retries++
          continue
        }
        console.error("[fetchRestaurantById] Supabase query error:", JSON.stringify(error, null, 2))
        throw error
      }
      if (!data) {
        console.log(`[fetchRestaurantById] No restaurant found for ID or GPID: ${id}`)
        return null
      }
      return data as RestaurantWithReviews
    } catch (error: any) {
      console.error(`[fetchRestaurantById] Error after ${retries} retries or non-retryable error:`, error.message)
      retries++
      if (retries >= maxRetries) {
        console.error("[fetchRestaurantById] Final attempt failed. Throwing error.")
        throw error
      }
    }
  }
  console.warn("[fetchRestaurantById] Max retries reached. Throwing error.")
  throw new Error("Failed to fetch restaurant after maximum retries")
}

// New function to specifically test CSE snippets
export async function testCSESnippets(restaurantId?: string): Promise<void> {
  console.log("[testCSESnippets] Testing CSE snippets functionality...")

  try {
    // Check if table exists and has data
    const {
      data: allCSE,
      error: allCSEError,
      count,
    } = await supabase.from("cse_review_snippets").select("*", { count: "exact" }).limit(5)

    console.log(`[testCSESnippets] Total CSE snippets in database: ${count}`)
    console.log("[testCSESnippets] Sample CSE snippets:", allCSE)
    console.log("[testCSESnippets] Query error:", allCSEError)

    if (restaurantId) {
      // Test specific restaurant
      const { data: specificCSE, error: specificError } = await supabase
        .from("cse_review_snippets")
        .select("*")
        .eq("restaurant_id", restaurantId)

      console.log(`[testCSESnippets] CSE snippets for restaurant ${restaurantId}:`, specificCSE)
      console.log("[testCSESnippets] Specific query error:", specificError)
    }

    // Test join query
    const { data: joinTest, error: joinError } = await supabase
      .from("restaurants")
      .select(`
        id,
        name,
        cse_review_snippets (*)
      `)
      .limit(3)

    console.log("[testCSESnippets] Join test results:", joinTest)
    console.log("[testCSESnippets] Join test error:", joinError)
  } catch (error) {
    console.error("[testCSESnippets] Unexpected error:", error)
  }
}

// New function to test image URLs
export async function testImageUrls(restaurantId?: string): Promise<void> {
  console.log("[testImageUrls] Testing image URLs functionality...")

  try {
    // Check image fields in restaurants table
    const { data: imageTest, error: imageError } = await supabase
      .from("restaurants")
      .select("id, name, cover_image_url_gmaps, image_urls_gmaps")
      .limit(5)

    console.log("[testImageUrls] Sample restaurants with images:", imageTest)
    console.log("[testImageUrls] Query error:", imageError)

    if (restaurantId) {
      // Test specific restaurant images
      const { data: specificImages, error: specificError } = await supabase
        .from("restaurants")
        .select("id, name, cover_image_url_gmaps, image_urls_gmaps")
        .eq("id", restaurantId)
        .single()

      console.log(`[testImageUrls] Images for restaurant ${restaurantId}:`, specificImages)
      console.log("[testImageUrls] Specific query error:", specificError)

      if (specificImages) {
        console.log("[testImageUrls] Cover image URL:", specificImages.cover_image_url_gmaps)
        console.log("[testImageUrls] Image URLs array:", specificImages.image_urls_gmaps)
        console.log("[testImageUrls] Image URLs type:", typeof specificImages.image_urls_gmaps)
        console.log("[testImageUrls] Is array:", Array.isArray(specificImages.image_urls_gmaps))

        if (Array.isArray(specificImages.image_urls_gmaps)) {
          console.log("[testImageUrls] Number of images:", specificImages.image_urls_gmaps.length)
          specificImages.image_urls_gmaps.forEach((url, index) => {
            console.log(`[testImageUrls] Image ${index + 1}:`, url)
          })
        }
      }
    }
  } catch (error) {
    console.error("[testImageUrls] Unexpected error:", error)
  }
}

export async function getRestaurantCount(): Promise<number> {
  try {
    const { count, error } = await supabase.from("restaurants").select("*", { count: "exact", head: true })
    if (error) throw error
    return count || 0
  } catch (error) {
    console.error("[getRestaurantCount] Error:", error)
    return 0
  }
}

export async function getAllRestaurantsNoPagination(): Promise<Restaurant[]> {
  try {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("total_score_gmaps", { ascending: false })
    if (error) throw error
    return (data as Restaurant[]) || []
  } catch (error) {
    console.error("[getAllRestaurantsNoPagination] Error:", error)
    return []
  }
}

export async function getFeaturedRestaurants(limit = 6): Promise<Restaurant[]> {
  try {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .gte("total_score_gmaps", 4.5)
      .gte("reviews_count_gmaps", 50)
      .neq("permanently_closed_gmaps", true)
      .order("total_score_gmaps", { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data as Restaurant[]) || []
  } catch (error) {
    console.error("[getFeaturedRestaurants] Error:", error)
    return []
  }
}

export async function getTrendingRestaurants(limit = 6): Promise<Restaurant[]> {
  try {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .neq("permanently_closed_gmaps", true)
      .order("updated_at", { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data as Restaurant[]) || []
  } catch (error) {
    console.error("[getTrendingRestaurants] Error:", error)
    return []
  }
}
