import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { searchRestaurants } from "@/lib/xano-api"
import type { Restaurant, XanoSearchFilters } from "@/lib/types"
import { getRandomPlaceholder } from "@/lib/utils"

// Define the structure for our parsed filters
interface ParsedFilters {
  location?: string
  vibes?: string[]
  priceRange?: string
  partySize?: number
  dateTime?: string
  cuisine?: string
  rating?: number
}

export async function POST(req: Request) {
  const { query } = await req.json()

  try {
    // STEP 1: LLM Call for Parsing Query into Structured Filters
    const { text: parsedQueryText } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Parse this restaurant query into structured filters: "${query}"
      Return a JSON object with these fields:
      - location (string, e.g., "Hackney")
      - vibes (array of strings, e.g., ["Romantic", "Cozy"])
      - priceRange (string, e.g., "£££")
      - partySize (number)
      - dateTime (string, e.g., "Thursday 8pm")
      - cuisine (string, e.g., "Mexican")
      - rating (number, minimum review score from 1-5)
      
      JSON only, no explanation.`,
    })

    // Parse the structured query
    let filters: ParsedFilters
    try {
      filters = JSON.parse(parsedQueryText)
      console.log("Parsed filters:", filters)
    } catch (e) {
      console.error("Error parsing filters:", e)
      filters = {}
    }

    // STEP 2: Call Xano API with the structured filters
    let matchingRestaurants: Restaurant[] = []

    // Convert our parsed filters to the format expected by the Xano API
    const xanoFilters: XanoSearchFilters = {
      location: filters.location,
      price: filters.priceRange,
      vibes: filters.vibes,
      cuisine: filters.cuisine,
      rating: filters.rating,
      // Add any additional filters that might be useful
      keywords: filters.vibes, // Use vibes as keywords for full-text search
    }

    try {
      // Call the Xano API to search for restaurants
      matchingRestaurants = await searchRestaurants(xanoFilters)

      // If we got no results, try the fallback
      if (matchingRestaurants.length === 0) {
        console.log("No matching restaurants found in Xano, using simulated data")
        matchingRestaurants = simulateXanoSearch(filters)
      }
    } catch (error) {
      console.log(
        "Error searching restaurants in Xano, using simulated data:",
        error instanceof Error ? error.message : String(error),
      )

      // Fallback to simulated data if Xano API is not available yet
      matchingRestaurants = simulateXanoSearch(filters)
    }

    // If no restaurants match, return a helpful message
    if (matchingRestaurants.length === 0) {
      return new Response(
        JSON.stringify({
          message: `I couldn't find any restaurants matching your criteria. Try adjusting your search or being less specific.`,
          restaurants: [],
        }),
      )
    }

    // STEP 3: LLM Call for Response Generation
    const response = await generateText({
      model: openai("gpt-4o"),
      prompt: `You are a helpful restaurant guide for London.
      
      The user asked: "${query}"
      
      Based on their query, I found these restaurants:
      ${matchingRestaurants
        .map((r) => `- ${r.name} (${r.location}, ${r.price}): ${r.description}. Vibes: ${r.vibes.join(", ")}`)
        .join("\n")}
      
      Write a brief, friendly response explaining why these restaurants match their query. Keep it concise and conversational, like a knowledgeable local friend would recommend places.`,
    })

    return new Response(
      JSON.stringify({
        message: response.text,
        restaurants: matchingRestaurants,
      }),
    )
  } catch (error) {
    console.error("Error in chat processing:", error)
    return new Response(
      JSON.stringify({
        message: "I'm sorry, I had trouble processing your request. Please try again.",
        restaurants: [],
      }),
      { status: 500 },
    )
  }
}

// This function simulates what your Xano API would do
// This is a temporary fallback and will be removed once the Xano API is fully implemented
function simulateXanoSearch(filters: ParsedFilters): Restaurant[] {
  // Sample restaurant data (in production, this would come from Xano)
  const restaurants = [
    {
      id: 1,
      name: "The Clove Club",
      location: "Shoreditch",
      image: getRandomPlaceholder(),
      price: "££££",
      vibes: ["Fine Dining", "Tasting Menu", "Modern British"],
      description: "Michelin-starred restaurant in Shoreditch Town Hall serving innovative British cuisine.",
      cuisine: "British",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Brat",
      location: "Shoreditch",
      image: getRandomPlaceholder(),
      price: "£££",
      vibes: ["Buzzy", "Wood-fired", "Basque"],
      description: "Michelin-starred spot known for wood-fired cooking and excellent seafood.",
      cuisine: "Basque",
      rating: 4.7,
    },
    {
      id: 3,
      name: "Lyle's",
      location: "Shoreditch",
      image: getRandomPlaceholder(),
      price: "£££",
      vibes: ["Minimalist", "Seasonal", "Modern British"],
      description: "Michelin-starred restaurant with a daily changing menu of seasonal British food.",
      cuisine: "British",
      rating: 4.6,
    },
    {
      id: 4,
      name: "Cadet",
      location: "Newington Green",
      image: getRandomPlaceholder(),
      price: "£££",
      vibes: ["Wine Bar", "Small Plates", "Cozy"],
      description: "New wine bar from the team behind Jolene, focusing on natural wines and seasonal small plates.",
      cuisine: "European",
      rating: 4.5,
    },
    {
      id: 5,
      name: "Planque",
      location: "Haggerston",
      image: getRandomPlaceholder(),
      price: "£££",
      vibes: ["Wine Library", "Modern French", "Cool"],
      description: "Part wine library, part restaurant, serving creative French-inspired dishes in a stylish space.",
      cuisine: "French",
      rating: 4.6,
    },
    {
      id: 6,
      name: "Supa Ya Ramen",
      location: "Hackney",
      image: getRandomPlaceholder(),
      price: "££",
      vibes: ["Casual", "Innovative", "Fun"],
      description: "Cult ramen spot known for creative, non-traditional bowls and a playful approach.",
      cuisine: "Japanese",
      rating: 4.5,
    },
    {
      id: 7,
      name: "Bright",
      location: "Hackney",
      image: getRandomPlaceholder(),
      price: "£££",
      vibes: ["Romantic", "Wine Bar", "Modern European"],
      description: "Intimate setting with exceptional seasonal dishes and natural wines.",
      cuisine: "European",
      rating: 4.7,
    },
    {
      id: 8,
      name: "Jolene",
      location: "Newington Green",
      image: getRandomPlaceholder(),
      price: "££",
      vibes: ["Cozy", "Neighborhood", "Seasonal"],
      description: "Beloved neighborhood spot with excellent baked goods and seasonal cooking.",
      cuisine: "European",
      rating: 4.4,
    },
    {
      id: 9,
      name: "Mangal 2",
      location: "Dalston",
      image: getRandomPlaceholder(),
      price: "££",
      vibes: ["Turkish", "Grill", "Family-run"],
      description: "Legendary Turkish grill with a modern twist, known for excellent kebabs and mezze.",
      cuisine: "Turkish",
      rating: 4.6,
    },
    {
      id: 10,
      name: "Fonda",
      location: "Regent Street",
      image: getRandomPlaceholder(),
      price: "£££",
      vibes: ["Sophisticated", "Relaxed", "Mexican"],
      description:
        "A Mexican restaurant by chef Santiago Lastra offering regional dishes with sophisticated presentation and complex flavors.",
      cuisine: "Mexican",
      rating: 4.8,
    },
  ]

  // Filter restaurants based on the parsed filters
  return restaurants
    .filter((r) => {
      // Location filter
      if (filters.location && !r.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }

      // Price filter
      if (filters.priceRange && r.price !== filters.priceRange) {
        return false
      }

      // Cuisine filter
      if (
        filters.cuisine &&
        !r.cuisine.toLowerCase().includes(filters.cuisine.toLowerCase()) &&
        !r.description.toLowerCase().includes(filters.cuisine.toLowerCase())
      ) {
        return false
      }

      // Rating filter
      if (filters.rating && r.rating < filters.rating) {
        return false
      }

      // Vibe filter (at least one vibe matches)
      if (filters.vibes && filters.vibes.length > 0) {
        const matchesAnyVibe = filters.vibes.some((vibe) => {
          return (
            r.vibes.some((restaurantVibe) => restaurantVibe.toLowerCase().includes(vibe.toLowerCase())) ||
            r.description.toLowerCase().includes(vibe.toLowerCase())
          )
        })
        if (!matchesAnyVibe) return false
      }

      return true
    })
    .slice(0, 3) // Limit to 3 results like in the original code
    .map(({ id, name, location, image, price, vibes, description }) => ({
      id,
      name,
      location,
      image,
      price,
      vibes,
      description,
      // Simulated popular times data for demo (replace with real data if available)
      popular_times_histogram_gmaps: {
        Monday: Array.from({ length: 12 }, (_, i) => ({ hour: 8 + i, occupancyPercent: Math.floor(Math.random() * 100) })),
        Tuesday: Array.from({ length: 12 }, (_, i) => ({ hour: 8 + i, occupancyPercent: Math.floor(Math.random() * 100) })),
        Wednesday: Array.from({ length: 12 }, (_, i) => ({ hour: 8 + i, occupancyPercent: Math.floor(Math.random() * 100) })),
        Thursday: Array.from({ length: 12 }, (_, i) => ({ hour: 8 + i, occupancyPercent: Math.floor(Math.random() * 100) })),
        Friday: Array.from({ length: 12 }, (_, i) => ({ hour: 8 + i, occupancyPercent: Math.floor(Math.random() * 100) })),
        Saturday: Array.from({ length: 12 }, (_, i) => ({ hour: 8 + i, occupancyPercent: Math.floor(Math.random() * 100) })),
        Sunday: Array.from({ length: 12 }, (_, i) => ({ hour: 8 + i, occupancyPercent: Math.floor(Math.random() * 100) })),
      },
      popular_times_live_text_gmaps: "Live data unavailable in demo",
    })) // Only return the fields needed for the response
}
