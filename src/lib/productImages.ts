import type React from 'react';

type OptimizedImageOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
  format?: 'origin' | 'webp';
  proxy?: boolean;
};

const API_BASE_URL = (import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');
const IMAGE_PROXY_BASE_URL = (import.meta.env.VITE_REACT_APP_IMAGE_PROXY_URL || API_BASE_URL).replace(/\/+$/, '');
const SUPABASE_STORAGE_MARKERS = [
  '/storage/v1/object/public/',
  '/storage/v1/render/image/public/',
];
const PRODUCT_FILE_RE = /^[a-z0-9_-]+\.(?:jpe?g|png|webp)$/i;

function getProductFileName(imageUrl: string) {
  try {
    const url = new URL(imageUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return null;

    const marker = SUPABASE_STORAGE_MARKERS.find((item) => url.pathname.includes(item));
    const publicPath = decodeURIComponent(marker
      ? url.pathname.split(marker)[1] || ''
      : url.pathname);
    const parts = publicPath.split('/').filter(Boolean);
    const fileName = parts[parts.length - 1];
    const productsIndex = parts.lastIndexOf('products');

    // Product uploads use /products/<uuid>.<ext> on both Supabase and R2.
    // Keeping this check strict prevents arbitrary remote images from being proxied.
    if (productsIndex < 0 || productsIndex !== parts.length - 2) return null;
    if (!fileName || !PRODUCT_FILE_RE.test(fileName)) return null;
    return fileName;
  } catch {
    return null;
  }
}

function getProxyImageUrl(fileName: string, options: OptimizedImageOptions) {
  const params = new URLSearchParams();

  if (options.width) params.set('width', String(options.width));
  if (options.height) params.set('height', String(options.height));
  params.set('quality', String(options.quality ?? 72));
  params.set('format', options.format ?? 'webp');

  return `${IMAGE_PROXY_BASE_URL}/images/products/${encodeURIComponent(fileName)}?${params.toString()}`;
}

export function getOptimizedImageUrl(
  imageUrl?: string,
  options: OptimizedImageOptions = {}
) {
  if (!imageUrl) return '';

  if (options.proxy === false || options.format === 'origin') return imageUrl;

  const fileName = getProductFileName(imageUrl);
  if (!fileName) return imageUrl;

  return getProxyImageUrl(fileName, options);
}

export function getProductImageSrcSet(
  imageUrl?: string,
  widths: number[] = [320, 480, 640, 960]
) {
  if (!imageUrl || !getProductFileName(imageUrl)) return undefined;

  return widths
    .map((width) => `${getOptimizedImageUrl(imageUrl, { width, quality: 70 })} ${width}w`)
    .join(', ');
}

export function fallbackToOriginalImage(
  event: React.SyntheticEvent<HTMLImageElement>,
  originalUrl?: string
) {
  const image = event.currentTarget;
  if (!originalUrl || image.dataset.fallback === 'true') return;

  image.dataset.fallback = 'true';
  image.removeAttribute('srcset');
  image.removeAttribute('sizes');
  image.srcset = '';
  image.src = originalUrl;
}
