"use client"

import type React from "react"
// ListOrdered is no longer used in QuickPulseStrip, remove if not used elsewhere.
// import { ListOrdered } from 'lucide-react';

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Image from "next/image"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import PopularTimesChart from "@/components/popular-times-chart"
import { cn, getBestRestaurantImage, getRandomPlaceholder } from "@/lib/utils"

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

const HeroCollage: React.FC<{ images: string[]; altText: string; useLowBandwidth: boolean }> = ({
  images,
  altText,
  useLowBandwidth,
}) => {
  const validImages = images.filter(Boolean)
  const placeholder = getRandomPlaceholder()
  const lowBandwidthPlaceholder = getRandomPlaceholder()

  const getSrc = (url?: string) => (useLowBandwidth ? lowBandwidthPlaceholder : url || placeholder)

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
  } = restaurant

  const criticSummary = critic_reviews?.find((r) => r.summary_critic)?.summary_critic || description_gmaps

  const uniqueCriticPublications = new Set(critic_reviews?.map((r) => r.publication_critic?.toLowerCase()))
  const filteredCseSnippets = cse_review_snippets?.filter((s) => {
    const pubName = (s.publication_cse || s.domain_cse)?.toLowerCase()
    return pubName ? !uniqueCriticPublications.has(pubName) : true
  })

  const isRealImage = (url: string | null | undefined): url is string => {
    return !!url && !url.includes("placeholder");
  };

  const allImages = [cover_image_url_gmaps, ...(image_urls_gmaps || [])].filter(isRealImage);

  const heroImages = allImages.length > 0 ? allImages : [getBestRestaurantImage(restaurant)];
  const galleryImages = allImages.slice(0, 12);
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
              <QuickPulseChip
                key={`pulse-rating-${id || 'loading'}`}
                icon={<Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                label={`${total_score_gmaps.toFixed(1)} (${reviews_count_gmaps.toLocaleString()})`}
                onClick={() => scrollToRef(reviewsRef, "reviews")}
              />
            )}
            {/* Location Chip REMOVED */}
            {vibes_gmaps &&
              vibes_gmaps.length > 0 &&
              vibes_gmaps.map((vibe, index) => (
                <QuickPulseChip
                  key={`vibe-${index}-${id || 'loading'}`}
                  icon={<Sparkles className="w-4 h-4" />}
                  label={vibe}
                  onClick={() => scrollToRef(aboutRef, "about")}
                />
              ))}
            {price_range_gmaps && (
              <QuickPulseChip
                key={`pulse-price-${id || 'loading'}`}
                icon={<Tag className="w-4 h-4" />}
                label={price_range_gmaps}
                onClick={() => scrollToRef(aboutRef, "about")}
              />
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
                  {similarPlacesByVibe && similarPlacesByVibe.length > 0 && (
                    <div className="pt-4 mt-4 border-t dark:border-gray-700">
                      <h4 className="font-semibold mb-3 text-lg">You Might Also Like (Similar Vibes)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {similarPlacesByVibe.map((place, idx) => (
                          <Link key={place.id || idx} href={`/restaurant/${place.id}`} passHref>
                            <Card className="h-full hover:shadow-lg transition-shadow">
                              <CardContent className="p-0">
                                <div className="relative aspect-video">
                                  <ImageWithFallback
                                    src={place.cover_image_url || getRandomPlaceholder()}
                                    alt={place.name || "Similar restaurant"}
                                    fill
                                    className="object-cover rounded-t-md"
                                  />
                                </div>
                                <div className="p-3">
                                  <h5 className="font-medium truncate">{place.name}</h5>
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
                          {people_also_search_gmaps.slice(0, 3).map((place, idx) => (
                            <Link key={place.id || idx} href={`/restaurant/${place.id}`} passHref>
                              <Card className="h-full hover:shadow-lg transition-shadow">
                                <CardContent className="p-0">
                                  <div className="relative aspect-video">
                                    <ImageWithFallback
                                      src={
                                        place.cover_image_url ||
                                        getRandomPlaceholder()
                                      }
                                      alt={place.name || "Similar restaurant"}
                                      fill
                                      className="object-cover rounded-t-md"
                                    />
                                  </div>
                                  <div className="p-3">
                                    <h5 className="font-medium truncate">{place.name}</h5>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
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
