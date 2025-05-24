"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout)
      timeout = null
    }
    timeout = setTimeout(() => func(...args), waitFor)
  }

  return debounced
}


export default function DirectoryHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

  const updateSearchQuery = (newSearchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newSearchTerm) {
      params.set("search", newSearchTerm)
    } else {
      params.delete("search")
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Debounced version of updateSearchQuery
  const debouncedUpdateSearchQuery = useCallback(debounce(updateSearchQuery, 500), [pathname, searchParams, router])

  useEffect(() => {
    // Sync searchTerm state if URL changes from outside (e.g. browser back/forward)
    setSearchTerm(searchParams.get("search") || "")
  }, [searchParams])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value
    setSearchTerm(newSearchTerm)
    debouncedUpdateSearchQuery(newSearchTerm)
  }

  return (
    <div className="px-4 py-16 bg-[#f9f5f0]">
      <div className="container mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold tracking-tight font-playfair">Restaurant Directory</h1>
        <p className="max-w-3xl mb-8 text-lg text-muted-foreground">
          Explore our curated selection of London's finest dining establishments, from neighborhood gems to celebrated
          institutions.
        </p>
        <div className="relative max-w-xl">
          <Input
            type="search"
            placeholder="Search restaurants by name, cuisine, etc..."
            className="w-full pl-10 pr-4 py-2 text-base rounded-md shadow-sm h-12"
            value={searchTerm}
            onChange={handleInputChange}
          />
          <Search className="absolute w-5 h-5 text-muted-foreground left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>
    </div>
  )
}
