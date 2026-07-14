"use client";

import Image from "next/image";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/media-rules";
import type { LocalizedText } from "@/types/portfolio";

type LocalizedProjectImageProps = {
  alt: LocalizedText;
  className?: string;
  fill?: boolean;
  height?: number;
  loading?: "eager" | "lazy";
  optimizedWidth?: number;
  priority?: boolean;
  sizes?: string;
  source: string;
  width?: number;
};

export function LocalizedProjectImage({
  alt,
  className,
  fill = false,
  height,
  loading = "lazy",
  optimizedWidth,
  priority = false,
  sizes,
  source,
  width,
}: LocalizedProjectImageProps) {
  const { locale } = usePortfolioUi();
  const src = cloudinaryOptimizedImageUrl(source, optimizedWidth);

  if (fill) {
    return (
      <Image
        alt={alt[locale]}
        className={className}
        fill
        loading={priority ? undefined : loading}
        priority={priority}
        sizes={sizes}
        src={src}
      />
    );
  }

  return (
    <Image
      alt={alt[locale]}
      className={className}
      height={height ?? optimizedWidth ?? 800}
      loading={priority ? undefined : loading}
      priority={priority}
      sizes={sizes}
      src={src}
      width={width ?? optimizedWidth ?? 800}
    />
  );
}
