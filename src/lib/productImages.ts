type ImageFormat = 'origin' | 'webp';

type OptimizedImageOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
  format?: ImageFormat;
};

const SUPABASE_PUBLIC_OBJECT_PATH = '/storage/v1/object/public/';
const SUPABASE_PUBLIC_RENDER_PATH = '/storage/v1/render/image/public/';

export function getOptimizedImageUrl(
  imageUrl?: string,
  options: OptimizedImageOptions = {}
) {
  if (!imageUrl) return '';

  const {
    width,
    height,
    quality = 75,
    resize = 'cover',
    format = 'webp',
  } = options;

  try {
    const url = new URL(imageUrl);
    if (!url.pathname.includes(SUPABASE_PUBLIC_OBJECT_PATH)) {
      return imageUrl;
    }

    url.pathname = url.pathname.replace(
      SUPABASE_PUBLIC_OBJECT_PATH,
      SUPABASE_PUBLIC_RENDER_PATH
    );

    if (width) url.searchParams.set('width', String(width));
    if (height) url.searchParams.set('height', String(height));
    url.searchParams.set('quality', String(quality));
    url.searchParams.set('resize', resize);
    url.searchParams.set('format', format);

    return url.toString();
  } catch {
    return imageUrl;
  }
}

export function getProductImageSrcSet(
  imageUrl?: string,
  widths: number[] = [320, 480, 640, 960]
) {
  if (!imageUrl) return undefined;

  return widths
    .map((width) => `${getOptimizedImageUrl(imageUrl, { width })} ${width}w`)
    .join(', ');
}
