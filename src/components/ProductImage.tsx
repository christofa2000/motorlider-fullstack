"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

type ProductImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  className?: string;
};

const FALLBACK_SRC = "/images/products/placeholder.png";

const ProductImage = ({ src, alt, className, ...props }: ProductImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(src || FALLBACK_SRC);

  const handleError = () => {
    if (currentSrc !== FALLBACK_SRC) {
      setCurrentSrc(FALLBACK_SRC);
    }
  };

  return (
    <Image
      src={currentSrc || FALLBACK_SRC}
      alt={alt}
      onError={handleError}
      className={className}
      {...props}
    />
  );
};

export default ProductImage;
