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
  const maxRetries = 3 // Max number of retries
  let retries = 0

  console.log("[searchRestaurants] Received filters:", JSON.stringify(filters, null, 2))

  while (retries < maxRetries) {
    try {
      if (retries > 0) {
        const delay = Math.pow(2, retries) * 1000 // Exponential backoff: 2s, 4s, 8s
        console.log(
          `[searchRestaurants] Rate limit or error encountered. Retrying in ${delay / 1000}s (attempt ${retries + 1}/${maxRetries})`,
        )
        await wait(delay)
      }

      let query = supabase.from("restaurants").select("*", { count: "exact" })

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

      query = query.order("total_score_gmaps", { ascending: false, nullsLast: true })
      query = query.order("reviews_count_gmaps", { ascending: false, nullsLast: true })

      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count, status, statusText } = await query

      if (error) {
        // Check if the error is due to a non-JSON response that indicates a rate limit
        const errorMessage = error.message || ""
        if (
          (status === 429 ||
            errorMessage.toLowerCase().includes("too many requests") ||
            errorMessage.includes("not valid JSON")) &&
          retries < maxRetries - 1 // Only retry if not on the last attempt
        ) {
          console.warn(
            `[searchRestaurants] Supabase query error (likely rate limit or non-JSON response), status: ${status}, message: ${errorMessage}. Will retry.`,
          )
          retries++
          continue // Go to the next iteration of the while loop to retry
        }
        // For other errors, or if max retries reached for rate limit
        console.error(
          "[searchRestaurants] Supabase query error (non-retryable or max retries reached):",
          JSON.stringify(error, null, 2),
          "Status:",
          status,
          "StatusText:",
          statusText,
        )
        throw error // Throw to be caught by the outer catch block
      }

      console.log(
        `[searchRestaurants] Query successful. Found ${data?.length || 0} restaurants on this page (limit: ${limit}). Total matching count: ${count}`,
      )

      return {
        // Success
        restaurants: (data as Restaurant[]) || [],
        totalCount: count || 0,
      }
    } catch (error: any) {
      // Catch errors from the try block, including re-thrown ones
      // This catch block is for errors that occur within the try, or if retries are exhausted for specific errors
      // If it's an error that caused a retry and retries are exhausted, this will be the final catch.
      console.error(`[searchRestaurants] Error after ${retries} retries or non-retryable error:`, error.message)
      // If we've exhausted retries, or it's a non-retryable error, break the loop and return empty.
      // The loop condition (retries < maxRetries) will handle breaking if maxRetries is reached.
      // If it's a different kind of error not caught by the inner if(error), it will also land here.
      if (retries >= maxRetries - 1) {
        // If this was the last possible attempt
        console.error("[searchRestaurants] Max retries reached. Returning empty results.")
      } else {
        // For other errors not related to rate limiting that might occur before the query
        console.error(
          "[searchRestaurants] Unhandled error in try block, returning empty results. Error:",
          error.message,
        )
      }
      // To prevent infinite loops on unexpected errors, ensure retries increment or we break
      // However, the primary retry logic is for the Supabase query error.
      // For safety, if an error lands here and it's not the last retry, we might increment and continue,
      // but it's better to handle specific retryable errors.
      // For now, if an error makes it to this outer catch, we'll assume it's final for this attempt.
      // The while loop will retry if retries < maxRetries.
      // If the error was thrown from the inner if(error) block after max retries, this is the final stop.
      retries++ // Ensure loop eventually terminates if an unexpected error keeps occurring
      if (retries >= maxRetries) {
        console.error("[searchRestaurants] Final attempt failed or unexpected error path. Returning empty results.")
        return { restaurants: [], totalCount: 0 } // Final fallback
      }
      // If not max retries, the loop will continue.
    }
  }
  // If loop finishes due to maxRetries, return empty
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
        .order("total_score_gmaps", { ascending: false, nullsLast: true })
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
  const maxRetries = 3
  let retries = 0
  while (retries < maxRetries) {
    try {
      if (retries > 0) {
        const delay = Math.pow(2, retries) * 1000
        console.log(`[fetchRestaurantById] Retrying in ${delay / 1000}s (attempt ${retries + 1}/${maxRetries})`)
        await wait(delay)
      }
      const query = supabase
        .from("restaurants")
        .select(`*, google_user_reviews (*), critic_reviews (*), cse_review_snippets (*)`)
        .eq("id", id)

      let { data, error, status } = await query.maybeSingle()

      if (!data && !error) {
        // If not found by UUID, try by Google Place ID
        console.log(`[fetchRestaurantById] Not found by ID ${id}, trying google_place_id.`)
        const gpidResult = await supabase
          .from("restaurants")
          .select(`*, google_user_reviews (*), critic_reviews (*), cse_review_snippets (*)`)
          .eq("google_place_id", id)
          .maybeSingle()
        data = gpidResult.data
        error = gpidResult.error
        status = gpidResult.status
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
        console.error("[fetchRestaurantById] Final attempt failed. Returning null.")
        return null
      }
    }
  }
  console.warn("[fetchRestaurantById] Max retries reached. Returning null.")
  return null
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
      .order("total_score_gmaps", { ascending: false, nullsLast: true })
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
