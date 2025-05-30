"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Loader2, Heart, Search, MapPin, Star, Calendar, Filter, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase, type Restaurant } from "@/lib/supabase-client"

export default function FavoritesPage() {
  const { user, isLoading } = useAuth()
  const [favorites, setFavorites] = useState<Restaurant[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<Restaurant[]>([])
  const [favoritesLoading, setFavoritesLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)

  useEffect(() => {
    async function loadFavorites() {
      if (!user) return

      try {
        // Check if the favorites table exists first
        const { error: tableCheckError } = await supabase.from("favorites").select("count").limit(1).single()

        // If the table doesn't exist, show empty state and log the error
        if (tableCheckError && tableCheckError.message.includes("does not exist")) {
          console.log("Favorites table does not exist yet:", tableCheckError.message)
          setFavorites([])
          setFilteredFavorites([])
          setFavoritesLoading(false)
          return
        }

        // If we get here, the table exists, so proceed with the normal query
        const { data: favoriteData, error: favoriteError } = await supabase
          .from("favorites")
          .select("restaurant_id")
          .eq("user_id", user.id)

        if (favoriteError) {
          console.error("Error fetching favorites:", favoriteError)
          setFavorites([])
          setFilteredFavorites([])
          return
        }

        if (!favoriteData || favoriteData.length === 0) {
          setFavorites([])
          setFilteredFavorites([])
          return
        }

        const restaurantIds = favoriteData.map((fav) => fav.restaurant_id)

        // Get restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurants")
          .select("*")
          .in("id", restaurantIds)

        if (restaurantError) {
          console.error("Error fetching restaurants:", restaurantError)
          return
        }

        setFavorites(restaurantData || [])
        setFilteredFavorites(restaurantData || [])
      } catch (error) {
        console.error("Error in favorites fetch:", error)
        setFavorites([])
        setFilteredFavorites([])
      } finally {
        setFavoritesLoading(false)
      }
    }

    if (!isLoading && user) {
      loadFavorites()
    } else if (!isLoading && !user) {
      setFavoritesLoading(false)
    }
  }, [user, isLoading])

  useEffect(() => {
    // Filter favorites based on search query and selected filter
    let filtered = [...favorites]

    if (searchQuery) {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.location_description_gmaps?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (restaurant.description_gmaps && restaurant.description_gmaps.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (selectedFilter) {
      if (selectedFilter.startsWith("location:")) {
        const location = selectedFilter.replace("location:", "")
        filtered = filtered.filter((restaurant) => restaurant.location_description_gmaps?.toLowerCase() === location.toLowerCase())
      } else if (selectedFilter.startsWith("vibe:")) {
        const vibe = selectedFilter.replace("vibe:", "")
        filtered = filtered.filter(
          (restaurant) => restaurant.vibes_gmaps && restaurant.vibes_gmaps.some((v) => v.toLowerCase() === vibe.toLowerCase()),
        )
      }
    }

    setFilteredFavorites(filtered)
  }, [favorites, searchQuery, selectedFilter])

  const handleRemoveFavorite = async (restaurantId: string) => {
    if (!user) return

    try {
      // Check if the favorites table exists first
      const { error: tableCheckError } = await supabase.from("favorites").select("count").limit(1).single()

      // If the table doesn't exist, just update the local state
      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        console.log("Favorites table does not exist yet, updating local state only")
        setFavorites((prev) => prev.filter((restaurant) => restaurant.id !== restaurantId))
        setFilteredFavorites((prev) => prev.filter((restaurant) => restaurant.id !== restaurantId))
        return
      }

      // If we get here, the table exists, so proceed with the normal query
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("restaurant_id", restaurantId)

      if (error) throw error

      // Update local state
      setFavorites((prev) => prev.filter((restaurant) => restaurant.id !== restaurantId))
      setFilteredFavorites((prev) => prev.filter((restaurant) => restaurant.id !== restaurantId))
    } catch (error) {
      console.error("Error removing favorite:", error)
    }
  }

  // Get unique locations and vibes for filters
  const locations = [...new Set(favorites.map((restaurant) => restaurant.location_description_gmaps).filter(Boolean))] // Filter out null/undefined
  const vibes = [...new Set(favorites.flatMap((restaurant) => restaurant.vibes_gmaps || []))]

  if (!isLoading && !user) {
    redirect("/login?redirect=/favorites")
  }

  if (isLoading || favoritesLoading) {
    return (
      <main className="min-h-screen bg-[#f9f5f0] py-16">
        <div className="container px-4 mx-auto max-w-7xl">
          <Card className="w-full max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-playfair">Loading Favorites...</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f9f5f0] py-16">
      <div className="container px-4 mx-auto max-w-7xl">
        <Card className="w-full max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-playfair">Your Saved Restaurants</CardTitle>
            <CardDescription>Restaurants you've saved for later</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <TabsList>
                  <TabsTrigger value="all">All Saved</TabsTrigger>
                  <TabsTrigger value="recent">Recently Added</TabsTrigger>
                  <TabsTrigger value="visited">Visited</TabsTrigger>
                </TabsList>

                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search saved restaurants..."
                    className="pl-9 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {selectedFilter && (
                <div className="mb-4 flex items-center">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>
                      {selectedFilter.startsWith("location:")
                        ? `Location: ${selectedFilter.replace("location:", "")}`
                        : `Vibe: ${selectedFilter.replace("vibe:", "")}`}
                    </span>
                    <button onClick={() => setSelectedFilter(null)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
              )}

              <TabsContent value="all">
                {filteredFavorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFavorites.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onRemove={() => handleRemoveFavorite(restaurant.id)}
                        onFilterLocation={() => setSelectedFilter(`location:${restaurant.location}`)}
                        onFilterVibe={(vibe) => setSelectedFilter(`vibe:${vibe}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    searchQuery={searchQuery}
                    onClearSearch={() => setSearchQuery("")}
                    onClearFilter={() => setSelectedFilter(null)}
                    hasFilter={!!selectedFilter}
                  />
                )}
              </TabsContent>

              <TabsContent value="recent">
                {filteredFavorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Show most recently added favorites first */}
                    {filteredFavorites
                      .slice()
                      .reverse()
                      .map((restaurant) => (
                        <RestaurantCard
                          key={restaurant.id}
                          restaurant={restaurant}
                          onRemove={() => handleRemoveFavorite(restaurant.id)}
                          onFilterLocation={() => setSelectedFilter(`location:${restaurant.location}`)}
                          onFilterVibe={(vibe) => setSelectedFilter(`vibe:${vibe}`)}
                        />
                      ))}
                  </div>
                ) : (
                  <EmptyState
                    searchQuery={searchQuery}
                    onClearSearch={() => setSearchQuery("")}
                    onClearFilter={() => setSelectedFilter(null)}
                    hasFilter={!!selectedFilter}
                  />
                )}
              </TabsContent>

              <TabsContent value="visited">
                <div className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No visited restaurants yet</h3>
                  <p className="mb-6 text-muted-foreground">
                    Mark restaurants as visited to keep track of your dining experiences
                  </p>
                  <Button asChild>
                    <Link href="/directory">Browse Restaurants</Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {favorites.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Filter By</h3>

                <div className="space-y-4">
                  {locations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Location</h4>
                      <div className="flex flex-wrap gap-2">
                        {locations.map((location) => (
                          <Badge
                            key={location}
                            variant="outline"
                            className="cursor-pointer hover:bg-secondary"
                            onClick={() => setSelectedFilter(`location:${location}`)}
                          >
                            {location}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {vibes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Vibe</h4>
                      <div className="flex flex-wrap gap-2">
                        {vibes.map((vibe) => (
                          <Badge
                            key={vibe}
                            variant="outline"
                            className="cursor-pointer hover:bg-secondary"
                            onClick={() => setSelectedFilter(`vibe:${vibe}`)}
                          >
                            {vibe}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

interface RestaurantCardProps {
  restaurant: Restaurant
  onRemove: () => void
  onFilterLocation: () => void
  onFilterVibe: (vibe: string) => void
}

function RestaurantCard({ restaurant, onRemove, onFilterLocation, onFilterVibe }: RestaurantCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image
          src={restaurant.cover_image_url_gmaps || "/placeholder.svg?height=300&width=400"}
          alt={restaurant.name || "Restaurant image"}
          fill
          className="object-cover"
        />
        {/* Remove button remains inside the card */}
        <button
          onClick={(e) => {
            e.preventDefault(); // Prevent default button behavior
            e.stopPropagation(); // Stop event from propagating
            onRemove();
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white z-10"
        >
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
        </button>
      </div>

      <CardContent className="p-4">
        {/* Main content wrapped in Link */}
        <Link href={`/restaurant/${restaurant.id}`} className="block">
          <h3 className="text-lg font-semibold font-playfair mb-1">{restaurant.name}</h3>

          <div className="flex items-center mb-2">
            {/* Location and Rating */}
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {restaurant.location_description_gmaps}
            </div>
            <div className="mx-2">•</div>
            <div className="flex items-center">
              <Star className="w-3.5 h-3.5 mr-1 text-yellow-400" />
              <span className="text-sm">{restaurant.total_score_gmaps?.toFixed(1) || "4.5"}</span>
            </div>
          </div>

          <p className="text-sm line-clamp-2 text-muted-foreground">{restaurant.description_gmaps}</p>
        </Link>

        {/* Filter elements and View Details button are outside the main Link */}
        <div className="flex flex-wrap gap-1 mb-3 mt-2">
          {restaurant.vibes_gmaps &&
            restaurant.vibes_gmaps.map((vibe: string) => (
              <div // Changed from button to div
                key={vibe}
                onClick={(e) => {
                  e.preventDefault(); // Prevent default behavior
                  e.stopPropagation(); // Stop event from propagating
                  onFilterVibe(vibe);
                }}
                className="inline-flex items-center border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer" // Added cursor-pointer
              >
                {vibe}
              </div>
            ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
          {/* Replaced Button with Link styled as a button */}
          <Link
            href={`/restaurant/${restaurant.id}`}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3" // Added button styling classes
          >
            View Details
          </Link>
          <span className="text-xs text-muted-foreground">Saved on {new Date().toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}

interface EmptyStateProps {
  searchQuery: string
  onClearSearch: () => void
  onClearFilter: () => void
  hasFilter: boolean
}

function EmptyState({ searchQuery, onClearSearch, onClearFilter, hasFilter }: EmptyStateProps) {
  if (searchQuery || hasFilter) {
    return (
      <div className="py-12 text-center">
        <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No matching restaurants found</h3>
        <p className="mb-6 text-muted-foreground">
          Try adjusting your search or filters to find what you're looking for
        </p>
        {searchQuery && (
          <Button variant="outline" onClick={onClearSearch} className="mx-2">
            Clear Search
          </Button>
        )}
        {hasFilter && (
          <Button variant="outline" onClick={onClearFilter} className="mx-2">
            Clear Filter
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="py-12 text-center">
      <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="mb-2 text-lg font-semibold">No saved restaurants yet</h3>
      <p className="mb-6 text-muted-foreground">When you find restaurants you love, save them here for easy access</p>
      <Button asChild>
        <Link href="/directory">Browse Restaurants</Link>
      </Button>
    </div>
  )
}
