"use client"

import type React from "react" // Good practice to import React type if using React specific types
import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
// import { Input } from "@/components/ui/input"; // Standard shadcn/ui input, commented out for testing
import { Search } from "lucide-react"

// This is the version of DirectoryHeader focused on the search input,
// using a default export and a basic HTML input for testing.

export default function DirectoryHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [inputValue, setInputValue] = useState(searchParams.get("search") || "")

  useEffect(() => {
    // Sync from URL to input if URL changes externally
    setInputValue(searchParams.get("search") || "")
  }, [searchParams])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value
    setInputValue(newSearchTerm) // Update local state immediately

    // Update URL immediately on every change (NO DEBOUNCE for this test)
    const params = new URLSearchParams(searchParams.toString())
    if (newSearchTerm.trim()) {
      params.set("search", newSearchTerm.trim())
    } else {
      params.delete("search")
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      // URL is already up-to-date due to handleInputChange in this simplified version
    }
  }

  return (
    <div className="px-4 py-16 bg-[#f9f5f0] dark:bg-slate-800">
      <div className="container mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold tracking-tight font-playfair dark:text-slate-100">
          Restaurant Directory
        </h1>
        <p className="max-w-3xl mb-8 text-lg text-muted-foreground dark:text-slate-300">
          Explore our curated selection of London's finest dining establishments, from neighborhood gems to celebrated
          institutions.
        </p>
        <div className="relative max-w-xl">
          {/* Using a basic HTML input for testing */}
          <input
            type="search"
            placeholder="Search restaurants by name, cuisine, etc..."
            className="w-full h-12 pl-10 pr-4 text-base border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600" // Basic styling
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <Search className="absolute w-5 h-5 text-muted-foreground left-3 top-1/2 transform -translate-y-1/2 dark:text-slate-400" />
        </div>
      </div>
    </div>
  )
}
