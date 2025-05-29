export interface Restaurant {
  id: number
  name: string
  location: string // This seems simplified, likely needs updating based on actual data
  image: string // This seems simplified, likely needs updating based on actual data
  price: string // This seems simplified, likely needs updating based on actual data
  vibes: string[] // This seems simplified, likely needs updating based on actual data
  description: string // This seems simplified, likely needs updating based on actual data
}

// Example type based on a potential Supabase query structure used on the home page
// Adjust this based on the actual fields and joins you are selecting
export interface SupabaseRestaurant {
  id: string; // Supabase IDs are often UUIDs (strings)
  name: string;
  description: string | null;
  image_url: string | null; // Assuming image is stored as a URL
  address: string | null;
  phone_number: string | null;
  website: string | null;
  approved: boolean;
  featured: boolean;
  created_at: string; // ISO 8601 string
  user_id: string | null; // Foreign key to user, if applicable

  // Joined relations (adjust based on your actual query and table structure)
  cuisine_types?: { name: string } | { name: string }[] | null; // Example: assuming a join that brings back the name
  locations?: { name: string } | { name: string }[] | null;
  price_ranges?: { range: string } | { range: string }[] | null; // Assuming price_ranges has a 'range' column

  // Add other fields from your 'restaurants' table as needed
  // e.g., rating, review_count, etc.
}

// Note: The existing 'Restaurant' interface might be for a different data source
// (like the RestaurantProfile below). Ensure the types used in your components
// match the actual data structure you are fetching.

export interface RestaurantProfile {
  // This interface seems to be for a different, more detailed data structure,
  // possibly from an external API or scraping.
  // Ensure this is used correctly where this specific data shape is expected.

  meta: {
    scrapedAt: string
    enrichedTimestamp: string
    hasEnrichedData: boolean
  }
  basicInfo: {
    name: string
    location: string
    address: string
    city: string
    postalCode: string
    countryCode: string
    coordinates: {
      lat: number
      lng: number
    }
    phone: string
    website: string
    menuUrl: string
    reservationUrl: string
    googlePlaceId: string
    mapsUrl: string
    priceRange: string | null
    categoryName: string
  }
  overview: {
    summary: string
    vibe: string
    reviewer: string
    publication: string
    sentiment: number
    sentimentReason: string
    sentimentConfidence: number
    recommendedDishes: string
    reviewSnippet?: string
    reviewDate?: string
    reviewURL?: string
  }
  ratingAndReviews: {
    totalScore: number
    reviewsCount: number
    reviewsDistribution: {
      oneStar: number
      twoStar: number
      threeStar: number
      fourStar: number
      fiveStar: number
    }
  }
  popularTimes: {
    [key: string]: Array<{
      hour: number
      occupancyPercent: number
    }>
  }
  openingHours: Array<{
    day: string
    hours: string
  }>
  faqs: Array<{
    question: string
    answer: string
  }>
  peopleAlsoSearchFor: Array<{
    title: string
    reviewsCount: number
    totalScore: number
  }>
  tagsAndAttributes: {
    reviewTags: Array<{
      title: string
      count: number
    }>
    additionalInfo: {
      [key: string]: Array<{
        [key: string]: boolean
      }>
    }
  }
  images: {
    count: number
    categories: string[]
    mainImageUrl: string
  }
}
