"use client"

import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { searchRestaurants, type Restaurant } from "@/lib/supabase-client"
import { MapPinIcon, Star } from "lucide-react"
import { PaginationControls } from "@/components/pagination-controls"
import { useState, useEffect } from "react"

interface RestaurantGridProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

const ITEMS_PER_PAGE = 24

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const [imageSrc, setImageSrc] = useState(
    restaurant.cover_image_url_gmaps || "/placeholder.svg?height=300&width=400&text=Restaurant",
  )
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    if (!imageError) {
      console.log(`Image failed to load for restaurant: ${restaurant.name}`)
      setImageError(true)
      setImageSrc("/placeholder.svg?height=300&width=400&text=Restaurant")
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden h-full hover:shadow-lg transition-shadow duration-200 ease-in-out">
      <Link href={`/restaurant/${restaurant.id || restaurant.google_place_id}`} className="block group">
        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={restaurant.name || "Restaurant image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, (max-width: 1536px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
            onError={handleImageError}
            priority={false}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
      </Link>
      <CardHeader className="p-4">
        <Link href={`/restaurant/${restaurant.id || restaurant.google_place_id}`} className="block group">
          <CardTitle className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2">
            {restaurant.name}
          </CardTitle>
        </Link>
        {restaurant.sub_title && <p className="text-xs text-muted-foreground truncate">{restaurant.sub_title}</p>}
      </CardHeader>
      <CardContent className="p-4 flex-grow text-xs">
        <div className="flex items-center mb-2 text-muted-foreground">
          {restaurant.total_score_gmaps != null && (
            <div className="flex items-center mr-2">
              <Star className="w-3 h-3 mr-1 text-yellow-400 fill-yellow-400" />
              <span>{restaurant.total_score_gmaps.toFixed(1)}</span>
              {restaurant.reviews_count_gmaps != null && (
                <span className="ml-1">({restaurant.reviews_count_gmaps})</span>
              )}
            </div>
          )}
          {restaurant.price_range_gmaps && (
            <Badge variant="outline" className="mr-2 text-xs px-1.5 py-0.5">
              {restaurant.price_range_gmaps}
            </Badge>
          )}
        </div>
        {(restaurant.neighborhood_gmaps || restaurant.city_gmaps) && (
          <div className="flex items-center text-muted-foreground mb-2">
            <MapPinIcon className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{restaurant.neighborhood_gmaps || restaurant.city_gmaps}</span>
          </div>
        )}
        {restaurant.vibes_gmaps && restaurant.vibes_gmaps.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {restaurant.vibes_gmaps.slice(0, 2).map((vibe) => (
              <Badge key={vibe} variant="secondary" className="text-xs px-1.5 py-0.5">
                {vibe}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 mt-auto">
        <Link href={`/restaurant/${restaurant.id || restaurant.google_place_id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function RestaurantGrid({ searchParams }: RestaurantGridProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const params = searchParams
        const page = typeof params?.page === "string" ? Number(params.page) : 1
        const limit = typeof params?.limit === "string" ? Number(params.limit) : ITEMS_PER_PAGE

        const searchTerm = typeof params?.search === "string" ? params.search : undefined
        const location = typeof params?.location === "string" ? params.location : undefined
        const vibes = typeof params?.vibes === "string" ? params.vibes.split(",") : undefined
        const priceRange = typeof params?.price === "string" ? params.price : undefined
        const minRatingParam = typeof params?.minRating === "string" ? Number(params.minRating) : undefined
        const minRating = Number.isFinite(minRatingParam) ? minRatingParam : undefined

        const filters: Parameters<typeof searchRestaurants>[0] = {
          page,
          limit,
          searchTerm,
          location,
          vibes,
          priceRange,
          minRating,
        }

        const data = await searchRestaurants(filters)
        setRestaurants(data.restaurants)
        setTotalCount(data.totalCount)
      } catch (err) {
        console.error("Error fetching restaurants in RestaurantGrid:", err)
        setError("Could not load restaurants. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  const page = typeof searchParams?.page === "string" ? Number(searchParams.page) : 1
  const limit = typeof searchParams?.limit === "string" ? Number(searchParams.limit) : ITEMS_PER_PAGE
  const totalPages = Math.ceil(totalCount / limit)
  const searchTerm = typeof searchParams?.search === "string" ? searchParams.search : undefined

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-lg">Loading restaurants...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-semibold">{error}</p>
        <p className="text-sm text-muted-foreground">There was an issue fetching data. Please try again later.</p>
      </div>
    )
  }

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
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
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
