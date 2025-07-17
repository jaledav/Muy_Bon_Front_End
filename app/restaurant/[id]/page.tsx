"use client"

import type React from "react"
// ListOrdered is no longer used in QuickPulseStrip, remove if not used elsewhere.
// import { ListOrdered } from 'lucide-react';

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Image from "next/image"
<<<<<<< Updated upstream
import {
  Star,
  ArrowLeft,
  Phone,
  Globe,
  ExternalLink,
  Clock,
  ImageIcon,
  Info,
  MessageSquare,
  Heart,
  Sparkles,
  Tag,
  BookMarked,
  Navigation,
  ListOrdered,
} from "lucide-react"
import {
  fetchRestaurantById,
  type RestaurantWithReviews,
  type CriticReview,
  type CSEReviewSnippet,
} from "@/lib/supabase-client"
=======
import { Star, ArrowLeft, Info, Sparkles, Tag, Camera, MapPin, MessageSquare, Clock } from "lucide-react"
import { fetchRestaurantById, testCSESnippets, testImageUrls, type RestaurantWithReviews } from "@/lib/supabase-client"
>>>>>>> Stashed changes
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
<<<<<<< Updated upstream
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import PopularTimesChart from "@/components/popular-times-chart"
import { cn, getBestRestaurantImage, getRandomPlaceholder } from "@/lib/utils"
=======
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase-client"
import PopularTimesChart from "@/components/popular-times-chart"
>>>>>>> Stashed changes

interface SimilarPlace {
  id: string
  name: string
  cover_image_url?: string | null
  vibes_gmaps?: string[] | null
}

interface RestaurantWithDetails extends Omit<RestaurantWithReviews, 'people_also_search_gmaps'> {
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

<<<<<<< Updated upstream
const HeroCollage: React.FC<{ images: string[]; altText: string; useLowBandwidth: boolean }> = ({
=======
// Helper function to validate and clean image URLs
const validateImageUrl = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== "string") return null
  const cleanUrl = url.trim()
  // TEMP: Allow all http(s) URLs for debugging
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) return null
  return cleanUrl
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

  // Log all raw URLs before validation
  console.log("[processImageUrls] Raw URLs:", urls)

  // Filter and validate URLs
  const validUrls = urls.map((url) => validateImageUrl(url)).filter((url): url is string => url !== null)

  // Log all valid URLs after validation
  console.log("[processImageUrls] Valid URLs:", validUrls)
  return validUrls
}

const HeroCollage: React.FC<{ images: string[]; altText: string; useLowBandwidth: boolean; restaurantId?: string }> = ({
>>>>>>> Stashed changes
  images,
  altText,
  useLowBandwidth,
  restaurantId,
}) => {
  const validImages = images.filter(Boolean)
  const placeholder = getRandomPlaceholder()
  const lowBandwidthPlaceholder = getRandomPlaceholder()

<<<<<<< Updated upstream
  const getSrc = (url?: string) => (useLowBandwidth ? lowBandwidthPlaceholder : url || placeholder)
=======
  console.log("[HeroCollage] Received images:", images)
  console.log("[HeroCollage] Valid images:", validImages)
  console.log("[HeroCollage] Failed images:", Array.from(failedImages))
  console.log("[HeroCollage] Loaded images:", Array.from(loadedImages))

  const handleImageError = (imageUrl: string, imageIndex: number) => {
    console.warn(`[HeroCollage] Image failed to load (restaurantId=${restaurantId}, idx=${imageIndex + 1}): ${imageUrl}`)
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
>>>>>>> Stashed changes

  if (useLowBandwidth || validImages.length === 0) {
    return (
      <ImageWithFallback
        src={getSrc()}
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
      <ImageWithFallback
        src={getSrc(validImages[0])}
        alt={`${altText} 1`}
        fill
        className="object-cover dark:opacity-80"
        priority
        sizes="50vw"
      />
    )
  }

  if (validImages.length === 2) {
    return (
      <div className="grid grid-cols-2 h-full">
        <div className="relative h-full">
          <ImageWithFallback
            src={getSrc(validImages[0])}
            alt={`${altText} 1`}
            fill
            className="object-cover dark:opacity-80"
            sizes="50vw"
            priority
          />
        </div>
        <div className="relative h-full">
          <ImageWithFallback
            src={getSrc(validImages[1])}
            alt={`${altText} 2`}
            fill
            className="object-cover dark:opacity-80"
            sizes="50vw"
            priority
          />
        </div>
      </div>
    )
  }

  if (validImages.length === 3) {
    return (
      <div className="grid grid-cols-3 h-full">
        <div className="relative col-span-2 h-full">
          <ImageWithFallback
            src={getSrc(validImages[0])}
            alt={`${altText} 1`}
            fill
            className="object-cover dark:opacity-80"
            sizes="66vw"
            priority
          />
        </div>
        <div className="grid grid-rows-2 col-span-1 h-full">
          <div className="relative h-full">
            <ImageWithFallback
              src={getSrc(validImages[1])}
              alt={`${altText} 2`}
              fill
              className="object-cover dark:opacity-80"
              sizes="33vw"
              priority
            />
          </div>
          <div className="relative h-full">
            <ImageWithFallback
              src={getSrc(validImages[2])}
              alt={`${altText} 3`}
              fill
              className="object-cover dark:opacity-80"
              sizes="33vw"
              priority
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 grid-rows-2 h-full">
      {validImages.slice(0, 4).map((img, idx) => (
        <div key={`hero-${idx}`} className="relative h-full">
          <ImageWithFallback
            src={getSrc(img)}
            alt={`${altText} ${idx + 1}`}
            fill
            className="object-cover dark:opacity-80"
            sizes="50vw"
            priority={idx < 2}
          />
        </div>
      ))}
    </div>
  )
}

export default function RestaurantPage() {
  const params = useParams<{ id: string }>()
  const id = params ? decodeURIComponent(params.id) : ""

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
  // const locationRef = useRef<HTMLDivElement>(null); // Location ref removed

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
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const data = (await fetchRestaurantById(id)) as RestaurantWithDetails
        setRestaurant(data)

        if (data && data.id) {
          const similar = findSimilarByVibe(data.vibes_gmaps, data.people_also_search_gmaps, data.id)
          setSimilarPlacesByVibe(similar)
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

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

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
    // neighborhood_gmaps, // No longer used in QuickPulseStrip
    // city_gmaps, // No longer used in QuickPulseStrip
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
    // reviews_tags_gmaps, // No longer used in QuickPulseStrip
    sub_title,
    booking_links_gmaps,
    permanently_closed_gmaps,
    temporarily_closed_gmaps,
    people_also_search_gmaps,
    address_gmaps,
    category_name_gmaps,
    claim_this_business_gmaps,
    is_advertisement_gmaps,
  } = restaurant

  const criticSummary = critic_reviews?.find((r) => r.summary_critic)?.summary_critic || description_gmaps

  const uniqueCriticPublications = new Set(critic_reviews?.map((r) => r.publication_critic?.toLowerCase()))
  const filteredCseSnippets = cse_review_snippets?.filter((s) => {
    const pubName = (s.publication_cse || s.domain_cse)?.toLowerCase()
    return pubName ? !uniqueCriticPublications.has(pubName) : true
  })

<<<<<<< Updated upstream
  const heroImages =
    image_urls_gmaps && image_urls_gmaps.length > 0
      ? image_urls_gmaps
      : cover_image_url_gmaps
        ? [cover_image_url_gmaps]
        : [getBestRestaurantImage(restaurant)]
=======
  const uniqueCriticPublications = new Set(
    critic_reviews?.map((r: { publication_critic: string | null }) => r.publication_critic?.toLowerCase()),
  )

  console.log("[RestaurantPage] Unique critic publications:", Array.from(uniqueCriticPublications))

  const filteredCseSnippets = cse_review_snippets?.filter(
    (s: import("@/lib/supabase-client").CSEReviewSnippet) => {
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
  
  // Only use Supabase-hosted images for hero and gallery
  const processedImageUrls = processImageUrls(image_urls_gmaps)
  const supabaseImages = processedImageUrls.filter(url => url.includes('.supabase.co/storage/v1/object/public/'))

  // If no Supabase images, fallback to placeholder (do not use Google images)
  const heroImages = supabaseImages.length > 0 ? supabaseImages : []
  const galleryImages = supabaseImages.slice(0, 12)

  console.log("[RestaurantPage] Processed image URLs:", processedImageUrls)
  console.log("[RestaurantPage] Final hero images:", heroImages)
  console.log("[RestaurantPage] Final gallery images:", galleryImages)
  console.log("[RestaurantPage] ===================================")
>>>>>>> Stashed changes

  const galleryImages = image_urls_gmaps?.slice(0, 12) || []
  const hasGoogleReviews = google_user_reviews && google_user_reviews.length > 0
  const hasCriticOrWebReviews =
    (critic_reviews && critic_reviews.length > 0) || (filteredCseSnippets && filteredCseSnippets.length > 0)
  const hasAnyReviews = hasGoogleReviews || hasCriticOrWebReviews

  const reservationLink =
    reserve_table_url_gmaps ||
    (Array.isArray(booking_links_gmaps) && booking_links_gmaps.length > 0
      ? (typeof booking_links_gmaps[0] === "object" && booking_links_gmaps[0] !== null && "url" in booking_links_gmaps[0]
          ? (booking_links_gmaps[0] as { url: string }).url
          : null)
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
          images={heroImages as string[]}
          altText={`Collage for ${name}`}
          useLowBandwidth={useLowBandwidth}
          restaurantId={restaurant?.id}
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
<<<<<<< Updated upstream
              <QuickPulseChip
                key={`pulse-rating-${id || 'loading'}`}
                icon={<Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                label={`${total_score_gmaps.toFixed(1)} (${reviews_count_gmaps.toLocaleString()})`}
                onClick={() => scrollToRef(reviewsRef, "reviews")}
              />
=======
              <React.Fragment key="quick-pulse-score">
                <Badge variant="secondary" className="flex items-center space-x-1 cursor-pointer" onClick={() => scrollToRef(reviewsRef, "reviews")}> 
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{total_score_gmaps.toFixed(1)} ({reviews_count_gmaps.toLocaleString()})</span>
                </Badge>
              </React.Fragment>
>>>>>>> Stashed changes
            )}
            {/* Location Chip REMOVED */}
            {vibes_gmaps &&
              vibes_gmaps.length > 0 &&
<<<<<<< Updated upstream
              vibes_gmaps.map((vibe, index) => (
                <QuickPulseChip
                  key={`vibe-${index}-${id || 'loading'}`}
                  icon={<Sparkles className="w-4 h-4" />}
                  label={vibe}
=======
              vibes_gmaps.map((vibe, idx) => (
                <Badge
                  key={vibe + '-' + idx}
                  variant="secondary"
                  className="flex items-center space-x-1 cursor-pointer"
>>>>>>> Stashed changes
                  onClick={() => scrollToRef(aboutRef, "about")}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{vibe}</span>
                </Badge>
              ))}
            {price_range_gmaps && (
<<<<<<< Updated upstream
              <QuickPulseChip
                key={`pulse-price-${id || 'loading'}`}
                icon={<Tag className="w-4 h-4" />}
                label={price_range_gmaps}
                onClick={() => scrollToRef(aboutRef, "about")}
              />
=======
              <React.Fragment key="quick-pulse-price">
                <Badge variant="secondary" className="flex items-center space-x-1 cursor-pointer" onClick={() => scrollToRef(aboutRef, "about")}> 
                  <Tag className="w-4 h-4" />
                  <span>{price_range_gmaps}</span>
                </Badge>
              </React.Fragment>
>>>>>>> Stashed changes
            )}
          </div>
        </div>
      </div>

<<<<<<< Updated upstream
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
                key="about"
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
                        {vibes_gmaps.map((vibe, index) => (
                          <Badge key={`vibe-badge-${index}-${vibe}`} variant="secondary">
                            {vibe}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                key="openingTimes"
                value="openingTimes"
                ref={openingTimesRef}
                className="border dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800"
              >
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-primary dark:text-primary-light" />
                    Opening Times
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
                  {(() => {
                    if (Array.isArray(opening_hours_gmaps)) {
                      return (
                        <ul className="space-y-1">
                          {opening_hours_gmaps
                            .filter((entry: any) => typeof entry === "object" && entry !== null && "day" in entry && "hours" in entry)
                            .map((entry: any, index: number) => (
                              <li key={`opening-${entry.day}-${index}`} className="flex justify-between">
                                <span className="capitalize font-medium">{entry.day}:</span>
                                <span>{String(entry.hours)}</span>
                              </li>
                            ))}
                        </ul>
                      )
                    } else if (
                      typeof opening_hours_gmaps === "object" &&
                      opening_hours_gmaps !== null &&
                      Object.keys(opening_hours_gmaps).length > 0
                    ) {
                      return (
                        <ul className="space-y-1">
                          {Object.entries(opening_hours_gmaps as Record<string, any>).map(([day, hours]) => (
                            <li key={day} className="flex justify-between">
                              <span className="capitalize font-medium">{day}:</span>
                              <span>{String(hours)}</span>
                            </li>
                          ))}
                        </ul>
                      )
                    } else {
                      return <p>Opening hours not available.</p>
                    }
                  })()}
                  {popular_times_live_text_gmaps && (
                    <div className="flex items-center space-x-2 pt-2">
                      {popular_times_live_percent_gmaps && (
                        <div className="relative w-5 h-5">
                          <div
                            className="absolute inset-0 bg-green-500 rounded-full animate-ping-slow opacity-50"
                            style={{ transform: `scale(${(popular_times_live_percent_gmaps / 100) * 1.5})` }}
                          ></div>
                          <div className="relative w-full h-full bg-green-600 rounded-full"></div>
                        </div>
                      )}
                      <span>
                        {popular_times_live_text_gmaps}{" "}
                        {popular_times_live_percent_gmaps ? `(${popular_times_live_percent_gmaps}% full)` : ""}
                      </span>
                    </div>
                  )}
                  {popular_times_histogram_gmaps && typeof popular_times_histogram_gmaps === 'object' && <PopularTimesChart popularTimes={popular_times_histogram_gmaps as Record<string, any>} />}
                </AccordionContent>
              </AccordionItem>

              {galleryImages.length > 0 && !useLowBandwidth && (
                <AccordionItem
                  key="gallery"
                  value="gallery"
                  ref={galleryRef}
                  className="border dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800"
                >
                  <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline">
                    <div className="flex items-center">
                      <ImageIcon className="w-5 h-5 mr-3 text-primary dark:text-primary-light" />
                      Gallery
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {galleryImages.map((imgUrl, idx) => (
                        <div key={`gallery-${idx}-${imgUrl}`} className="relative aspect-square rounded-md overflow-hidden">
                          <ImageWithFallback
                            src={imgUrl || getRandomPlaceholder()}
                            alt={`${name} gallery image ${idx + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                          />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {hasAnyReviews && (
                <AccordionItem
                  key="reviews"
                  value="reviews"
                  ref={reviewsRef}
                  className="border dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800"
                >
                  <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline">
                    <div className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-3 text-primary dark:text-primary-light" />
                      Reviews
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2">
                    <Tabs defaultValue={hasCriticOrWebReviews ? "critics" : "google"} className="w-full">
                      <TabsList
                        className={cn(
                          "grid w-full mb-4",
                          hasGoogleReviews && hasCriticOrWebReviews ? "grid-cols-2" : "grid-cols-1",
                        )}
                      >
                        {hasCriticOrWebReviews && <TabsTrigger value="critics">Critics</TabsTrigger>}
                        {hasGoogleReviews && <TabsTrigger value="google">Google</TabsTrigger>}
                      </TabsList>

                      {hasCriticOrWebReviews && (
                        <TabsContent value="critics" className="space-y-4">
                          <h3 className="text-xl font-semibold mt-2">Critic Reviews</h3>
                          {critic_reviews &&
                            critic_reviews.map((review, idx) => (
                              <ReviewCard key={`critic-${review.id || idx}`} review={review} type="critic" />
                            ))}
                          {filteredCseSnippets &&
                            filteredCseSnippets.map((snippet, idx) => (
                              <ReviewCard key={`cse-${snippet.id || idx}`} review={snippet} type="cse" />
                            ))}
                        </TabsContent>
                      )}

                      {hasGoogleReviews && (
                        <TabsContent value="google" className="space-y-4">
                          <h3 className="text-xl font-semibold">Google Reviews Summary</h3>
                          {total_score_gmaps && reviews_count_gmaps && reviews_distribution_gmaps && (
                            <Card className="bg-blue-50 dark:bg-blue-900/30 p-4">
                              <div className="flex items-center mb-3">
                                <Star className="w-8 h-8 mr-2 text-yellow-400 fill-yellow-400" />
                                <div>
                                  <p className="text-3xl font-bold">{total_score_gmaps.toFixed(1)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Based on {reviews_count_gmaps.toLocaleString()} reviews
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {Object.entries(reviews_distribution_gmaps as Record<string, number>)
                                  .sort((a, b) => Number.parseInt(b[0]) - Number.parseInt(a[0]))
                                  .map(([rating, count], index) => {
                                    const percentage = reviews_count_gmaps ? (count / reviews_count_gmaps) * 100 : 0
                                    return (
                                      <div key={`rating-${rating}-${index}`} className="flex items-center text-sm">
                                        <span className="w-16">{rating} star</span>
                                        <div className="flex-1 h-2 mx-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                          <div
                                            className="h-2 bg-yellow-400 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                          ></div>
                                        </div>
                                        <span className="w-10 text-right">{count}</span>
                                      </div>
                                    )
                                  })}
                              </div>
                            </Card>
                          )}
                        </TabsContent>
                      )}
                    </Tabs>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Location Accordion Item REMOVED */}
            </Accordion>
          </div>

          <aside className="lg:w-1/3 space-y-6 mt-8 lg:mt-0">
            <Card className="shadow-sm bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reservationLink && (
                  <Button asChild className="w-full">
                    <a href={reservationLink} target="_blank" rel="noopener noreferrer">
                      <BookMarked className="w-4 h-4 mr-2" />
                      Reserve Table
                    </a>
                  </Button>
                )}
                {menu_url_gmaps && (
                  <Button variant="outline" asChild className="w-full">
                    <a href={menu_url_gmaps} target="_blank" rel="noopener noreferrer">
                      <ListOrdered className="w-4 h-4 mr-2" />
                      View Menu
                    </a>
                  </Button>
                )}
                {maps_search_url_gmaps && (
                  <Button variant="outline" asChild className="w-full">
                    <a href={maps_search_url_gmaps} target="_blank" rel="noopener noreferrer">
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </a>
                  </Button>
                )}
                {phone_gmaps && (
                  <Button variant="outline" asChild className="w-full">
                    <a href={`tel:${phone_gmaps}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call {phone_gmaps}
                    </a>
                  </Button>
                )}
                {website_gmaps && (
                  <Button variant="outline" asChild className="w-full">
                    <a href={website_gmaps} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
                <Button
                  variant={isFavorited ? "default" : "outline"}
                  className="w-full flex items-center"
                  onClick={toggleFavorite}
                >
                  <Heart className={cn("w-4 h-4 mr-2", isFavorited ? "fill-red-500 text-red-500" : "")} />
                  {isFavorited ? "Favorited" : "Add to Shortlist"}
                </Button>
              </CardContent>
            </Card>

            {(permanently_closed_gmaps || temporarily_closed_gmaps || popular_times_live_text_gmaps) && (
              <Card className="shadow-sm bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {permanently_closed_gmaps && (
                    <Badge variant="destructive" className="w-full justify-center py-2 text-sm">
                      Permanently Closed
                    </Badge>
                  )}
                  {temporarily_closed_gmaps && !permanently_closed_gmaps && (
                    <Badge variant="destructive" className="w-full justify-center py-2 text-sm">
                      Temporarily Closed
                    </Badge>
                  )}
                  {!permanently_closed_gmaps && !temporarily_closed_gmaps && (
                    <Badge
                      variant="default"
                      className="w-full justify-center py-2 text-sm bg-green-600 hover:bg-green-700"
                    >
                      Open
                    </Badge>
                  )}
                  {popular_times_live_text_gmaps && (
                    <p className="text-sm text-muted-foreground text-center mt-2">{popular_times_live_text_gmaps}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>
      <style jsx global>{`
      .animate-ping-slow {
        animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      }
      @keyframes ping-slow {
        75%, 100% { transform: scale(2); opacity: 0; }
      }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
    </main>
  )
}

interface QuickPulseChipProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
}
const QuickPulseChip: React.FC<QuickPulseChipProps> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex-shrink-0 flex items-center space-x-1.5 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border border-gray-200 dark:border-gray-600 transition-colors"
  >
    {icon}
    <span>{label}</span>
  </button>
)

interface ReviewCardProps {
  review: CriticReview | CSEReviewSnippet
  type: "critic" | "cse"
}
const ReviewCard: React.FC<ReviewCardProps> = ({ review, type }) => {
  const publication =
    type === "critic"
      ? (review as CriticReview).publication_critic
      : (review as CSEReviewSnippet).publication_cse || (review as CSEReviewSnippet).domain_cse
  const snippet =
    type === "critic"
      ? (review as CriticReview).review_snippet_critic
      : (review as CSEReviewSnippet).og_description_cse || (review as CSEReviewSnippet).snippet_text_cse
  const url = type === "critic" ? (review as CriticReview).review_url_critic : (review as CSEReviewSnippet).url

  return (
    <Card className="overflow-hidden bg-gray-50 dark:bg-gray-700/50">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold">
            {publication || (type === "critic" ? "Critic Review" : "Web Mention")}
          </CardTitle>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary dark:text-primary-light hover:underline flex items-center"
            >
              Read more <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {snippet && <p className="text-sm leading-relaxed line-clamp-4">"{snippet}"</p>}
      </CardContent>
    </Card>
  )
}

const RestaurantPageSkeleton: React.FC = () => (
  <main className="min-h-screen bg-[#f9f5f0] dark:bg-gray-900 p-4 md:p-8">
    <div className="container mx-auto max-w-5xl animate-pulse">
      <Skeleton className="w-full h-[60vh] md:h-[70vh] rounded-lg mb-6" />
      <Skeleton className="w-1/3 h-8 mb-2" />
      <Skeleton className="w-1/2 h-6 mb-6" />
      <div className="flex space-x-3 mb-8">
        {[...Array(3)].map(
          // Adjusted skeleton count for quick pulse
          (_, i) => (
            <Skeleton key={`pulse-${i}`} className="w-24 h-8 rounded-full" />
          ),
        )}
      </div>
      <div className="lg:flex lg:space-x-8">
        <div className="lg:w-2/3 space-y-4">
          {[...Array(2)].map(
            // Adjusted skeleton count for accordion items
            (_, i) => (
              <Skeleton key={`accordion-${i}`} className="w-full h-32 rounded-lg" />
            ),
          )}
        </div>
        <aside className="lg:w-1/3 space-y-6 mt-8 lg:mt-0">
          <Skeleton className="w-full h-64 rounded-lg" />
          <Skeleton className="w-full h-24 rounded-lg" />
        </aside>
      </div>
    </div>
  </main>
)

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <main className="min-h-screen bg-[#f9f5f0] dark:bg-gray-900 p-4 md:p-8 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Failed to load restaurant details</h1>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button asChild>
        <Link href="/directory">Return to Directory</Link>
      </Button>
    </div>
  </main>
)

const NotFoundMessage: React.FC = () => (
  <main className="min-h-screen bg-[#f9f5f0] dark:bg-gray-900 p-4 md:p-8 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Restaurant Not Found</h1>
      <p className="text-muted-foreground mb-4">Sorry, we couldn't find the restaurant you're looking for.</p>
      <Button asChild>
        <Link href="/directory">Return to Directory</Link>
      </Button>
    </div>
  </main>
)
=======
      {/* --- BANNERS --- */}
      {(permanently_closed_gmaps || temporarily_closed_gmaps || claim_this_business_gmaps || is_advertisement_gmaps) && (
        <div className="container mx-auto max-w-5xl px-4 mt-4">
          {permanently_closed_gmaps && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-2 font-semibold">Permanently Closed</div>
          )}
          {temporarily_closed_gmaps && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-2 font-semibold">Temporarily Closed</div>
          )}
          {claim_this_business_gmaps && (
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded mb-2 font-semibold">Claim this business</div>
          )}
          {is_advertisement_gmaps && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-2 font-semibold">Advertisement</div>
          )}
        </div>
      )}

      <Tabs defaultValue="about" className="container mx-auto max-w-5xl px-4 py-8">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="about" onClick={() => scrollToRef(aboutRef, "about")}>About</TabsTrigger>
          <TabsTrigger value="gallery" onClick={() => scrollToRef(galleryRef, "gallery")}>Gallery</TabsTrigger>
          <TabsTrigger value="info" onClick={() => scrollToRef(aboutRef, "info")}>Info</TabsTrigger>
          <TabsTrigger value="reviews" onClick={() => scrollToRef(reviewsRef, "reviews")}>Reviews</TabsTrigger>
          <TabsTrigger value="popular-times" onClick={() => scrollToRef(aboutRef, "popular-times")}>Popular Times</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <div className="lg:flex lg:space-x-8">
            <div className="lg:w-full">
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
                          {/* key: vibe + '-' + idx (vibe may not be unique) */}
                          {vibes_gmaps.map((vibe, idx) => (
                            <Badge key={vibe + '-' + idx} variant="secondary">
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
                          {/* key: place.id (should be unique, fallback to idx if missing) */}
                          {similarPlacesByVibe.map((place, idx) => {
                            if (!place.id) {
                              console.warn('[SimilarPlacesByVibe] Missing id for place at idx', idx, place)
                            }
                            return (
                              <Link key={place.id || `similar-vibe-${idx}`} href={`/restaurant/${place.id}`} passHref>
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
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {similarPlacesByVibe.length === 0 &&
                      people_also_search_gmaps &&
                      people_also_search_gmaps.length > 0 && (
                        <div className="pt-4 mt-4 border-t dark:border-gray-700">
                          <h4 className="font-semibold mb-3 text-lg">You Might Also Like</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* key: place.id (should be unique, fallback to idx if missing) */}
                            {people_also_search_gmaps.slice(0, 3).map((place, idx) => {
                              if (!place.id) {
                                console.warn('[PeopleAlsoSearch] Missing id for place at idx', idx, place)
                              }
                              return (
                                <Link key={place.id || `people-also-${idx}`} href={`/restaurant/${place.id}`} passHref>
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
                              )
                            })}
                          </div>
                        </div>
                      )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gallery">
          {galleryImages.length > 0 && (
            <section ref={galleryRef} className="my-8">
              <h3 className="text-lg font-semibold mb-4">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((img, idx) => (
                  <div key={`gallery-${img}-${idx}`} className="relative aspect-square rounded overflow-hidden">
                    <Image
                      src={img}
                      alt={`Gallery image ${idx + 1} for ${name}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          {hasAnyReviews && (
            <section ref={reviewsRef} className="my-8">
              <h3 className="text-lg font-semibold mb-4">Reviews</h3>
              {/* Google Reviews */}
              {hasGoogleReviews && (
                <div className="mb-8">
                  <h4 className="font-semibold mb-2">Google Reviews</h4>
                  <div className="space-y-4">
                    {google_user_reviews.map((review, idx) => (
                      <Card key={`google-review-${review.id || idx}`} className="p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-semibold">{review.reviewer_name_gmaps || "Anonymous"}</span>
                            {review.published_at_text_gmaps && (
                              <span className="ml-2 text-xs text-muted-foreground">{review.published_at_text_gmaps}</span>
                            )}
                          </div>
                          {review.stars_gmaps && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                              <span className="text-sm font-medium">{review.stars_gmaps}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {review.review_text_gmaps || "No review text available."}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {/* Critics Reviews (deduplicated by publication/domain) */}
              {hasCriticOrWebReviews && (
                <div>
                  <h4 className="font-semibold mb-2">Critics Reviews</h4>
                  <div className="space-y-4">
                    {/* Combine and deduplicate critic_reviews and filteredCseSnippets */}
                    {[
                      ...(critic_reviews || []),
                      ...(filteredCseSnippets || [])
                    ].map((review, idx) => {
                      // Use id if present, otherwise idx
                      const key = review.id || `critic-cse-${idx}`
                      // Use ReviewCard for both types, type narrowing with 'in'
                      const isCritic = 'publication_critic' in review
                      return (
                        <ReviewCard
                          key={key}
                          review={review}
                          type={isCritic ? "critic" : "cse"}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </section>
          )}
        </TabsContent>

        <TabsContent value="info">
          <div className="lg:flex lg:space-x-8">
            <div className="lg:w-2/3">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Restaurant Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Contact & Location</h4>
                    <ul className="space-y-2 text-sm">
                      {address_gmaps && <li><strong>Address:</strong> {address_gmaps}</li>}
                      {phone_gmaps && <li><strong>Phone:</strong> <a href={`tel:${phone_gmaps}`} className="text-primary underline">{phone_gmaps}</a></li>}
                      {website_gmaps && <li><strong>Website:</strong> <a href={website_gmaps} target="_blank" rel="noopener noreferrer" className="text-primary underline">{website_gmaps}</a></li>}
                      {menu_url_gmaps && <li><strong>Menu:</strong> <a href={menu_url_gmaps} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Menu</a></li>}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Details</h4>
                    <ul className="space-y-2 text-sm">
                      {price_range_gmaps && <li><strong>Price:</strong> {price_range_gmaps}</li>}
                      {category_name_gmaps && <li><strong>Category:</strong> {category_name_gmaps}</li>}
                      {Array.isArray(vibes_gmaps) && vibes_gmaps.length > 0 && vibes_gmaps.every(tag => typeof tag === 'string') && (
                        <li><strong>Tags:</strong> {vibes_gmaps.join(", ")}</li>
                      )}
                      {booking_links_gmaps && typeof booking_links_gmaps === "string" && <li><strong>Booking:</strong> <a href={booking_links_gmaps} target="_blank" rel="noopener noreferrer" className="text-primary underline">Book Now</a></li>}
                    </ul>
                  </div>
                </div>
                {/* Only render opening hours if it's an array of strings */}
                {Array.isArray(opening_hours_gmaps) && opening_hours_gmaps.every(h => typeof h === 'string') && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Opening Hours</h4>
                    <ul className="space-y-1 text-sm">
                      {opening_hours_gmaps.map((h, idx) => <li key={idx}>{h}</li>)}
                    </ul>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="popular-times">
          {popular_times_histogram_gmaps && typeof popular_times_histogram_gmaps === 'object' && (
            <section className="my-8">
              <h3 className="text-lg font-semibold mb-2">Popular Times</h3>
              <PopularTimesChart popularTimes={popular_times_histogram_gmaps as Record<string, any>} />
            </section>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}
>>>>>>> Stashed changes
