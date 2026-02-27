"use client";

import Image, { type ImageProps } from "next/image";
import { useMemo, useState } from "react";

type SmartImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSources?: string[];
};

export function SmartImage({ src, fallbackSources = [], alt, ...props }: SmartImageProps) {
  const allSources = useMemo(() => {
    const cleaned = [src, ...fallbackSources].filter((value) => value.trim().length > 0);
    return cleaned.length > 0 ? cleaned : ["/products/shoe-001.png"];
  }, [src, fallbackSources]);
  const [sourceIndex, setSourceIndex] = useState(0);

  function handleError() {
    setSourceIndex((current) => {
      if (current + 1 < allSources.length) {
        return current + 1;
      }
      return current;
    });
  }

  return <Image {...props} src={allSources[sourceIndex]} alt={alt} onError={handleError} />;
}
