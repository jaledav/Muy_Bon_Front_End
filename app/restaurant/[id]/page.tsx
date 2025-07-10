"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Star, ArrowLeft, Info, Sparkles, Tag } from "lucide-react"
import { fetchRestaurantById, testCSESnippets, testImageUrls, type RestaurantWithReviews } from "@/lib/supabase-client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase-client"

interface SimilarPlace {
  id: string
  name: string
  cover_image_url?: string | null
  vibes_gmaps?: string[] | null
}

type RestaurantWithDetails = Omit<RestaurantWithReviews, "people_also_search_gmaps"> & {
  people_also_search_gmaps?: SimilarPlace[] | null
}

const findSimilarByVibe = (
  currentRestaurantVibes: string[] | null | undefined,
  potentialSimilar: SimilarPlace[] | null | undefined,
  currentRestaurantId: string,
  limit = 3,
): SimilarPlace[] => {
  if (!currentRestaurantVibes || currentRestaurantVibes.length === 0 || !potentialSimilar) {
    return []
  }

  const similarWithScores = potentialSimilar
    .filter((place) => place.id !== currentRestaurantId)
    .map((place) => {
      let sharedVibesCount = 0
      if (place.vibes_gmaps) {
        place.vibes_gmaps.forEach((vibe) => {
          if (currentRestaurantVibes.includes(vibe)) {
            sharedVibesCount++
          }
        })
      }
      return { ...place, sharedVibesCount }
    })
    .filter((place) => place.sharedVibesCount > 0)
    .sort((a, b) => b.sharedVibesCount - a.sharedVibesCount)

  return similarWithScores.slice(0, limit)
}

// Helper function to validate and clean image URLs
const validateImageUrl = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== "string") return null

  // Remove any whitespace
  const cleanUrl = url.trim()

  // Check if it's a valid URL
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    return null
  }

  // Check for common image extensions or Google image patterns
  const isValidImageUrl =
    cleanUrl.includes("googleusercontent.com") ||
    cleanUrl.includes("maps.googleapis.com") ||
    cleanUrl.includes("gstatic.com") ||
    /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(cleanUrl)

  return isValidImageUrl ? cleanUrl : null
}

// Helper function to process image URLs array
const processImageUrls = (imageUrls: any): string[] => {
  console.log("[processImageUrls] Input:", imageUrls, "Type:", typeof imageUrls)

  if (!imageUrls) return []

  let urls: string[] = []

  if (typeof imageUrls === "string") {
    try {
      // Try to parse as JSON if it's a string
      const parsed = JSON.parse(imageUrls)
      if (Array.isArray(parsed)) {
        urls = parsed
      } else {
        urls = [imageUrls]
      }
    } catch {
      // If not JSON, treat as single URL
      urls = [imageUrls]
    }
  } else if (Array.isArray(imageUrls)) {
    urls = imageUrls
  }

  // Filter and validate URLs
  const validUrls = urls.map((url) => validateImageUrl(url)).filter((url): url is string => url !== null)

  console.log("[processImageUrls] Valid URLs:", validUrls)
  return validUrls
}

const HeroCollage: React.FC<{ images: string[]; altText: string; useLowBandwidth: boolean }> = ({
  images,
  altText,
  useLowBandwidth,
}) => {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const validImages = images.filter(Boolean)
  const placeholder = "/placeholder.svg?height=600&width=800"
  const lowBandwidthPlaceholder = "/placeholder.svg?height=400&width=600"

  console.log("[HeroCollage] Received images:", images)
  console.log("[HeroCollage] Valid images:", validImages)
  console.log("[HeroCollage] Failed images:", Array.from(failedImages))
  console.log("[HeroCollage] Loaded images:", Array.from(loadedImages))

  const handleImageError = (imageUrl: string, imageIndex: number) => {
    console.warn(`[HeroCollage] Image failed to load (${imageIndex + 1}): ${imageUrl}`)
    setFailedImages((prev) => new Set([...prev, imageUrl]))
  }

  const handleImageLoad = (imageUrl: string, imageIndex: number) => {
    console.log(`[HeroCollage] Image loaded successfully (${imageIndex + 1}): ${imageUrl}`)
    setLoadedImages((prev) => new Set([...prev, imageUrl]))
  }

  const getSrc = (url?: string, index?: number) => {
    if (useLowBandwidth) return lowBandwidthPlaceholder
    if (!url || failedImages.has(url)) return placeholder
    return url
  }

  if (useLowBandwidth || validImages.length === 0) {
    console.log("[HeroCollage] Using placeholder - low bandwidth or no images")
    return (
      <Image
        src={placeholder || "/placeholder.svg"}
        alt={altText}
        fill
        className="object-cover dark:opacity-80"
        priority
        sizes="100vw"
      />
    )
  }

  if (validImages.length === 1) {
    return (
      <Image
        src={getSrc(validImages[0], 0) || "/placeholder.svg"}
        alt={`${altText} 1`}
        fill
        className="object-cover dark:opacity-80"
        priority
        sizes="100vw"
        onError={() => handleImageError(validImages[0], 0)}
        onLoad={() => handleImageLoad(validImages[0], 0)}
      />
    )
  }

  if (validImages.length === 2) {
    return (
      <div className="grid grid-cols-2 h-full">
        <div className="relative h-full">
          <Image
            src={getSrc(validImages[0], 0) || "/placeholder.svg"}
            alt={`${altText} 1`}
            fill
            className="object-cover dark:opacity-80"
            sizes="50vw"
            onError={() => handleImageError(validImages[0], 0)}
            onLoad={() => handleImageLoad(validImages[0], 0)}
          />
        </div>
        <div className="relative h-full">
          <Image
            src={getSrc(validImages[1], 1) || "/placeholder.svg"}
            alt={`${altText} 2`}
            fill
            className="object-cover dark:opacity-80"
            sizes="50vw"
            onError={() => handleImageError(validImages[1], 1)}
            onLoad={() => handleImageLoad(validImages[1], 1)}
          />
        </div>
      </div>
    )
  }

  if (validImages.length === 3) {
    return (
      <div className="grid grid-cols-3 h-full">
        <div className="relative col-span-2 h-full">
          <Image
            src={getSrc(validImages[0], 0) || "/placeholder.svg"}
            alt={`${altText} 1`}
            fill
            className="object-cover dark:opacity-80"
            sizes="66vw"
            onError={() => handleImageError(validImages[0], 0)}
            onLoad={() => handleImageLoad(validImages[0], 0)}
          />
        </div>
        <div className="grid grid-rows-2 col-span-1 h-full">
          <div className="relative h-full">
            <Image
              src={getSrc(validImages[1], 1) || "/placeholder.svg"}
              alt={`${altText} 2`}
              fill
              className="object-cover dark:opacity-80"
              sizes="33vw"
              onError={() => handleImageError(validImages[1], 1)}
              onLoad={() => handleImageLoad(validImages[1], 1)}
            />
          </div>
          <div className="relative h-full">
            <Image
              src={getSrc(validImages[2], 2) || "/placeholder.svg"}
              alt={`${altText} 3`}
              fill
              className="object-cover dark:opacity-80"
              sizes="33vw"
              onError={() => handleImageError(validImages[2], 2)}
              onLoad={() => handleImageLoad(validImages[2], 2)}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 grid-rows-2 h-full">
      {validImages.slice(0, 4).map((img, idx) => (
        <div key={`hero-${img || "placeholder"}-${idx}`} className="relative h-full">
          <Image
            src={getSrc(img, idx) || "/placeholder.svg"}
            alt={`${altText} ${idx + 1}`}
            fill
            className="object-cover dark:opacity-80"
            sizes="50vw"
            onError={() => handleImageError(img, idx)}
            onLoad={() => handleImageLoad(img, idx)}
          />
        </div>
      ))}
    </div>
  )
}

const RestaurantPageSkeleton = () => (
  <div className="min-h-screen bg-[#f9f5f0] dark:bg-gray-900">
    <div className="relative w-full h-[60vh] md:h-[70vh]">
      <Skeleton className="w-full h-full" />
    </div>
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Skeleton className="h-6 w-32 mb-6" />
      <div className="lg:flex lg:space-x-8">
        <div className="lg:w-2/3 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="lg:w-1/3 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  </div>
)

const ErrorMessage = ({ error }: { error: string }) => (
  <div className="min-h-screen bg-[#f9f5f0] dark:bg-gray-900 flex items-center justify-center">
    <Card className="w-full max-w-md mx-4">
      <CardContent className="p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Error</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <div className="space-y-2">
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/directory")} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
)

const NotFoundMessage = () => (
  <div className="min-h-screen bg-[#f9f5f0] dark:bg-gray-900 flex items-center justify-center">
    <Card className="w-full max-w-md mx-4">
      <CardContent className="p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Restaurant Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The restaurant you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => (window.location.href = "/directory")} className="w-full">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
        </Button>
      </CardContent>
    </Card>
  </div>
)

interface CriticReviewDisplay {
  id: string
  publication_critic?: string | null
  review_snippet_critic?: string | null
  review_url_critic?: string | null
  summary_critic?: string | null
  reviewer_name_critic?: string | null
  stars_critic?: number | null
}

interface CseReviewDisplay {
  id: string
  publication_cse?: string | null
  domain_cse?: string | null
  review_snippet_cse?: string | null
  og_description_cse?: string | null
  review_url_cse?: string | null
  reviewer_name_cse?: string | null
  stars_cse?: number | null
}

const ReviewCard = ({ review, type }: { review: CriticReviewDisplay | CseReviewDisplay; type: "critic" | "cse" }) => {
  if (type === "critic") {
    const criticReview = review as CriticReviewDisplay
    return (
      <Card className="p-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-base">{criticReview.publication_critic || "Critical Review"}</h4>
            {criticReview.reviewer_name_critic && (
              <p className="text-sm text-muted-foreground">by {criticReview.reviewer_name_critic}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {criticReview.stars_critic && (
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="text-sm font-medium">{criticReview.stars_critic}</span>
              </div>
            )}
            {criticReview.review_url_critic && (
              <Button variant="ghost" size="sm" asChild>
                <a href={criticReview.review_url_critic} target="_blank" rel="noopener noreferrer" className="text-xs">
                  Read Full
                </a>
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {criticReview.review_snippet_critic || criticReview.summary_critic || "No review text available."}
        </p>
      </Card>
    )
  } else {
    const cseReview = review as CseReviewDisplay
    return (
      <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-l-4 border-l-blue-500">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-base">
              {cseReview.publication_cse || cseReview.domain_cse || "Critical Review"}
            </h4>
            {cseReview.reviewer_name_cse && (
              <p className="text-sm text-muted-foreground">by {cseReview.reviewer_name_cse}</p>
            )}
            {cseReview.domain_cse && cseReview.publication_cse !== cseReview.domain_cse && (
              <p className="text-xs text-muted-foreground">from {cseReview.domain_cse}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {cseReview.stars_cse && (
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="text-sm font-medium">{cseReview.stars_cse}</span>
              </div>
            )}
            {cseReview.review_url_cse && (
              <Button variant="ghost" size="sm" asChild>
                <a href={cseReview.review_url_cse} target="_blank" rel="noopener noreferrer" className="text-xs">
                  Read Full
                </a>
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {cseReview.og_description_cse || cseReview.review_snippet_cse || "No review text available."}
        </p>
      </Card>
    )
  }
}

export default function RestaurantPage() {
  const { user } = useAuth()
  const params = useParams<{ id: string }>()

  const id = React.useMemo(() => {
    if (!params?.id) return null
    const rawId = params.id
    if (rawId === "undefined" || rawId === "null" || !rawId.trim()) return null
    try {
      return decodeURIComponent(rawId)
    } catch (error) {
      console.error("Failed to decode restaurant ID:", rawId, error)
      return null
    }
  }, [params?.id])

  const [restaurant, setRestaurant] = useState<RestaurantWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStickyHeaderVisible, setIsStickyHeaderVisible] = useState(false)
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>("about")
  const [isFavorited, setIsFavorited] = useState(false)
  const [useLowBandwidth, setUseLowBandwidth] = useState(false)
  const [similarPlacesByVibe, setSimilarPlacesByVibe] = useState<SimilarPlace[]>([])

  const heroRef = useRef<HTMLDivElement>(null)
  const reviewsRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const openingTimesRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAccordionItem = localStorage.getItem(`restaurantAccordion-${id}`)
      if (savedAccordionItem) {
        setActiveAccordionItem(savedAccordionItem)
      }
      // @ts-ignore
      if (navigator.connection && navigator.connection.saveData) {
        setUseLowBandwidth(true)
      }
    }
  }, [id])

  const handleAccordionChange = (value: string) => {
    setActiveAccordionItem(value)
    if (typeof window !== "undefined") {
      localStorage.setItem(`restaurantAccordion-${id}`, value)
    }
  }

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>, accordionValue?: string) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" })
      if (accordionValue) {
        handleAccordionChange(accordionValue)
      }
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom
        setIsStickyHeaderVisible(heroBottom < 0)
      } else {
        setIsStickyHeaderVisible(window.scrollY > 400)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    async function loadRestaurant() {
      if (!id) {
        setError("Invalid restaurant ID")
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)

        // Run tests first
        console.log("[RestaurantPage] Running CSE snippets test...")
        await testCSESnippets(id)
        
        console.log("[RestaurantPage] Running image URLs test...")
        await testImageUrls(id)

        const data = (await fetchRestaurantById(id)) as RestaurantWithDetails
        if (!data) {
          setError("Restaurant not found")
          setRestaurant(null)
        } else {
          setRestaurant(data)
          console.log("[RestaurantPage] ===== RESTAURANT DATA LOADED =====")
          console.log("[RestaurantPage] Restaurant name:", data.name)
          console.log("[RestaurantPage] Restaurant ID:", data.id)
          console.log("[RestaurantPage] Google reviews count:", data.google_user_reviews?.length || 0)
          console.log("[RestaurantPage] Critic reviews count:", data.critic_reviews?.length || 0)
          console.log("[RestaurantPage] CSE review snippets count:", data.cse_review_snippets?.length || 0)
          console.log("[RestaurantPage] CSE review snippets data:", data.cse_review_snippets)
          console.log("[RestaurantPage] Cover image URL:", data.cover_image_url_gmaps)
          console.log("[RestaurantPage] Image URLs:", data.image_urls_gmaps)
          console.log("[RestaurantPage] =====================================")

          if (data.id) {
            const similar = findSimilarByVibe(data.vibes_gmaps, data.people_also_search_gmaps, data.id)
            setSimilarPlacesByVibe(similar)
          }
        }
      } catch (err: any) {
        console.error("Error loading restaurant:", err)
        setError(err.message || "Failed to load restaurant details")
      } finally {
        setLoading(false)
      }
    }
    loadRestaurant()
  }, [id])

  const toggleFavorite = async () => {
    if (!user) {
      window.location.href = `/login?redirect=/restaurant/${id}`
      return
    }

    if (!restaurant) {
      console.error("No restaurant data available")
      return
    }

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("restaurant_id", restaurant.id)

        if (error) throw error
        setIsFavorited(false)
      } else {
        const { error } = await supabase.from("favorites").insert([
          {
            user_id: user.id,
            restaurant_id: restaurant.id,
          },
        ])

        if (error) throw error
        setIsFavorited(true)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  useEffect(() => {
    async function checkFavorited() {
      if (!user || !restaurant) return

      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("restaurant_id", restaurant.id)

        if (error) {
          console.log("Error checking favorite status:")
          console.dir(error)
          return
        }

        setIsFavorited(data !== null && data.length > 0)
      } catch (error: any) {
        console.log("Error checking favorite status (catch block):")
        console.dir(error)
      }
    }

    checkFavorited()
  }, [user, restaurant])

  if (loading) return <RestaurantPageSkeleton />
  if (error) return <ErrorMessage error={error} />
  if (!restaurant) return <NotFoundMessage />

  const {
    name,
    cover_image_url_gmaps,
    total_score_gmaps,
    reviews_count_gmaps,
    reserve_table_url_gmaps,
    maps_search_url_gmaps,
    price_range_gmaps,
    vibes_gmaps,
    description_gmaps,
    phone_gmaps,
    website_gmaps,
    opening_hours_gmaps,
    popular_times_live_text_gmaps,
    popular_times_live_percent_gmaps,
    menu_url_gmaps,
    image_urls_gmaps,
    google_user_reviews,
    critic_reviews,
    cse_review_snippets,
    popular_times_histogram_gmaps,
    reviews_distribution_gmaps,
    sub_title,
    booking_links_gmaps,
    permanently_closed_gmaps,
    temporarily_closed_gmaps,
    people_also_search_gmaps,
  } = restaurant

  const criticSummary =
    critic_reviews?.find((r: { summary_critic: string | null }) => r.summary_critic)?.summary_critic ||
    description_gmaps

  // Enhanced CSE snippets filtering with detailed logging
  console.log("[RestaurantPage] ===== CSE FILTERING DEBUG =====")
  console.log("[RestaurantPage] Raw CSE snippets:", cse_review_snippets)
  console.log("[RestaurantPage] Raw critic reviews:", critic_reviews)

  const uniqueCriticPublications = new Set(
    critic_reviews?.map((r: { publication_critic: string | null }) => r.publication_critic?.toLowerCase()),
  )

  console.log("[RestaurantPage] Unique critic publications:", Array.from(uniqueCriticPublications))

  const filteredCseSnippets = cse_review_snippets?.filter(
    (s: {
      publication_cse: string | null
      domain_cse: string | null
    }) => {
      const pubName = (s.publication_cse || s.domain_cse)?.toLowerCase()
      const shouldInclude = pubName ? !uniqueCriticPublications.has(pubName) : true
      console.log(`[RestaurantPage] CSE snippet ${s.id}: pubName="${pubName}", shouldInclude=${shouldInclude}`)
      return shouldInclude
    },
  )

  console.log("[RestaurantPage] Filtered CSE snippets:", filteredCseSnippets)
  console.log("[RestaurantPage] ================================")

  // Enhanced image processing
  console.log("[RestaurantPage] ===== IMAGE PROCESSING DEBUG =====")
  console.log("[RestaurantPage] Raw cover_image_url_gmaps:", cover_image_url_gmaps)
  console.log("[RestaurantPage] Raw image_urls_gmaps:", image_urls_gmaps)
  
  const processedImageUrls = processImageUrls(image_urls_gmaps)
  const validCoverImage = validateImageUrl(cover_image_url_gmaps)
  
  console.log("[RestaurantPage] Processed image URLs:", processedImageUrls)
  console.log("[RestaurantPage] Valid cover image:", validCoverImage)

  const heroImages = processedImageUrls.length > 0 
    ? processedImageUrls 
    : validCoverImage 
      ? [validCoverImage] 
      : []

  const galleryImages = processedImageUrls.slice(0, 12)

  console.log("[RestaurantPage] Final hero images:", heroImages)
  console.log("[RestaurantPage] Final gallery images:", galleryImages)
  console.log("[RestaurantPage] ===================================")

  const hasGoogleReviews = google_user_reviews && google_user_reviews.length > 0
  const hasCriticOrWebReviews =
    (critic_reviews && critic_reviews.length > 0) || (filteredCseSnippets && filteredCseSnippets.length > 0)
  const hasAnyReviews = hasGoogleReviews || hasCriticOrWebReviews

  console.log("[RestaurantPage] Review status:", {
    hasGoogleReviews,
    hasCriticOrWebReviews,
    hasAnyReviews,
    criticCount: critic_reviews?.length || 0,
    cseCount: filteredCseSnippets?.length || 0,
    googleCount: google_user_reviews?.length || 0,
  })

  const reservationLink =
    reserve_table_url_gmaps ||
    (Array.isArray(booking_links_gmaps) && booking_links_gmaps.length > 0 && typeof booking_links_gmaps[0] === "object"
      ? (booking_links_gmaps[0] as { url?: string })?.url
      : typeof booking_links_gmaps === "string"
        ? booking_links_gmaps
        : null)

  return (
    <main className="min-h-screen bg-[#f9f5f0] dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {isStickyHeaderVisible && (
        <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md p-3 flex justify-between items-center z-40">
          <h2 className="text-lg font-semibold truncate">{name}</h2>
          <div className="flex items-center space-x-2">
            {total_score_gmaps && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{total_score_gmaps.toFixed(1)}</span>
              </Badge>
            )}
            {reservationLink && (
              <Button size="sm" asChild>
                <a href={reservationLink} target="_blank" rel="noopener noreferrer">
                  Reserve Table
                </a>
              </Button>
            )}
            {maps_search_url_gmaps && (
              <Button size="sm" variant="outline" asChild>
                <a href={maps_search_url_gmaps} target="_blank" rel="noopener noreferrer">
                  Directions
                </a>
              </Button>
            )}
          </div>
        </div>
      )}

      <div ref={heroRef} className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden group">
        <HeroCollage
          images={heroImages}
          altText={`Collage for ${name}`}
          useLowBandwidth={useLowBandwidth}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white shadow-xl font-playfair">{name}</h1>
          {sub_title && <p className="text-lg text-gray-200 mt-2 shadow-md">{sub_title}</p>}
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 mt-6 mb-2">
        <Link
          href="/directory"
          className="inline-flex items-center text-primary dark:text-primary-light hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to directory
        </Link>
      </div>

      <div className="py-4 bg-gray-50 dark:bg-gray-800 sticky top-0 z-30 shadow-sm mb-2">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
            {total_score_gmaps && reviews_count_gmaps && (
              <React.Fragment key="quick-pulse-score">
                <QuickPulseChip
                  icon={<Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                  label={`${total_score_gmaps.toFixed(1)} (${reviews_count_gmaps.toLocaleString()})`}
                  onClick={() => scrollToRef(reviewsRef, "reviews")}
                />
              </React.Fragment>
            )}
            {vibes_gmaps &&
              vibes_gmaps.length > 0 &&
              vibes_gmaps.map((vibe, index) => (
                <QuickPulseChip
                  key={`vibe-${vibe}-${index}`}
                  icon={<Sparkles className="w-4 h-4" />}
                  label={vibe}
                  onClick={() => scrollToRef(aboutRef, "about")}
                />
              ))}
            {price_range_gmaps && (
              <React.Fragment key="quick-pulse-price">
                <QuickPulseChip
                  icon={<Tag className="w-4 h-4" />}
                  label={price_range_gmaps}
                  onClick={() => scrollToRef(aboutRef, "about")}
                />
              </React.Fragment>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="lg:flex lg:space-x-8">
          <div className="lg:w-2/3">
            <Accordion
              type="single"
              collapsible
              value={activeAccordionItem}
              onValueChange={handleAccordionChange}
              className="w-full space-y-4"
            >
              <AccordionItem
                value="about"
                ref={aboutRef}
                className="border dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800"
              >
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline">
                  <div className="flex items-center">
                    <Info className="w-5 h-5 mr-3 text-primary dark:text-primary-light" />
                    About
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                  <p className="text-base leading-relaxed">{criticSummary || "No description available."}</p>
                  {vibes_gmaps && vibes_gmaps.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Vibes</h4>
                      <div className="flex flex-wrap gap-2">
                        {vibes_gmaps.map((vibe) => (
                          <Badge key={vibe} variant="secondary">
                            {vibe}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {similarPlacesByVibe && similarPlacesByVibe.length > 0 && (
                    <div className="pt-4 mt-4 border-t dark:border-gray-700">
                      <h4 className="font-semibold mb-3 text-lg">You Might Also Like (Similar Vibes)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {similarPlacesByVibe.map((place) => (
                          <Link key={place.id} href={`/restaurant/${place.id}`} passHref>
                            <Card className="h-full hover:shadow-lg transition-shadow">
                              <CardContent className="p-0">
                                <div className="relative aspect-video">
                                  <Image
                                    src={place.cover_image_url || "/placeholder.svg"}
                                    alt={place.name || "Similar Restaurant"}
                                    fill
                                    className="object-cover rounded-t-md"
                                  />
                                </div>
                                <div className="p-3">
                                  <h5 className="font-semibold text-base text-gray-900 truncate">{place.name}</h5>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {similarPlacesByVibe.length === 0 &&
                    people_also_search_gmaps &&
                    people_also_search_gmaps.length > 0 && (
                      <div className="pt-4 mt-4 border-t dark:border-gray-700">
                        <h4 className="font-semibold mb-3 text-lg">You Might Also Like</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {people_also_search_gmaps.slice(0, 3).map((place) => (
                            <Link key={place.id} href={`/restaurant/${place.id}`} passHref>
                              <Card className="h-full hover:shadow-lg transition-shadow">
                                <CardContent className="p-0">
                                  <div className="relative aspect-video">
                                    <Image
                                      src={place.cover_image_url || "/placeholder.svg"}\
                                      alt={place.name || "
