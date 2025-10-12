"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

type SafeNextImageProps = Omit<ImageProps, "src"> & { 
  src?: string | null;
  fallbackSrc?: string;
  unoptimized?: boolean;
};

/**
 * Normaliza la URL de la imagen para evitar errores de Next.js Image
 * - Si src está vacío/null/undefined -> usa fallback
 * - Si src no comienza con "/" ni "http(s)://" -> usa fallback
 * - Soporta URLs de Cloudinary y rutas relativas
 */
function normalizeSrc(src?: string | null, fallbackSrc = "/images/placeholder.png"): string {
  if (!src) return fallbackSrc;
  
  const trimmedSrc = src.trim();
  
  // URLs válidas: http/https o rutas relativas que empiecen con /
  if (
    trimmedSrc.startsWith("http://") || 
    trimmedSrc.startsWith("https://") || 
    trimmedSrc.startsWith("/")
  ) {
    return trimmedSrc;
  }
  
  // URLs de Cloudinary sin protocolo (ej: "res.cloudinary.com/...")
  if (trimmedSrc.includes("cloudinary.com")) {
    return `https://${trimmedSrc}`;
  }
  
  // Cualquier otra cosa es inválida
  return fallbackSrc;
}

/**
 * Componente wrapper seguro para Next.js Image
 * Maneja URLs inválidas y proporciona fallback automático
 */
export default function SafeNextImage({ 
  src, 
  alt, 
  fallbackSrc = "/images/placeholder.png",
  unoptimized = false,
  onError,
  ...rest 
}: SafeNextImageProps) {
  const [currentSrc, setCurrentSrc] = useState(() => normalizeSrc(src, fallbackSrc));
  const [hasError, setHasError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    onError?.(e);
  };

  return (
    <Image
      src={currentSrc}
      alt={alt ?? "Imagen del producto"}
      unoptimized={unoptimized}
      onError={handleError}
      {...rest}
    />
  );
}

