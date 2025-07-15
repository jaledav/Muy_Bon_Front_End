"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getRandomPlaceholder } from "@/lib/utils"

interface ImageWithFallbackProps {
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  onClick?: () => void
  width?: number
  height?: number
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc,
  className,
  fill = false,
  sizes,
  priority = false,
  onClick,
  width,
  height,
}) => {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setImgSrc(src)
    setHasError(false)
  }, [src])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc || getRandomPlaceholder())
    }
  }

  // If src is missing, empty, or not a string, show a random SVG
  if (!src || typeof src !== 'string' || src.trim() === '') {
    return (
      <img
        src={getRandomPlaceholder()}
        alt={alt}
        className={className}
        style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : undefined}
        width={width}
        height={height}
        onClick={onClick}
      />
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      onClick={onClick}
      onError={handleError}
    />
  )
} 