import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// This would normally be fetched from your Xano database
const featuredRestaurants = [
  {
    id: 1,
    name: "The Clove Club",
    location: "Shoreditch",
    image: "/placeholder.svg?height=300&width=400",
    price: "££££",
    vibes: ["Fine Dining", "Tasting Menu", "Modern British"],
    description: "Michelin-starred restaurant in Shoreditch Town Hall serving innovative British cuisine.",
  },
  {
    id: 2,
    name: "Brat",
    location: "Shoreditch",
    image: "/placeholder.svg?height=300&width=400",
    price: "£££",
    vibes: ["Buzzy", "Wood-fired", "Basque"],
    description: "Michelin-starred spot known for wood-fired cooking and excellent seafood.",
  },
  {
    id: 3,
    name: "Lyle's",
    location: "Shoreditch",
    image: "/placeholder.svg?height=300&width=400",
    price: "£££",
    vibes: ["Minimalist", "Seasonal", "Modern British"],
    description: "Michelin-starred restaurant with a daily changing menu of seasonal British food.",
  },
]

export default function FeaturedRestaurants() {
  return (
    <section className="mb-16">
      <h2 className="mb-6 text-2xl font-bold font-playfair">Featured Restaurants</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featuredRestaurants.map((restaurant) => (
          <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} className="block">
            <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
              <div className="relative h-48">
                <Image
                  src={restaurant.image || "/placeholder.svg"}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold font-playfair">{restaurant.name}</h3>
                  <span className="text-sm text-muted-foreground">{restaurant.price}</span>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">{restaurant.location}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {restaurant.vibes.map((vibe) => (
                    <Badge key={vibe} variant="outline" className="text-xs">
                      {vibe}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm">{restaurant.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
