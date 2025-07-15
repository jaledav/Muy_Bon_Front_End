"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getRandomPlaceholder } from "@/lib/utils"

interface ClientImageWithFallbackProps {
  imageUrls: (string | null | undefined)[]
  alt: string
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  onClick?: () => void
  width?: number
  height?: number
}

export const ClientImageWithFallback: React.FC<ClientImageWithFallbackProps> = ({
  imageUrls,
  alt,
  className,
  fill = false,
  sizes,
  priority = false,
  onClick,
  width,
  height,
}) => {
  const validImageUrls = imageUrls.filter((url): url is string => !!url);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imgSrc, setImgSrc] = useState(validImageUrls[0] || getRandomPlaceholder());

  useEffect(() => {
    setCurrentImageIndex(0);
    setImgSrc(validImageUrls[0] || getRandomPlaceholder());
  }, [imageUrls]);

  const handleError = () => {
    const nextIndex = currentImageIndex + 1;
    if (nextIndex < validImageUrls.length) {
      setCurrentImageIndex(nextIndex);
      setImgSrc(validImageUrls[nextIndex]);
    } else {
      setImgSrc(getRandomPlaceholder());
    }
  };

  if (validImageUrls.length === 0) {
    return (
      <img
        src={getRandomPlaceholder()}
        alt={alt}
        className={className}
        style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : {}}
        width={width}
        height={height}
        onClick={onClick}
      />
    );
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
