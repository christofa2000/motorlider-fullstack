"use client";

import { ImageProps } from "next/image";
import SafeNextImage from "./ui/SafeNextImage";

type ProductImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  className?: string;
};

const FALLBACK_SRC = "/images/products/placeholder.png";

const ProductImage = ({ src, alt, className, ...props }: ProductImageProps) => {
  return (
    <SafeNextImage
      src={src}
      alt={alt}
      fallbackSrc={FALLBACK_SRC}
      className={className}
      {...props}
    />
  );
};

export default ProductImage;
