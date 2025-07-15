import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return new NextResponse('Missing image URL', { status: 400 })
  }

  // Only allow Google Maps images for security
  if (!imageUrl.startsWith('https://lh3.googleusercontent.com/')) {
    return new NextResponse('Invalid image URL', { status: 400 })
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.google.com/',
      },
    })

    if (!response.ok) {
      // Instead of throwing an error, redirect to a placeholder
      const placeholderUrl = `/placeholder.svg?height=400&width=600&text=${encodeURIComponent('Image Unavailable')}`
      return NextResponse.redirect(new URL(placeholderUrl, request.url))
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    // Redirect to placeholder instead of returning error
    const placeholderUrl = `/placeholder.svg?height=400&width=600&text=${encodeURIComponent('Image Unavailable')}`
    return NextResponse.redirect(new URL(placeholderUrl, request.url))
  }
} 