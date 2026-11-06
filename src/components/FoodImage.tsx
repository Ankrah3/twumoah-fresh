'use client';

import * as React from 'react';

import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

export function FoodImage({ src, alt, priority, className }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={failed ? '/assets/food-fallback.svg' : src}
      alt={
        failed ? `${alt}. Photograph unavailable; illustrated place setting shown.` : alt
      }
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      width={1440}
      height={960}
      onError={() => setFailed(true)}
    />
  );
}
