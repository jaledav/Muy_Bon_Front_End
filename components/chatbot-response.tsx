import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Restaurant {
  id: number
  name: string
  location: string
  image: string
  price: string
  vibes: string[]
  description: string
}

interface ChatbotResponseProps {
  response: string
  restaurants: Restaurant[]
}

export function ChatbotResponse({ response, restaurants }: ChatbotResponseProps) {
  return (
    <div className="mt-8 space-y-6 text-left">
      <p className="text-lg">{response}</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
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

      <div className="text-center">
        <Link href="/directory" className="text-sm underline underline-offset-4 hover:text-primary">
          View all restaurants in our directory
        </Link>
      </div>
    </div>
  )
}
