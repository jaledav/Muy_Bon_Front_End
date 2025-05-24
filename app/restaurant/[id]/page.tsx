"use client"

// Import useParams hook
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams } from 'next/navigation' // Import useParams
import { MapPin, Star, ArrowLeft, Phone, Globe, Clock, Calendar, Users } from "lucide-react"
import Image from "next/image"
import { fetchRestaurantById } from "@/lib/supabase-client" // Corrected path
// Remove .tsx extension from import path
import { useLiveReviews } from "@/hooks/use-live-reviews"
import { Badge } from "@/components/ui/badge" // Corrected path
import { Card, CardContent } from "@/components/ui/card" // Corrected path
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Corrected path
import { Separator } from "@/components/ui/separator" // Corrected path
import { Button } from "@/components/ui/button" // Corrected path
import PopularTimesChart from "@/components/popular-times-chart" // Corrected path
// Import Json type from supabase.types
import type { Restaurant, RestaurantReview } from "@/lib/supabase-client" // Corrected path
import type { Json } from "@/lib/supabase.types" // Import Json from correct file

// Sample Data Function (to be added in the component file)
const createSampleRestaurant = (id: string): Restaurant & { restaurant_reviews: RestaurantReview[] } => ({
  id: `sample-${id}`, // Use the requested ID in the sample
  google_place_id: id,
  name: `Sample Restaurant ${id}`,
  location: "123 Sample St, Sample City",
  description: "A delightful sample restaurant offering the finest imaginary cuisine. Perfect for testing layouts and component rendering.",
  vibes: ["Cozy", "Casual", "Sample"],
  total_score: 4.5,
  reviews_count: 123,
  cover_image_url: "/placeholder.jpg", // Use a placeholder image
  street: "123 Sample St",
  city: "Sample City",
  postalCode: "S4M PL3",
  latitude: 51.0447, // Sample coordinates (Calgary)
  longitude: -114.0719,
  maps_url: "https://www.google.com/maps",
  phone: "+44 123 456 7890",
  website: "https://example.com",
  opening_hours: { // Sample JSONB
    monday: "11:00 - 22:00",
    tuesday: "11:00 - 22:00",
    wednesday: "11:00 - 22:00",
    thursday: "11:00 - 22:00",
    friday: "11:00 - 23:00",
    saturday: "12:00 - 23:00",
    sunday: "12:00 - 21:00",
  },
  additional_info: { // Sample JSONB
    "Dining options": { "Dine-in": true, "Takeaway": true, "Delivery": false },
    "Offerings": { "Alcohol": true, "Coffee": true, "Halal food": false },
    "Amenities": { "Toilets": true, "Free Wi-Fi": true },
    "Atmosphere": { "Casual": true, "Cozy": true },
    "Crowd": { "Groups": true, "Tourists": false },
    "Planning": { "Accepts reservations": true },
    "Payments": { "Credit cards": true, "Debit cards": true, "NFC mobile payments": true },
  },
  popular_times: { // Sample JSONB (simplified structure for example)
    "Monday": [0,0,0,0,0,0,10,20,30,40,50,60,70,80,70,60,50,60,70,60,50,40,30,20],
    "Tuesday": [0,0,0,0,0,0,10,20,30,40,50,60,70,80,70,60,50,60,70,60,50,40,30,20],
    // ... add other days or use a more realistic structure if needed
  },
  people_also_search: [ // Sample JSONB
    { title: "Another Sample Place", totalScore: 4.2, reviewsCount: 98 },
    { title: "Sample Cafe", totalScore: 4.8, reviewsCount: 210 },
    { title: "Test Eatery", totalScore: 4.0, reviewsCount: 55 },
  ],
  reviews_distribution: { // Sample JSONB
    fiveStar: 70, fourStar: 30, threeStar: 15, twoStar: 5, oneStar: 3
  },
  reviews_tags: [ // Sample JSONB
     { title: "Good food", count: 50 }, { title: "Friendly staff", count: 45 }, { title: "Nice ambiance", count: 30 }
  ],
  questions_and_answers: [ // Sample JSONB
    { question: "Is parking available?", answer: "Yes, there is street parking nearby." },
    { question: "Are pets allowed?", answer: "Only service animals are permitted inside." }
  ],
  reserve_table_url: "https://example.com/reservations",
  menu_url: "https://example.com/menu",
  critic_review_snippet: "A truly remarkable sample experience.",
  critic_review_date: "2024-01-15",
  recommended_dishes: ["Sample Appetizer", "Test Main Course", "Imaginary Dessert"],
  // Add other fields from Restaurant type as null or default values if needed
  address: null, categories: null, categoryName: null, cid: null, claim_this_business: null, countryCode: null, created_at: new Date().toISOString(), critic_review_url: null, fid: null, gas_prices: null, google_food_url: null, hotel_ads: null, image_categories: null, images_count: null, is_advertisement: null, kgmid: null, language: null, neighborhood: null, owner_updates: null, permanently_closed: false, phone_unformatted: null, places_tags: null, plus_code: null, popular_times_histogram: null, priceRange: "$$", scraped_at: null, search_string: null, sentiment: null, sentiment_confidence: null, sentiment_reason: null, state: null, temporarily_closed: false, url: null,
  // Sample Reviews
  restaurant_reviews: [
    {
      id: "review-sample-1",
      restaurant_id: `sample-${id}`,
      reviewer: "Sample Critic A",
      publication: "The Sample Times",
      snippet: "An outstanding example of how a sample review should look. Highly recommended for testing purposes.",
      review_date: "2024-03-10",
      review_url: "https://example.com/review1",
      popular_menu_items: ["Sample Starter", "Test Dish"],
      sentiment: 5,
      sentiment_reason: "Excellent presentation and imaginary flavour.",
      sentiment_confidence: 0.95,
      created_at: new Date().toISOString(),
    },
    {
      id: "review-sample-2",
      restaurant_id: `sample-${id}`,
      reviewer: "Sample Critic B",
      publication: "Sample Eater",
      snippet: "A solid sample entry, though the virtual textures could be improved.",
      review_date: "2024-02-20",
      review_url: "https://example.com/review2",
      popular_menu_items: ["Another Dish", "Virtual Soup"],
      sentiment: 4,
      sentiment_reason: "Good, but not groundbreaking in the sample world.",
      sentiment_confidence: 0.88,
      created_at: new Date().toISOString(),
    },
  ],
});


// Remove params from props
export default function RestaurantPage() {
  // Get params using the hook
  const params = useParams<{ id: string }>() // Specify type for params
  const id = params ? decodeURIComponent(params.id) : '' // Decode ID from hook result, handle potential null

  // State for reviews, updated by the hook
  const [restaurantData, setRestaurantData] = useState<(Restaurant & { restaurant_reviews: RestaurantReview[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    async function loadRestaurant() {
      // Don't fetch if id is empty (can happen briefly on initial load with useParams)
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true)
        setError(null); // Reset error on new load
        const data = await fetchRestaurantById(id)
        // If data is null (not found), setRestaurantData to null.
        // The component will then render the "Restaurant data not available" message.
        setRestaurantData(data)
      } catch (err: any) {
        // Log the full error object for better debugging
        console.error("Full error object loading restaurant:", JSON.stringify(err, null, 2));
        let errorMessage = "Failed to load restaurant details.";
        // Try to extract more specific info from Supabase error object
        if (err && typeof err === 'object') {
          if ('message' in err && err.message) errorMessage = err.message;
          if ('details' in err && err.details) errorMessage += ` Details: ${err.details}`;
          if ('hint' in err && err.hint) errorMessage += ` Hint: ${err.hint}`;
          if ('code' in err && err.code) errorMessage += ` Code: ${err.code}`;
        }
        console.error("Processed error loading restaurant:", errorMessage); // Log the constructed message
        setError(errorMessage); // Set potentially more detailed error
      } finally {
        setLoading(false)
      }
    }

    loadRestaurant()
  }, [id])

  // Memoized callback for handling new reviews
  const handleNewReview = useCallback((newReview: RestaurantReview) => {
    setRestaurantData(currentData => {
      if (!currentData) return null; // Should not happen if initial load succeeded
      // Avoid duplicates if the hook fires unexpectedly fast
      const reviewExists = currentData.restaurant_reviews.some(r => r.id === newReview.id);
      if (reviewExists) return currentData;
      return {
        ...currentData,
        // Prepend new review
        restaurant_reviews: [newReview, ...currentData.restaurant_reviews],
      };
    });
  }, []); // Empty dependency array as setRestaurantData is stable

  // Use the live reviews hook to update reviews state
  // Pass the actual restaurant UUID (restaurant.id) if available, otherwise null/undefined.
  // The useLiveReviews hook already checks if the id is valid before subscribing.
  useLiveReviews(restaurantData ? restaurantData.id : '', handleNewReview)


  // Use restaurantData for rendering
  const restaurant = restaurantData;

  // The createSampleRestaurant function is no longer needed if we don't fall back to it.
  // Consider removing it entirely if it's not used elsewhere for testing.
  // For now, I will leave it, but it won't be called in the main data fetching path.

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

  // Display error message if fetching failed
  if (error) {
    // Add missing return statement
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

  // Handle case where restaurant is null after loading (shouldn't happen with current fetch logic but good practice)
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


  // Safely parse JSONB fields with fallbacks
  let openingHoursDisplay: { day: string; hours: string }[] = [];
  if (Array.isArray(restaurant.opening_hours)) {
    openingHoursDisplay = restaurant.opening_hours.map(oh_item => {
      let day = 'Unknown Day';
      let hours = 'N/A';
      if (typeof oh_item === 'object' && oh_item !== null) {
        // Safely access properties if oh_item is an object
        day = String((oh_item as any).day || 'Unknown Day');
        hours = String((oh_item as any).hours || 'N/A');
      } else if (typeof oh_item === 'string') {
        // Handle if item is just a string, though less likely for opening hours array
        // This case might need specific logic based on actual data format
        // For now, let's assume it might be a string representing day and hours
        const parts = oh_item.split(':');
        if (parts.length > 1) {
          day = parts[0].trim();
          hours = parts.slice(1).join(':').trim();
        } else {
          hours = oh_item; // Or treat as just hours if no clear day
        }
      }
      return { day, hours };
    }).filter(entry => entry.day !== 'Unknown Day' || entry.hours !== 'N/A'); // Filter out completely unparseable entries
  } else if (typeof restaurant.opening_hours === 'object' && restaurant.opening_hours !== null) {
    // Assuming it's an object like { monday: "...", tuesday: "..." }
    openingHoursDisplay = Object.entries(restaurant.opening_hours).map(([day, hours]) => ({
      day: String(day),
      hours: String(hours)
    }));
  }

  const additionalInfo = typeof restaurant.additional_info === 'object' && restaurant.additional_info !== null
    ? (restaurant.additional_info as Record<string, any>) // Use 'any' for flexibility or define a stricter type
    : {};
  const popularTimes = typeof restaurant.popular_times === 'object' && restaurant.popular_times !== null
    ? (restaurant.popular_times as Record<string, any>) // Use 'any' or define a stricter type
    : {};
  const reviewsDistribution = typeof restaurant.reviews_distribution === 'object' && restaurant.reviews_distribution !== null
    ? (restaurant.reviews_distribution as Record<string, number>) // Assuming structure like { fiveStar: 100, ... }
    : { fiveStar: 0, fourStar: 0, threeStar: 0, twoStar: 0, oneStar: 0 }; // Default structure

  // Use actual reviews tags if available, otherwise empty array
  const popularTags = Array.isArray(restaurant.reviews_tags)
    ? restaurant.reviews_tags as { title: string; count: number }[] // Assuming structure matches
    : [];

  // Use actual FAQs if available (assuming it's stored in a JSONB field, e.g., 'faqs_json')
  // If not stored in DB, keep the generated ones or remove the section
  const faqs = typeof restaurant.questions_and_answers === 'object' && restaurant.questions_and_answers !== null
    ? restaurant.questions_and_answers as { question: string; answer: string }[] // Assuming structure
    : [ // Fallback to generated FAQs if DB field is empty/missing
        { question: "Do they take reservations?", answer: "Yes, reservations are recommended." },
        { question: "Is there a dress code?", answer: "Smart casual is recommended." },
        { question: "Do they have vegetarian options?", answer: "Yes, several options are available." },
      ];

  // Get headline review snippet/date if available
  const headlineReviewSnippet = restaurant.critic_review_snippet;
  const headlineReviewDate = restaurant.critic_review_date;
  const headlineRecommendedDishes = restaurant.recommended_dishes?.join(", ") || "Chef's specials"; // Use recommended_dishes array

  // Log restaurant data for debugging reviews
  console.log("RestaurantPage: restaurantData for rendering:", restaurant);
  if (restaurant) {
    console.log("RestaurantPage: restaurant.restaurant_reviews:", restaurant.restaurant_reviews);
  }

  return (
    <main className="min-h-screen bg-[#f9f5f0]">
      {/* Removed Sample check, rely on actual data */}

      <div className="relative h-[40vh] w-full">
        <Image
          src={restaurant.cover_image_url || "/placeholder.svg?height=600&width=1200"}
          alt={restaurant.name || "Restaurant Image"} // Add fallback alt text
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <Link href="/directory" className="flex items-center mb-4 text-white/80 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Link>
          <h1 className="text-4xl font-bold font-playfair">{restaurant.name}</h1>
          <div className="flex items-center mt-2 flex-wrap gap-x-4 gap-y-1"> {/* Adjusted gap */}
            <div className="flex items-center"> {/* Wrap location */}
              <MapPin className="w-4 h-4 mr-1" />
              <p className="text-sm">{restaurant.location}</p>
            </div>
            <div className="flex items-center"> {/* Wrap rating */}
              <Star className="w-4 h-4 mr-1 text-yellow-400" />
              {/* Use nullish coalescing for score/count */}
              <span>{(restaurant.total_score ?? 0).toFixed(1)}</span>
              <span className="ml-1 text-sm text-white/80">({restaurant.reviews_count ?? 0})</span>
            </div>
            {/* Render vibes array */}
            {restaurant.vibes && restaurant.vibes.length > 0 && (
              <div className="flex flex-wrap gap-1 w-full mt-1"> {/* Ensure vibes wrap */}
                {restaurant.vibes.map((vibe: string) => ( // Add type annotation
                  <Badge key={vibe} variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/50">
                    {vibe}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container px-4 py-12 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="faqs">FAQs</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-2xl font-semibold font-playfair">About {restaurant.name}</h2>
                    <p className="mb-6 text-lg">{restaurant.description}</p>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="mb-2 text-lg font-semibold">Vibe</h3>
                        {/* Join vibes array */}
                        <p>{restaurant.vibes?.join(", ") ?? "Not specified"}</p>
                      </div>
                      {/* Use headlineRecommendedDishes */}
                      <div>
                        <h3 className="mb-2 text-lg font-semibold">Recommended Dishes</h3>
                        <p>{headlineRecommendedDishes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-2xl font-semibold font-playfair">Popular Times</h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                      See when this restaurant is typically busiest. The chart shows relative occupancy throughout the
                      day.
                    </p>
                    {/* Use parsed popularTimes */}
                    {Object.keys(popularTimes).length > 0 ? (
                      <PopularTimesChart popularTimes={popularTimes} />
                    ) : (
                      <p className="text-muted-foreground">Popular times information not available.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    {/* Use people_also_search JSONB field */}
                    <h2 className="mb-4 text-2xl font-semibold font-playfair">People Also Search For</h2>
                    {Array.isArray(restaurant.people_also_search) && restaurant.people_also_search.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {(restaurant.people_also_search as { title: string; totalScore: number; reviewsCount: number }[]).map((place, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <h3 className="mb-1 font-semibold">{place.title}</h3>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-400" />
                              <span>{place.totalScore?.toFixed(1) ?? 'N/A'}</span>
                              <span className="ml-1 text-sm text-muted-foreground">({place.reviewsCount ?? 0})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                       <p className="text-muted-foreground">Similar restaurant information not available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-2xl font-semibold font-playfair">Details</h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="mb-2 text-lg font-semibold">Address</h3>
                        <p className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 mt-1" />
                          {/* Use specific address fields */}
                          <span>
                            {restaurant.street}, {restaurant.city}, {restaurant.postalCode}
                          </span>
                        </p>
                      </div>

                      <div>
                        <h3 className="mb-2 text-lg font-semibold">Contact</h3>
                        {/* Use actual phone */}
                        {restaurant.phone && (
                          <p className="flex items-center mb-2">
                            <Phone className="w-4 h-4 mr-2" />
                            <a href={`tel:${restaurant.phone}`} className="hover:underline">
                              {restaurant.phone}
                            </a>
                          </p>
                        )}
                        {/* Use actual website */}
                        {restaurant.website && (
                          <p className="flex items-center">
                            <Globe className="w-4 h-4 mr-2" />
                            <a
                              href={restaurant.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {restaurant.website.replace(/^https?:\/\//, "")}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div>
                      <h3 className="mb-4 text-lg font-semibold">Opening Hours</h3>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {openingHoursDisplay.length > 0 ? (
                          openingHoursDisplay.map((entry, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="font-medium capitalize">{entry.day}</span>
                              <span>{entry.hours}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">Opening hours not available.</p>
                        )}
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div>
                      <h3 className="mb-4 text-lg font-semibold">Features & Amenities</h3>
                      {/* Render parsed additionalInfo */}
                      {Object.keys(additionalInfo).length > 0 ? (
                        Object.entries(additionalInfo).map(([category, items]) => (
                          <div key={category} className="mb-4">
                            {/* Format category name */}
                            <h4 className="mb-2 font-medium capitalize">{category.replace(/_/g, " ")}</h4>
                            <div className="flex flex-wrap gap-2">
                              {/* Handle items being boolean, string, or object */}
                              {typeof items === 'object' && items !== null && !Array.isArray(items) ? (
                                Object.entries(items)
                                  .filter(([_, value]) => value === true) // Only show true boolean values
                                  .map(([key]) => (
                                    <Badge key={key} variant="outline">
                                      {key.replace(/_/g, " ")}
                                    </Badge>
                                  ))
                              ) : typeof items === 'string' ? (
                                <Badge variant="outline">{items}</Badge>
                              ) : null /* Add more conditions if needed */}
                            </div>
                          </div>
                        ))
                      ) : (
                         <p className="text-muted-foreground">Features & amenities not available.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-6 text-2xl font-semibold font-playfair">Reviews</h2>

                    {/* Critic Review from restaurants table fields (formerly Featured Critic Review) */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">Critic Reviews</h3> 
                      {/* This now serves as the main title for the first review. */}
                      {restaurant.critic_review_snippet ? (
                        <div className="p-4 border rounded-lg">
                          {restaurant.sentiment !== null && (
                            <div className="flex items-center mb-2">
                              <Star className="w-5 h-5 mr-1 text-yellow-400" />
                              {/* Assuming sentiment is out of 10 as per user feedback */}
                              <span className="text-lg font-semibold">{(restaurant.sentiment / 1).toFixed(1)}/10</span>
                              {/* If sentiment is on a different scale, adjust display logic */}
                            </div>
                          )}
                          <p className="mb-4 italic">"{restaurant.critic_review_snippet}"</p>
                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              {restaurant.critic_review_date ? new Date(restaurant.critic_review_date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }) : "Date unknown"}
                            </span>
                            {restaurant.critic_review_url && (
                              <a
                                href={restaurant.critic_review_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                Read full review
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No critic review highlight available.</p>
                      )}
                    </div>

                    {/* List of reviews from restaurant_reviews table (headline removed) */}
                    <div className="mb-6">
                        {/* Headline "Additional Critic Reviews" removed */}
                        {restaurant.restaurant_reviews && restaurant.restaurant_reviews.length > 0 ? (
                          <div className="space-y-6 mt-6"> {/* Added mt-6 for spacing if snippet exists */}
                            {restaurant.restaurant_reviews.map((review: RestaurantReview) => (
                              <div key={review.id} className="p-4 border rounded-lg">
                                <div className="mb-2">
                                  <h4 className="font-semibold">{review.publication || 'Review'}</h4>
                                </div>
                                <div className="flex items-center mb-4">
                                  <div className="flex mr-2">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < (review.sentiment ?? 0) ? "text-yellow-400" : "text-gray-300"}`}
                                        fill={i < (review.sentiment ?? 0) ? "currentColor" : "none"}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-muted-foreground">Rating: {review.sentiment ?? 'N/A'}/5</span>
                                </div>
                                <p className="mb-4 italic">"{review.snippet}"</p>
                                {review.popular_menu_items && review.popular_menu_items.length > 0 && (
                                  <div className="mb-2">
                                    <p className="text-sm font-medium">Recommended dishes:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {review.popular_menu_items.map((item: string, idx: number) => (
                                        <Badge key={idx} variant="outline">{item}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {review.sentiment_reason && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    <span className="font-medium">Why this rating: </span>
                                    {review.sentiment_reason}
                                  </p>
                                )}
                                <div className="mt-4 flex justify-between items-center">
                                  <span className="text-xs text-muted-foreground">
                                    {review.review_date ? new Date(review.review_date).toLocaleDateString("en-US", {
                                      year: "numeric", month: "long", day: "numeric",
                                    }) : "Date unknown"}
                                  </span>
                                  {review.review_url && (
                                    <a href={review.review_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                      Read full review
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No additional reviews available yet.</p>
                        )}
                    </div>

                    {/* Google Reviews Summary - Use parsed reviewsDistribution */}
                    <div className="p-4 mb-6 border rounded-lg">
                      <h3 className="mb-3 text-lg font-semibold">Google Reviews</h3>
                      <div className="flex items-center mb-4">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 mr-1 text-yellow-400" />
                          <span className="text-xl font-semibold">{(restaurant.total_score ?? 0).toFixed(1)}</span>
                        </div>
                        <span className="ml-2 text-sm text-muted-foreground">
                          Based on {restaurant.reviews_count ?? 0} reviews
                        </span>
                      </div>

                      <div className="space-y-2">
                        {[
                          { label: "5 stars", count: reviewsDistribution.fiveStar },
                          { label: "4 stars", count: reviewsDistribution.fourStar },
                          { label: "3 stars", count: reviewsDistribution.threeStar },
                          { label: "2 stars", count: reviewsDistribution.twoStar },
                          { label: "1 star", count: reviewsDistribution.oneStar },
                        ].map((item, index) => {
                          // Use nullish coalescing for reviews_count
                          const totalReviews = restaurant.reviews_count ?? 0;
                          const percentage = totalReviews > 0 ? (item.count / totalReviews) * 100 : 0;
                          return (
                            <div key={index} className="flex items-center">
                              <span className="w-16 text-sm">{item.label}</span>
                              <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-2 bg-yellow-400 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="w-12 text-sm text-right">{item.count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-4 text-lg font-semibold">Popular Mentions</h3>
                      <div className="flex flex-wrap gap-2">
                        {/* Use parsed popularTags */}
                        {popularTags.length > 0 ? popularTags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag.title} ({tag.count})
                          </Badge>
                        )) : <p className="text-muted-foreground text-sm">No popular mentions found.</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faqs" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-6 text-2xl font-semibold font-playfair">Frequently Asked Questions</h2>
                    {/* Use parsed faqs */}
                    {faqs.length > 0 ? (
                      <div className="space-y-4">
                        {faqs.map((faq, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <h3 className="mb-2 text-lg font-medium">{faq.question}</h3>
                            <p>{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No FAQs available for this restaurant.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold font-playfair">Make a Reservation</h2>
                <div className="space-y-4">
                  {/* Keep dummy reservation form */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Date</label>
                      <div className="flex items-center w-full p-2 border rounded-md">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <input type="date" className="w-full bg-transparent outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Time</label>
                      <select className="w-full p-2 border rounded-md">
                        <option>12:00 PM</option> <option>12:30 PM</option> <option>1:00 PM</option>
                        <option>1:30 PM</option> <option>2:00 PM</option> <option>6:00 PM</option>
                        <option>6:30 PM</option> <option>7:00 PM</option> <option>7:30 PM</option>
                        <option>8:00 PM</option> <option>8:30 PM</option> <option>9:00 PM</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">Party Size</label>
                    <div className="flex items-center w-full p-2 border rounded-md">
                      <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                      <select className="w-full bg-transparent outline-none">
                        <option>1 person</option> <option>2 people</option> <option>3 people</option>
                        <option>4 people</option> <option>5 people</option> <option>6 people</option>
                        <option>7 people</option> <option>8 people</option>
                      </select>
                    </div>
                  </div>
                  <Button className="w-full">Check Availability</Button>
                  {/* Use actual reservation URL */}
                  {restaurant.reserve_table_url && (
                    <div className="text-center">
                      <a
                        href={restaurant.reserve_table_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:underline"
                      >
                        Or book directly on their website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold font-playfair">Contact Information</h2>
                <div className="space-y-3">
                  {/* Use actual address fields */}
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-3 text-primary" />
                    <div>
                      <p className="font-medium">
                        {restaurant.street}, {restaurant.city}, {restaurant.postalCode}
                      </p>
                      {/* Use actual maps URL or generate one */}
                      <a
                        href={restaurant.maps_url ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name} ${restaurant.street} ${restaurant.city}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View on Google Maps
                      </a>
                    </div>
                  </div>
                  {/* Use actual phone */}
                  {restaurant.phone && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-3 text-primary" />
                      <a href={`tel:${restaurant.phone}`} className="hover:underline">
                        {restaurant.phone}
                      </a>
                    </div>
                  )}
                  {/* Use actual website */}
                  {restaurant.website && (
                    <div className="flex items-center">
                      <Globe className="w-5 h-5 mr-3 text-primary" />
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  {/* Use parsed opening hours */}
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-primary" />
                    <div>
                      <p className="font-medium">Hours Today</p>
                      <p className="text-sm">
                        {(() => {
                          const todayKey = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
                          const todayEntry = openingHoursDisplay.find(entry => entry.day.toLowerCase() === todayKey);
                          return todayEntry ? todayEntry.hours : "Closed";
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold font-playfair">Menu</h2>
                {/* Use actual menu URL */}
                {restaurant.menu_url ? (
                  <a
                    href={restaurant.menu_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-3 text-center text-white bg-primary rounded-md hover:bg-primary/90"
                  >
                    View Full Menu
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Menu link not available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
