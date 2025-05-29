import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getAllRestaurants, searchRestaurants, type Restaurant } from "@/lib/supabase-client"
import { MapPin, Star } from "lucide-react"
import { PaginationControls } from "@/components/pagination-controls"

interface RestaurantGridProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function RestaurantGrid({ searchParams }: RestaurantGridProps) {
  // Extract search parameters
  const searchTerm = searchParams?.search ? String(searchParams.search) : undefined
  const selectedVibes = searchParams?.vibe ? String(searchParams.vibe).split(",") : []
  const selectedPrice = searchParams?.price ? String(searchParams.price) : undefined
  const selectedLocation = searchParams?.location ? String(searchParams.location) : undefined
  const minRating = searchParams?.rating ? Number(searchParams.rating) : undefined
  const currentPage = searchParams?.page ? Number(searchParams.page) : 1

  const limit = 24
  const hasFilters = searchTerm || selectedVibes.length > 0 || selectedPrice || selectedLocation || minRating

  let restaurants: Restaurant[] = []
  let totalCount = 0

  try {
    // Fetch restaurants
    let result
    if (hasFilters) {
      result = await searchRestaurants({
        searchTerm,
        vibes: selectedVibes.length > 0 ? selectedVibes : undefined,
        priceRange: selectedPrice,
        location: selectedLocation,
        minRating,
        page: currentPage,
        limit,
        includeClosed: true,
      })
    } else {
      result = await getAllRestaurants(currentPage, limit)
    }

    restaurants = result.restaurants
    totalCount = result.totalCount
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    restaurants = []
    totalCount = 0
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {restaurants.length} of {totalCount} restaurant{totalCount !== 1 ? "s" : ""}
            {hasFilters && " matching your filters"}
          </p>
          {currentPage > 1 && (
            <p className="text-xs text-muted-foreground mt-1">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>
      </div>

      {restaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">No restaurants found</p>
          <p className="text-sm text-muted-foreground">
            {hasFilters ? "Try adjusting your search filters" : "No restaurants available in the database"}
          </p>
        </div>
      ) : (
        <>
          {/* Restaurant Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {restaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} className="block">
                <Card className="overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg h-full">
                  <div className="relative h-40">
                    <Image
                      src={restaurant.cover_image_url_gmaps || "/placeholder.svg?height=300&width=400"}
                      alt={restaurant.name || "Restaurant image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                    />
                    {restaurant.permanently_closed_gmaps && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">Permanently Closed</span>
                      </div>
                    )}
                    {restaurant.temporarily_closed_gmaps && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="destructive" className="text-xs">
                          Temporarily Closed
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold font-playfair line-clamp-2 flex-1 min-h-[2.5rem]">
                        {restaurant.name || "Unnamed Restaurant"}
                      </h3>
                      <div className="flex items-center ml-2 flex-shrink-0">
                        {restaurant.total_score_gmaps && (
                          <>
                            <Star className="w-3 h-3 text-yellow-400 mr-1" />
                            <span className="text-xs font-medium">{restaurant.total_score_gmaps.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {restaurant.neighborhood_gmaps ||
                          restaurant.city_gmaps ||
                          restaurant.location_description_gmaps ||
                          "Location not available"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mb-2 flex-wrap">
                      {restaurant.price_range_gmaps && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {restaurant.price_range_gmaps}
                        </Badge>
                      )}
                      {restaurant.vibes_gmaps &&
                        restaurant.vibes_gmaps.slice(0, 1).map((vibe: string) => (
                          <Badge key={vibe} variant="secondary" className="text-xs px-1 py-0">
                            {vibe}
                          </Badge>
                        ))}
                    </div>

                    <p className="text-xs line-clamp-2 text-muted-foreground flex-1">
                      {restaurant.description_gmaps || restaurant.sub_title || "No description available."}
                    </p>

                    {/* Review count */}
                    {restaurant.reviews_count_gmaps && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {restaurant.reviews_count_gmaps.toLocaleString()} reviews
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Viewing page {currentPage} of {totalPages} • {restaurants.length} restaurants on this page
                </p>
              </div>
              <PaginationControls currentPage={currentPage} totalPages={totalPages} searchParams={searchParams} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
