import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { searchRestaurants } from "@/lib/supabase-client"
import type { Restaurant } from "@/lib/supabase-client"

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

    // STEP 2: Call Supabase API with the structured filters
    const { restaurants: matchingRestaurants } = await searchRestaurants({
      location: filters.location,
      priceRange: filters.priceRange,
      vibes: filters.vibes,
      minRating: filters.rating,
      searchTerm: filters.cuisine,
    })

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
    console.log("Found matching restaurants:", JSON.stringify(matchingRestaurants, null, 2));

    const promptForLlm = `You are a helpful restaurant guide for London.
      
      The user asked: "${query}"
      
      Based on their query, I found these restaurants:
      ${matchingRestaurants
        .map(
          (r) =>
            `- ${r.name || "Unknown Name"} (${r.neighborhood_gmaps || r.city_gmaps || "Unknown Location"}, ${
              r.price_range_gmaps || "N/A"
            }): ${r.description_gmaps || "No description available."}. Vibes: ${(r.vibes_gmaps || []).join(", ")}`,
        )
        .join("\n")}
      
      Write a brief, friendly response explaining why these restaurants match their query. Keep it concise and conversational, like a knowledgeable local friend would recommend places.`;

    console.log("Generated prompt for LLM:", promptForLlm);

    try {
      const response = await generateText({
        model: openai("gpt-4o"),
        prompt: promptForLlm,
      });

      console.log("LLM response received:", response.text);

      return new Response(
        JSON.stringify({
          message: response.text,
          restaurants: matchingRestaurants,
        }),
      );
    } catch (llmError) {
      console.error("Error during LLM call:", llmError);
      return new Response(
        JSON.stringify({
          message: "I'm sorry, I had trouble generating a response. Please try again.",
          restaurants: [],
        }),
        { status: 500 },
      );
    }
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
