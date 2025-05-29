"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  searchParams: { [key: string]: string | string[] | undefined }
}

export function PaginationControls({ currentPage, totalPages, searchParams }: PaginationControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const urlSearchParams = useSearchParams()

  const handlePageChange = useCallback(
    (page: number) => {
      console.log("=== PAGINATION DEBUG ===")
      console.log("Clicked page:", page)
      console.log("Current page:", currentPage)
      console.log("Current pathname:", pathname)
      console.log("Current search params:", urlSearchParams.toString())
      console.log("Props searchParams:", searchParams)

      // Create new URLSearchParams
      const params = new URLSearchParams(urlSearchParams.toString())

      // Set or remove page parameter
      if (page === 1) {
        params.delete("page")
      } else {
        params.set("page", page.toString())
      }

      const newUrl = `${pathname}?${params.toString()}`
      console.log("New URL:", newUrl)

      // Navigate
      router.push(newUrl)

      // Force refresh
      setTimeout(() => {
        window.location.reload()
      }, 100)
    },
    [router, pathname, urlSearchParams, currentPage, searchParams],
  )

  const getVisiblePages = () => {
    const delta = 2
    const pages = []

    // Always show first page
    pages.push(1)

    // Add dots if needed
    if (currentPage - delta > 2) {
      pages.push("...")
    }

    // Add pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }

    // Add dots if needed
    if (currentPage + delta < totalPages - 1) {
      pages.push("...")
    }

    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  console.log("Pagination render - Current:", currentPage, "Total:", totalPages)

  return (
    <div className="space-y-4">
      {/* Debug Info */}
      <div className="text-xs text-gray-500 text-center">
        <p>
          Debug: Current page = {currentPage}, Total pages = {totalPages}
        </p>
        <p>URL params: {urlSearchParams.toString()}</p>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <div key={`page-${index}`}>
              {page === "..." ? (
                <span className="px-3 py-2 text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page as number)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Manual Test Buttons */}
      {/* Force page buttons removed as requested */}
    </div>
  )
}
