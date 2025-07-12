import { Button } from "@/components/ui/button"
import { searchRestaurants, type Restaurant } from "@/lib/supabase-client"
import Link from "next/link"
import Image from "next/image"
import { Star, MapPinIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PaginationControls } from "@/components/pagination-controls"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Adjusted items per page
const ITEMS_PER_PAGE = 24 // Changed from 9 to 24

export default async function RestaurantGrid({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams?.page === "string" ? Number(searchParams.page) : 1
  // Use ITEMS_PER_PAGE for limit
  const limit = typeof searchParams?.limit === "string" ? Number(searchParams.limit) : ITEMS_PER_PAGE

  const searchTerm = typeof searchParams?.search === "string" ? searchParams.search : undefined
  const location = typeof searchParams?.location === "string" ? searchParams.location : undefined
  const vibes = typeof searchParams?.vibes === "string" ? searchParams.vibes.split(",") : undefined
  const priceRange = typeof searchParams?.price === "string" ? searchParams.price : undefined
  const minRatingParam = typeof searchParams?.minRating === "string" ? Number(searchParams.minRating) : undefined
  const minRating = Number.isFinite(minRatingParam) ? minRatingParam : undefined

  const filters: Parameters<typeof searchRestaurants>[0] = {
    page,
    limit, // This will now be 24 by default
    searchTerm,
    location,
    vibes,
    priceRange,
    minRating,
  }

  // console.log("RestaurantGrid: searchParams received:", searchParams);
  // console.log("RestaurantGrid: Filters passed to searchRestaurants:", filters);

  let data: { restaurants: Restaurant[]; totalCount: number }
  try {
    data = await searchRestaurants(filters)
  } catch (error) {
    console.error("Error fetching restaurants in RestaurantGrid:", error)
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-semibold">Could not load restaurants.</p>
        <p className="text-sm text-muted-foreground">There was an issue fetching data. Please try again later.</p>
      </div>
    )
  }

  const { restaurants, totalCount } = data
  const totalPages = Math.ceil(totalCount / limit)

  if (!restaurants || restaurants.length === 0) {
    const message = searchTerm ? `No restaurants found for "${searchTerm}".` : "No restaurants found."
    return (
      <div className="text-center py-10">
        <p className="text-xl font-semibold">{message}</p>
        <p className="text-muted-foreground">Try adjusting your search terms or filters.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 text-sm text-muted-foreground">
        Showing {restaurants.length} of {totalCount} restaurant{totalCount !== 1 ? "s" : ""}
        {searchTerm && ` for "${searchTerm}"`}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {" "}
        {/* Adjusted grid for more items */}
        {restaurants.map((restaurant) => (
          <Card
            key={restaurant.id}
            className="flex flex-col overflow-hidden h-full hover:shadow-lg transition-shadow duration-200 ease-in-out"
          >
            <Link href={`/restaurant/${restaurant.id || restaurant.google_place_id}`} className="block group">
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={restaurant.cover_image_url_gmaps || "/placeholder.svg?height=300&width=400&text=Restaurant"}
                  alt={restaurant.name || "Restaurant image"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, (max-width: 1536px) 33vw, 25vw" // Adjusted sizes
                  className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                />
              </div>
            </Link>
            <CardHeader className="p-4">
              <Link href={`/restaurant/${restaurant.id || restaurant.google_place_id}`} className="block group">
                <CardTitle className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2">
                  {" "}
                  {/* Adjusted font size and line-clamp */}
                  {restaurant.name}
                </CardTitle>
              </Link>
              {restaurant.sub_title && <p className="text-xs text-muted-foreground truncate">{restaurant.sub_title}</p>}
            </CardHeader>
            <CardContent className="p-4 flex-grow text-xs">
              {" "}
              {/* Adjusted font size */}
              <div className="flex items-center mb-2 text-muted-foreground">
                {restaurant.total_score_gmaps != null && (
                  <div className="flex items-center mr-2">
                    {" "}
                    {/* Reduced margin */}
                    <Star className="w-3 h-3 mr-1 text-yellow-400 fill-yellow-400" /> {/* Adjusted size */}
                    <span>{restaurant.total_score_gmaps.toFixed(1)}</span>
                    {restaurant.reviews_count_gmaps != null && (
                      <span className="ml-1">({restaurant.reviews_count_gmaps})</span>
                    )}
                  </div>
                )}
                {restaurant.price_range_gmaps && (
                  <Badge variant="outline" className="mr-2 text-xs px-1.5 py-0.5">
                    {" "}
                    {/* Adjusted padding/size */}
                    {restaurant.price_range_gmaps}
                  </Badge>
                )}
              </div>
              {(restaurant.neighborhood_gmaps || restaurant.city_gmaps) && (
                <div className="flex items-center text-muted-foreground mb-2">
                  {" "}
                  {/* Reduced margin */}
                  <MapPinIcon className="w-3 h-3 mr-1 flex-shrink-0" /> {/* Adjusted size */}
                  <span className="truncate">{restaurant.neighborhood_gmaps || restaurant.city_gmaps}</span>
                </div>
              )}
              {restaurant.vibes_gmaps && restaurant.vibes_gmaps.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {" "}
                  {/* Reduced margin */}
                  {restaurant.vibes_gmaps.slice(0, 2).map(
                    (
                      vibe, // Show 2 vibes
                    ) => (
                      <Badge key={vibe} variant="secondary" className="text-xs px-1.5 py-0.5">
                        {" "}
                        {/* Adjusted padding/size */}
                        {vibe}
                      </Badge>
                    ),
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="p-3 mt-auto">
              {" "}
              {/* Adjusted padding */}
              <Link href={`/restaurant/${restaurant.id || restaurant.google_place_id}`} className="w-full">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  {" "}
                  {/* Adjusted size */}
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-12">
          <PaginationControls currentPage={page} totalPages={totalPages} searchParams={searchParams} />
        </div>
      )}
    </div>
  )
}
