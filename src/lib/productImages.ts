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
const PRODUCT_KEY_RE = /^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:jpe?g|png|webp)$/i;
const PRODUCT_ASSET_ID_RE = /^[a-z0-9_-]+$/i;
const PREGENERATED_WIDTHS = [320, 640, 960, 1600];

type ProductImageDescriptor = {
  assetId?: string;
  fileName: string;
  masterWidth?: number;
  storageKey: string;
};

function getProductImageDescriptor(imageUrl: string): ProductImageDescriptor | null {
  try {
    const url = new URL(imageUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return null;

    const marker = SUPABASE_STORAGE_MARKERS.find((item) => url.pathname.includes(item));
    const publicPath = decodeURIComponent(marker
      ? url.pathname.split(marker)[1] || ''
      : url.pathname);
    const parts = publicPath.split('/').filter(Boolean);
    const productsIndex = parts.lastIndexOf('products');
    const storageParts = parts.slice(productsIndex + 1);
    const fileName = storageParts[storageParts.length - 1];
    const storageKey = storageParts.join('/');

    if (productsIndex < 0 || !storageParts.length) return null;
    if (!fileName || !PRODUCT_FILE_RE.test(fileName)) return null;
    if (!PRODUCT_KEY_RE.test(storageKey)) return null;

    const canonicalMatch = storageParts.length === 2
      ? /^(\d+)\.webp$/i.exec(fileName)
      : null;
    const assetId = canonicalMatch ? storageParts[0] : undefined;
    const masterWidth = canonicalMatch ? Number(canonicalMatch[1]) : undefined;

    if (assetId && !PRODUCT_ASSET_ID_RE.test(assetId)) return null;

    return {
      assetId,
      fileName,
      masterWidth,
      storageKey,
    };
  } catch {
    return null;
  }
}

function getProxyImageUrl(descriptor: ProductImageDescriptor, options: OptimizedImageOptions) {
  const params = new URLSearchParams();

  if (options.width) params.set('width', String(options.width));
  if (options.height) params.set('height', String(options.height));
  params.set('quality', String(options.quality ?? 72));
  params.set('format', options.format ?? 'webp');
  if (descriptor.storageKey !== descriptor.fileName) params.set('key', descriptor.storageKey);

  return `${IMAGE_PROXY_BASE_URL}/images/products/${encodeURIComponent(descriptor.fileName)}?${params.toString()}`;
}

function getCanonicalWidths(masterWidth: number) {
  return [
    ...PREGENERATED_WIDTHS.filter((width) => width < masterWidth),
    masterWidth,
  ];
}

function getCanonicalVariantWidth(masterWidth: number, requestedWidth?: number) {
  if (!requestedWidth) return masterWidth;
  const widths = getCanonicalWidths(masterWidth);
  return widths.find((width) => width >= requestedWidth) || masterWidth;
}

function getCanonicalVariantUrl(
  imageUrl: string,
  descriptor: ProductImageDescriptor,
  requestedWidth?: number
) {
  if (!descriptor.assetId || !descriptor.masterWidth) return imageUrl;

  const width = getCanonicalVariantWidth(descriptor.masterWidth, requestedWidth);
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split('/');
  const productsIndex = pathParts
    .map((part) => decodeURIComponent(part))
    .lastIndexOf('products');

  if (productsIndex < 0) return imageUrl;

  url.pathname = [
    ...pathParts.slice(0, productsIndex + 1),
    encodeURIComponent(descriptor.assetId),
    `${width}.webp`,
  ].join('/');
  url.search = '';
  return url.toString();
}

export function getOptimizedImageUrl(
  imageUrl?: string,
  options: OptimizedImageOptions = {}
) {
  if (!imageUrl) return '';

  if (options.proxy === false || options.format === 'origin') return imageUrl;

  const descriptor = getProductImageDescriptor(imageUrl);
  if (!descriptor) return imageUrl;

  if (descriptor.assetId && descriptor.masterWidth) {
    return getCanonicalVariantUrl(imageUrl, descriptor, options.width);
  }

  return getProxyImageUrl(descriptor, options);
}

export function getProductImageSrcSet(
  imageUrl?: string,
  widths: number[] = [320, 480, 640, 960]
) {
  if (!imageUrl) return undefined;
  const descriptor = getProductImageDescriptor(imageUrl);
  if (!descriptor) return undefined;

  if (descriptor.assetId && descriptor.masterWidth) {
    const candidates = new Map<number, string>();

    widths.forEach((requestedWidth) => {
      const width = getCanonicalVariantWidth(descriptor.masterWidth as number, requestedWidth);
      candidates.set(width, getCanonicalVariantUrl(imageUrl, descriptor, width));
    });

    return [...candidates.entries()]
      .sort(([a], [b]) => a - b)
      .map(([width, url]) => `${url} ${width}w`)
      .join(', ');
  }

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
