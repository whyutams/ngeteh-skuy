"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CupSoda } from "lucide-react";

interface MenuImageProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  iconClassName?: string;
  fallbackContainerClassName?: string;
}

export function MenuImage({
  src,
  alt,
  fill = true,
  sizes,
  className = "object-cover",
  iconClassName = "h-8 w-8 text-tea-700",
  fallbackContainerClassName = "w-full h-full flex items-center justify-center bg-tea-50",
}: MenuImageProps) {
  const [hasError, setHasError] = useState(false);

  // Reset status error jika src berubah
  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className={fallbackContainerClassName}>
        <CupSoda className={iconClassName} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

