import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getRandomPlaceholder } from "@/lib/utils"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"

interface Restaurant {
  id: number
  name: string
  location: string
  image: string
  price: string
  vibes: string[]
  description: string
  popular_times_histogram_gmaps?: {
    Monday: { hour: number; occupancyPercent: number }[]
  }
  popular_times_live_text_gmaps?: string
}

interface ChatbotResponseProps {
  response: string
  restaurants: Restaurant[]
}

export function ChatbotResponse({ response, restaurants }: ChatbotResponseProps) {
  // Debugging log to verify received props
  console.log("ChatbotResponse props:", { response, restaurants });

  return (
    <div className="mt-8 space-y-6 text-left">
      <p className="text-lg">{response}</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} className="block">
            <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
              <div className="relative h-48">
                <ImageWithFallback
                  src={restaurant.image || getRandomPlaceholder()}
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
                {restaurant.popular_times_histogram_gmaps && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold">Popular Times</h4>
                    <p className="text-xs text-muted-foreground">Data for Monday:</p>
                    <div className="flex gap-1 mt-2">
                      {restaurant.popular_times_histogram_gmaps.Monday.map((timeSlot, index) => (
                        <div key={index} className="flex-1 text-center">
                          <div
                            className="h-8 bg-primary rounded"
                            style={{ height: `${timeSlot.occupancyPercent}%` }}
                          ></div>
                          <span className="text-xs mt-1 block">{timeSlot.hour}:00</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {restaurant.popular_times_live_text_gmaps && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Live Status: {restaurant.popular_times_live_text_gmaps}
                  </p>
                )}
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
