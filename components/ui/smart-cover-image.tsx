"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getRandomPlaceholder } from "@/lib/utils"

interface SmartCoverImageProps {
  srcs: string[]
  alt: string
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  width?: number
  height?: number
}

export const SmartCoverImage: React.FC<SmartCoverImageProps> = ({
  srcs,
  alt,
  className,
  fill = false,
  sizes,
  priority = false,
  width,
  height,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [imgSrc, setImgSrc] = useState(srcs[0] || getRandomPlaceholder())
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setCurrentIdx(0)
    setImgSrc(srcs[0] || getRandomPlaceholder())
    setHasError(false)
  }, [srcs])

  const handleError = () => {
    if (currentIdx < srcs.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setImgSrc(srcs[currentIdx + 1])
    } else {
      setHasError(true)
      setImgSrc(getRandomPlaceholder())
    }
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
      onError={handleError}
      unoptimized={imgSrc.startsWith("/api/image-proxy")}
    />
  )
} 