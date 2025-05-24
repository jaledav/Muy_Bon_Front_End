import { Suspense } from "react"
import DirectoryHeader from "@/components/directory-header"
import RestaurantGrid from "@/components/restaurant-grid"
import FilterSidebar from "@/components/filter-sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function DirectoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <main className="min-h-screen bg-[#f9f5f0]">
      <DirectoryHeader />
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:w-1/4">
            <Suspense fallback={<div>Loading filters...</div>}>
              <FilterSidebar />
            </Suspense>
          </div>
          <div className="w-full lg:w-3/4">
            <Suspense fallback={<RestaurantGridSkeleton />}>
              <RestaurantGrid searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}

function RestaurantGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(9)].map((_, i) => (
        <Skeleton key={i} className="h-[300px] rounded-lg" />
      ))}
    </div>
  )
}
