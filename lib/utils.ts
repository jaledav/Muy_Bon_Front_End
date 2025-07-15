import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the best available image for a restaurant
 * Priority: cover_image_url_gmaps > first image from image_urls_gmaps > placeholder
 */
export function getBestRestaurantImage(restaurant: {
  cover_image_url_gmaps?: string | null
  image_urls_gmaps?: string[] | null
  name?: string | null
}): string {
  // First priority: cover image
  if (restaurant.cover_image_url_gmaps) {
    return restaurant.cover_image_url_gmaps
  }
  
  // Second priority: first image from image array
  if (restaurant.image_urls_gmaps && restaurant.image_urls_gmaps.length > 0) {
    const firstImage = restaurant.image_urls_gmaps[0]
    if (firstImage) {
      return firstImage
    }
  }
  
  // Fallback: random SVG placeholder
  return getRandomPlaceholder();
}

export function getRandomPlaceholder() {
  const placeholders = [
    "/placeholder1.svg",
    "/placeholder2.svg",
    "/placeholder3.svg",
    "/placeholder4.svg",
  ];
  return placeholders[Math.floor(Math.random() * placeholders.length)];
}
