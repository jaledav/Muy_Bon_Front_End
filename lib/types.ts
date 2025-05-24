export interface Restaurant {
  id: number
  name: string
  location: string
  image: string
  price: string
  vibes: string[]
  description: string
}

export interface RestaurantProfile {
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
