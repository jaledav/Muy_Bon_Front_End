import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

// This would normally be fetched from your Xano database
const trendingRestaurants = [
  {
    id: 4,
    name: "Cadet",
    location: "Newington Green",
    image: "/placeholder.svg?height=300&width=400",
    price: "£££",
    vibes: ["Wine Bar", "Small Plates", "Cozy"],
    description: "New wine bar from the team behind Jolene, focusing on natural wines and seasonal small plates.",
  },
  {
    id: 5,
    name: "Planque",
    location: "Haggerston",
    image: "/placeholder.svg?height=300&width=400",
    price: "£££",
    vibes: ["Wine Library", "Modern French", "Cool"],
    description: "Part wine library, part restaurant, serving creative French-inspired dishes in a stylish space.",
  },
  {
    id: 6,
    name: "Supa Ya Ramen",
    location: "Hackney",
    image: "/placeholder.svg?height=300&width=400",
    price: "££",
    vibes: ["Casual", "Innovative", "Fun"],
    description: "Cult ramen spot known for creative, non-traditional bowls and a playful approach.",
  },
]

export default function TrendingRestaurants() {
  return (
    <section className="mb-16">
      <div className="flex items-center mb-6 space-x-2">
        <h2 className="text-2xl font-bold font-playfair">Trending Now</h2>
        <TrendingUp className="w-5 h-5 text-primary" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trendingRestaurants.map((restaurant) => (
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
