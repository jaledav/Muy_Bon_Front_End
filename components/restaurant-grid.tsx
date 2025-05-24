import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
// Import supabase client and Restaurant type from lib
import { supabase, Restaurant } from '@/lib/supabase-client'
// No longer need createClient from '@supabase/supabase-js' directly here

// The local Restaurant interface is removed as it's imported.
// The local supabase client instantiation is removed as it's imported.

export default async function RestaurantGrid({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // In a real implementation, you would use the searchParams to filter restaurants
  let restaurants: Restaurant[] = []
  const searchTerm = searchParams?.search ? String(searchParams.search) : null
  const selectedVibes = searchParams?.vibe ? String(searchParams.vibe).split(',') : []
  const selectedPrice = searchParams?.price ? String(searchParams.price) : null
  const selectedCuisines = searchParams?.cuisine ? String(searchParams.cuisine).split(',') : []

  try {
    // Try to fetch restaurants from Supabase
    let query = supabase.from('restaurants').select('*')

    // Apply text search if searchTerm is present
    // This assumes you have a column suitable for text search, e.g., 'name' or a tsvector column
    // For simplicity, let's assume searching by name using 'ilike'
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`)
    }

    // Apply vibe filter if selectedVibes is not empty
    // This assumes 'vibes' is an array column in your Supabase table
    if (selectedVibes.length > 0) {
      // query = query.cs('vibes', selectedVibes) // Original attempt
      // Supabase `cs` (contains) operator expects the array of values directly for array columns.
      // The client library should handle formatting it correctly (e.g., to '{"Val1","Val2"}')
      query = query.overlaps('vibes', selectedVibes) // Using 'overlaps' as it's more standard for array intersection
      // If 'overlaps' is not what's needed and 'cs' is specifically for "array contains this array",
      // and if 'cs' is still an issue, we might need to format selectedVibes like:
      // query = query.cs('vibes', `{${selectedVibes.join(',')}}`)
    }

    // Apply cuisine filter
    // Assuming 'cuisine' is a text column. If multiple cuisines, use 'in'.
    if (selectedCuisines.length > 0) {
      if (selectedCuisines.length === 1) {
        query = query.eq('cuisine', selectedCuisines[0])
      } else {
        query = query.in('cuisine', selectedCuisines)
      }
    }

    // Apply price filter if selectedPrice is present
    // This assumes 'priceRange' is a column in your Supabase table (e.g., '£', '££')
    if (selectedPrice) {
      query = query.eq('priceRange', selectedPrice)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    restaurants = data || [] // Ensure restaurants is an array even if data is null

    // If we got an empty array, handle it (e.g., show a message)
    if (restaurants.length === 0) {
      console.log("No restaurants found in Supabase database.")
      // Potentially return a message or an empty state component here
    }
  } catch (error) {
    // If the API call fails, log the error
    let errorMessage = "Unknown error fetching restaurants."
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      // Handle Supabase PostgrestError like objects
      errorMessage = String((error as any).message)
      if ('details' in error && (error as any).details) {
        errorMessage += ` Details: ${String((error as any).details)}`
      }
      if ('hint' in error && (error as any).hint) {
        errorMessage += ` Hint: ${String((error as any).hint)}`
      }
    } else {
      errorMessage = String(error)
    }
    console.error("Error fetching restaurants from Supabase:", errorMessage)
    // Potentially return an error message or an error state component here
    restaurants = [] // Ensure restaurants is an empty array on error
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Showing {restaurants.length} restaurants</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          // Ensure the link uses google_place_id if that's what the individual page expects
          <Link key={restaurant.id} href={`/restaurant/${restaurant.google_place_id}`} className="block">
            <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
              <div className="relative h-48">
                <Image
                  src={restaurant.cover_image_url || "/placeholder.svg"}
                  alt={restaurant.name || 'Restaurant image'}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold font-playfair">{restaurant.name || 'Unnamed Restaurant'}</h3>
                  <span className="text-sm text-muted-foreground">{restaurant.priceRange || ''}</span>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">{restaurant.location || 'Location not available'}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {(restaurant.vibes || []).map((vibe: string) => (
                    <Badge key={vibe} variant="outline" className="text-xs">
                      {vibe}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm">{restaurant.description || 'No description available.'}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
