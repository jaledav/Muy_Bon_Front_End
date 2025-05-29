"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { MapPin, Star, ArrowLeft, Phone, Globe, ExternalLink, Clock, Utensils } from "lucide-react"
import Image from "next/image"
import {
  fetchRestaurantById,
  type RestaurantWithReviews,
  type CriticReview,
  type CSEReviewSnippet,
} from "@/lib/supabase-client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import PopularTimesChart from "@/components/popular-times-chart"

export default function RestaurantPage() {
  const params = useParams<{ id: string }>()
  const id = params ? decodeURIComponent(params.id) : ""

  const [restaurantData, setRestaurantData] = useState<RestaurantWithReviews | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    async function loadRestaurant() {
      if (!id) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const data = await fetchRestaurantById(id)
        setRestaurantData(data)
        console.log("Loaded restaurant data:", data)
        console.log("Popular times data:", data?.popular_times_histogram_gmaps)
      } catch (err: any) {
        console.error("Error loading restaurant:", err)
        setError(err.message || "Failed to load restaurant details")
      } finally {
        setLoading(false)
      }
    }

    loadRestaurant()
  }, [id])

  const restaurant = restaurantData

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f9f5f0] p-8">
        <div className="container mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-[40vh] bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f9f5f0] p-8">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <Link href="/directory" className="mt-4 inline-block text-primary hover:underline">
              Return to directory
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-[#f9f5f0] p-8">
        <div className="container mx-auto max-w-7xl">
          <p>Restaurant data not available.</p>
          <Link href="/directory" className="mt-4 inline-block text-primary hover:underline">
            Return to directory
          </Link>
        </div>
      </main>
    )
  }

  // Parse opening hours
  const openingHours = (restaurant.opening_hours_gmaps as Record<string, string>) || {}

  // Parse reviews distribution
  const reviewsDistribution = (restaurant.reviews_distribution_gmaps as Record<string, number>) || {}

  // Parse reviews tags
  const reviewsTags = (restaurant.reviews_tags_gmaps as { title: string; count: number }[]) || []

  // Parse Q&A
  const questionsAndAnswers = (restaurant.questions_and_answers_gmaps as { question: string; answer: string }[]) || []

  // Get critic summary for overview description
  const criticSummary = restaurant.critic_reviews?.find((review) => review.summary_critic)?.summary_critic

  // Filter CSE snippets to avoid duplicates with critic reviews
  const criticPublications = new Set(
    restaurant.critic_reviews?.map((review) => review.publication_critic?.toLowerCase()) || [],
  )

  const uniqueCSESnippets = restaurant.cse_review_snippets?.filter((snippet) => {
    const publicationName = (snippet.publication_cse || snippet.domain_cse)?.toLowerCase()
    return !criticPublications.has(publicationName)
  })

  return (
    <main className="min-h-screen bg-[#f9f5f0]">
      {/* Hero Section */}
      <div className="relative h-[50vh] w-full">
        <Image
          src={restaurant.cover_image_url_gmaps || "/placeholder.svg?height=600&width=1200"}
          alt={restaurant.name || "Restaurant Image"}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 text-white max-w-4xl">
          <Link href="/directory" className="flex items-center mb-4 text-white/80 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Link>
          <h1 className="text-5xl font-bold font-playfair mb-4">{restaurant.name}</h1>
          {restaurant.sub_title && <p className="text-xl mb-4 text-white/90">{restaurant.sub_title}</p>}
          <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              <p className="text-lg">{restaurant.neighborhood_gmaps || restaurant.city_gmaps}</p>
            </div>
            {restaurant.total_score_gmaps && (
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                <span className="text-lg font-semibold">{restaurant.total_score_gmaps.toFixed(1)}</span>
                <span className="ml-2 text-white/80">
                  ({restaurant.reviews_count_gmaps?.toLocaleString() || 0} reviews)
                </span>
              </div>
            )}
            {restaurant.price_range_gmaps && (
              <Badge variant="outline" className="bg-white/20 text-white border-white/50 text-lg px-3 py-1">
                {restaurant.price_range_gmaps}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container px-4 py-12 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6 w-full">
                <TabsTrigger value="overview" className="flex-1">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="details" className="flex-1">
                  Details
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">
                  Reviews
                </TabsTrigger>
                {questionsAndAnswers.length > 0 && (
                  <TabsTrigger value="faqs" className="flex-1">
                    FAQs
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* About Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-playfair">About {restaurant.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Primary Description from critic summary */}
                    {criticSummary ? (
                      <p className="text-lg leading-relaxed">{criticSummary}</p>
                    ) : restaurant.description_gmaps ? (
                      <p className="text-lg leading-relaxed">{restaurant.description_gmaps}</p>
                    ) : (
                      <p className="text-lg leading-relaxed text-muted-foreground">
                        No description available for this restaurant.
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Utensils className="w-4 h-4 mr-2" />
                          Cuisine & Category
                        </h4>
                        <p className="text-muted-foreground">{restaurant.category_name_gmaps || "Restaurant"}</p>
                        {restaurant.categories_gmaps && restaurant.categories_gmaps.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {restaurant.categories_gmaps.slice(0, 3).map((category) => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Price Range</h4>
                        <p className="text-muted-foreground">{restaurant.price_range_gmaps || "Not specified"}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Location</h4>
                        <p className="text-muted-foreground">
                          {restaurant.neighborhood_gmaps || restaurant.city_gmaps || "London"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vibe Section */}
                {restaurant.vibes_gmaps && restaurant.vibes_gmaps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-playfair">Vibe</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {restaurant.vibes_gmaps.map((vibe: string) => (
                          <Badge key={vibe} variant="secondary" className="text-sm px-3 py-1">
                            {vibe}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Popular Times - Only on Overview */}
                {restaurant.popular_times_histogram_gmaps && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-playfair">Popular Times</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        See when this restaurant is typically busiest throughout the week.
                      </p>
                      <PopularTimesChart
                        popularTimes={restaurant.popular_times_histogram_gmaps as Record<string, any>}
                      />
                      {restaurant.popular_times_live_text_gmaps && (
                        <p className="text-sm text-muted-foreground mt-4">
                          Currently: {restaurant.popular_times_live_text_gmaps}
                          {restaurant.popular_times_live_percent_gmaps &&
                            ` (${restaurant.popular_times_live_percent_gmaps}% busy)`}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* People Also Search */}
                {restaurant.people_also_search_gmaps && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-playfair">People Also Search For</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {(restaurant.people_also_search_gmaps as any[]).map((place, index) => (
                          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                            <h4 className="font-semibold mb-1">{place.title}</h4>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-400" />
                              <span className="text-sm">{place.totalScore?.toFixed(1) || "N/A"}</span>
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({place.reviewsCount?.toLocaleString() || 0} reviews)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-playfair">Restaurant Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Contact & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Address
                        </h4>
                        <p className="text-muted-foreground mb-2">
                          {restaurant.address_gmaps ||
                            `${restaurant.street_gmaps}, ${restaurant.city_gmaps}, ${restaurant.postal_code_gmaps}`}
                        </p>
                        {restaurant.plus_code_gmaps && (
                          <p className="text-xs text-muted-foreground">Plus Code: {restaurant.plus_code_gmaps}</p>
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          Contact
                        </h4>
                        {restaurant.phone_gmaps && (
                          <p className="mb-2">
                            <a href={`tel:${restaurant.phone_gmaps}`} className="text-primary hover:underline">
                              {restaurant.phone_gmaps}
                            </a>
                          </p>
                        )}
                        {restaurant.website_gmaps && (
                          <p>
                            <a
                              href={restaurant.website_gmaps}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center"
                            >
                              Visit Website <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Opening Hours - Improved Design */}
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Opening Hours
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 gap-3">
                          {(() => {
                            if (Array.isArray(restaurant.opening_hours_gmaps)) {
                              return restaurant.opening_hours_gmaps
                                .map((entry: any, index: number) => {
                                  if (
                                    typeof entry === "object" &&
                                    entry !== null &&
                                    "day" in entry &&
                                    "hours" in entry
                                  ) {
                                    return (
                                      <div
                                        key={index}
                                        className="flex justify-between items-center py-2 px-3 bg-white rounded border"
                                      >
                                        <span className="font-medium text-gray-700 capitalize">{entry.day}</span>
                                        <span className="text-gray-600 font-mono text-sm">{entry.hours}</span>
                                      </div>
                                    )
                                  }
                                  return null
                                })
                                .filter(Boolean)
                            } else if (
                              typeof restaurant.opening_hours_gmaps === "object" &&
                              restaurant.opening_hours_gmaps !== null
                            ) {
                              return Object.entries(restaurant.opening_hours_gmaps as Record<string, string>).map(
                                ([day, hours]) => (
                                  <div
                                    key={day}
                                    className="flex justify-between items-center py-2 px-3 bg-white rounded border"
                                  >
                                    <span className="font-medium text-gray-700 capitalize">{day}</span>
                                    <span className="text-gray-600 font-mono text-sm">{String(hours)}</span>
                                  </div>
                                ),
                              )
                            } else {
                              return <p className="text-muted-foreground">Opening hours not available.</p>
                            }
                          })()}
                        </div>
                      </div>
                      {restaurant.opening_hours_confirmation_text_gmaps && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {restaurant.opening_hours_confirmation_text_gmaps}
                        </p>
                      )}
                    </div>

                    {/* Popular Mentions */}
                    {reviewsTags.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-4">Popular Mentions</h4>
                          <div className="flex flex-wrap gap-2">
                            {reviewsTags.map((tag, index) => (
                              <Badge key={index} variant="secondary">
                                {tag.title} ({tag.count})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Additional Details */}
                    {restaurant.located_in_gmaps && (
                      <>
                        <Separator />
                        <div>
                          <h5 className="font-medium mb-1">Located In</h5>
                          <p className="text-sm text-muted-foreground">{restaurant.located_in_gmaps}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {/* Critic Reviews - ALL REVIEWS */}
                {restaurant.critic_reviews && restaurant.critic_reviews.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-4 text-lg text-black">Critic Reviews</h4>

                    {/* Additional Details from first critic review - moved outside and above first review box */}
                    {restaurant.critic_reviews[0]?.other_details_critic && (
                      <div className="mb-6 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                        <p className="text-sm text-amber-800">{restaurant.critic_reviews[0].other_details_critic}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {restaurant.critic_reviews.map((review: CriticReview) => (
                        <div key={review.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-medium">{review.publication_critic}</h5>
                            {review.review_url_critic && (
                              <a
                                href={review.review_url_critic}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center"
                              >
                                Read more <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            )}
                          </div>

                          {/* Review Snippet Only */}
                          {review.review_snippet_critic && (
                            <p className="text-sm mb-3 leading-relaxed">"{review.review_snippet_critic}"</p>
                          )}

                          {/* Popular Menu Items */}
                          {review.popular_menu_items_critic && review.popular_menu_items_critic.length > 0 && (
                            <div className="mb-3">
                              <h6 className="font-medium mb-2 text-xs">Recommended Dishes</h6>
                              <div className="flex flex-wrap gap-1">
                                {review.popular_menu_items_critic.map((item, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            {review.review_date_critic
                              ? new Date(review.review_date_critic).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "Date unknown"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CSE Review Snippets (No Duplicates) - No heading */}
                {uniqueCSESnippets && uniqueCSESnippets.length > 0 && (
                  <div className="space-y-4">
                    {uniqueCSESnippets.map((snippet: CSEReviewSnippet) => (
                      <div key={snippet.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium">{snippet.publication_cse || snippet.domain_cse}</h5>
                          {snippet.url && (
                            <a
                              href={snippet.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center"
                            >
                              Read more <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          )}
                        </div>

                        {snippet.og_description_cse && (
                          <p className="text-sm mb-3 leading-relaxed">{snippet.og_description_cse}</p>
                        )}

                        <div className="text-xs text-muted-foreground">
                          {snippet.article_published_date_cse
                            ? new Date(snippet.article_published_date_cse).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Date unknown"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Google Reviews Summary - Moved to Bottom */}
                {restaurant.total_score_gmaps && (
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-400" />
                      Google Reviews Summary
                    </h4>
                    <div className="flex items-center mb-4">
                      <span className="text-3xl font-bold mr-2">{restaurant.total_score_gmaps.toFixed(1)}</span>
                      <div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(restaurant.total_score_gmaps!) ? "text-yellow-400" : "text-gray-300"
                              }`}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Based on {restaurant.reviews_count_gmaps?.toLocaleString() || 0} reviews
                        </p>
                      </div>
                    </div>

                    {Object.keys(reviewsDistribution).length > 0 && (
                      <div className="space-y-2">
                        {Object.entries(reviewsDistribution)
                          .sort(([a], [b]) => b.localeCompare(a))
                          .map(([rating, count]) => {
                            const totalReviews = restaurant.reviews_count_gmaps || 0
                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                            return (
                              <div key={rating} className="flex items-center">
                                <span className="w-20 text-sm">{rating.replace(/([A-Z])/g, " $1").trim()}</span>
                                <div className="flex-1 h-2 mx-3 bg-gray-200 rounded-full">
                                  <div
                                    className="h-2 bg-yellow-400 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="w-12 text-sm text-right">{count.toLocaleString()}</span>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                )}

                {/* No Reviews Message */}
                {(!restaurant.critic_reviews || restaurant.critic_reviews.length === 0) &&
                  (!uniqueCSESnippets || uniqueCSESnippets.length === 0) && (
                    <p className="text-muted-foreground text-center py-8">
                      No professional reviews or mentions available yet.
                    </p>
                  )}
              </TabsContent>

              {questionsAndAnswers.length > 0 && (
                <TabsContent value="faqs" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-playfair">Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {questionsAndAnswers.map((faq, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">{faq.question}</h4>
                            <p className="text-muted-foreground">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {restaurant.reserve_table_url_gmaps && (
                  <a
                    href={restaurant.reserve_table_url_gmaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-3 text-center text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Reserve Table
                  </a>
                )}
                {restaurant.menu_url_gmaps && (
                  <a
                    href={restaurant.menu_url_gmaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-3 text-center border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
                  >
                    View Menu
                  </a>
                )}
                {restaurant.maps_search_url_gmaps && (
                  <a
                    href={restaurant.maps_search_url_gmaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-3 text-center border rounded-md hover:bg-gray-50 transition-colors"
                  >
                    View on Google Maps
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium mb-1 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Address
                  </h5>
                  <p className="text-sm text-muted-foreground">{restaurant.address_gmaps}</p>
                </div>

                {restaurant.phone_gmaps && (
                  <div>
                    <h5 className="font-medium mb-1 flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone
                    </h5>
                    <a href={`tel:${restaurant.phone_gmaps}`} className="text-sm text-primary hover:underline">
                      {restaurant.phone_gmaps}
                    </a>
                  </div>
                )}

                {restaurant.website_gmaps && (
                  <div>
                    <h5 className="font-medium mb-1 flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </h5>
                    <a
                      href={restaurant.website_gmaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {restaurant.temporarily_closed_gmaps && (
                    <Badge variant="destructive" className="w-full justify-center">
                      Temporarily Closed
                    </Badge>
                  )}
                  {restaurant.permanently_closed_gmaps && (
                    <Badge variant="destructive" className="w-full justify-center">
                      Permanently Closed
                    </Badge>
                  )}
                  {!restaurant.temporarily_closed_gmaps && !restaurant.permanently_closed_gmaps && (
                    <Badge variant="default" className="w-full justify-center bg-green-600">
                      Open
                    </Badge>
                  )}
                  {restaurant.popular_times_live_text_gmaps && (
                    <p className="text-sm text-muted-foreground text-center">
                      {restaurant.popular_times_live_text_gmaps}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
