import { Suspense } from "react"
import Hero from "@/components/hero"
import FeaturedRestaurants from "@/components/featured-restaurants"
import TrendingRestaurants from "@/components/trending-restaurants"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f9f5f0]">
      <Hero />
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        <Suspense fallback={<FeaturedSkeleton />}>
          <FeaturedRestaurants />
        </Suspense>

        <Suspense fallback={<TrendingSkeleton />}>
          <TrendingRestaurants />
        </Suspense>
      </div>
    </main>
  )
}

function FeaturedSkeleton() {
  return (
    <div className="mb-16">
      <Skeleton className="w-48 h-8 mb-6" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[300px] rounded-lg" />
        ))}
      </div>
    </div>
  )
}

function TrendingSkeleton() {
  return (
    <div className="mb-16">
      <Skeleton className="w-48 h-8 mb-6" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[300px] rounded-lg" />
        ))}
      </div>
    </div>
  )
}
