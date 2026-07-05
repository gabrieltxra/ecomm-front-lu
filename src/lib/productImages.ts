import type React from 'react';

type OptimizedImageOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
  format?: 'origin' | 'webp';
};

function getSupabaseRenderUrl(imageUrl: string, options: OptimizedImageOptions) {
  if (!imageUrl.includes('/storage/v1/object/public/')) return imageUrl;

  const renderUrl = imageUrl.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
  const url = new URL(renderUrl);

  if (options.width) url.searchParams.set('width', String(options.width));
  if (options.height) url.searchParams.set('height', String(options.height));
  url.searchParams.set('quality', String(options.quality ?? 72));
  url.searchParams.set('resize', options.resize ?? 'cover');

  if (options.format !== 'origin') {
    url.searchParams.set('format', options.format ?? 'webp');
  }

  return url.toString();
}

export function getOptimizedImageUrl(
  imageUrl?: string,
  options: OptimizedImageOptions = {}
) {
  if (!imageUrl) return '';

  try {
    return getSupabaseRenderUrl(imageUrl, options);
  } catch {
    return imageUrl;
  }
}

export function getProductImageSrcSet(
  imageUrl?: string,
  widths: number[] = [320, 480, 640, 960]
) {
  if (!imageUrl || !imageUrl.includes('/storage/v1/object/public/')) return undefined;

  return widths
    .map((width) => `${getOptimizedImageUrl(imageUrl, { width, quality: 70 })} ${width}w`)
    .join(', ');
}

export function fallbackToOriginalImage(
  event: React.SyntheticEvent<HTMLImageElement>,
  originalUrl?: string
) {
  if (!originalUrl || event.currentTarget.dataset.fallback === 'true') return;

  event.currentTarget.dataset.fallback = 'true';
  event.currentTarget.srcset = '';
  event.currentTarget.src = originalUrl;
}
