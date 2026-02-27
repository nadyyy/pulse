"use client";

import { useState } from "react";

import { resolveProductImageUrl } from "@/lib/product-images";
import { SmartImage } from "@/components/SmartImage";

type GalleryImage = {
  id: string;
  url: string;
  alt: string;
};

export function ProductGallery({
  images,
  productTitle,
}: {
  images: GalleryImage[];
  productTitle: string;
}) {
  const fallbackImage: GalleryImage = {
    id: "fallback-image",
    url: "/products/shoe-001.png",
    alt: `${productTitle} image`,
  };
  const galleryImages = images.length > 0 ? images : [fallbackImage];
  const resolvedGallerySources = galleryImages
    .map((image) => resolveProductImageUrl(image.url))
    .filter((value) => value.trim().length > 0);
  const [activeId, setActiveId] = useState<string | null>(images[0]?.id ?? null);
  const active =
    (activeId ? galleryImages.find((image) => image.id === activeId) : undefined) ??
    galleryImages[0];
  const activeSource = resolveProductImageUrl(active.url);
  const activeFallbackSources = [
    ...resolvedGallerySources.filter((source) => source !== activeSource),
    "/products/shoe-001.png",
  ];

  return (
    <div className="product-gallery-layout">
      <div className="gallery-thumbs">
        {galleryImages.map((image) => {
          const thumbSource = resolveProductImageUrl(image.url);
          const thumbFallbackSources = [
            ...resolvedGallerySources.filter((source) => source !== thumbSource),
            "/products/shoe-001.png",
          ];

          return (
            <button
              key={image.id}
              type="button"
              className={active.id === image.id ? "thumb thumb-active" : "thumb"}
              onClick={() => setActiveId(image.id)}
            >
              <SmartImage
                src={thumbSource}
                alt={image.alt}
                width={120}
                height={120}
                className="gallery-thumb-image"
                fallbackSources={thumbFallbackSources}
              />
            </button>
          );
        })}
      </div>
      <div className="gallery-main">
        <div className="zoom-wrap">
          <SmartImage
            src={activeSource}
            alt={active.alt}
            width={980}
            height={980}
            className="zoom-image"
            priority
            fallbackSources={activeFallbackSources}
          />
        </div>
      </div>
    </div>
  );
}
