type OptimizedImageOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
  format?: 'origin' | 'webp';
};

export function getOptimizedImageUrl(
  imageUrl?: string,
  _options: OptimizedImageOptions = {}
) {
  if (!imageUrl) return '';

  return imageUrl;
}

export function getProductImageSrcSet(
  imageUrl?: string,
  widths: number[] = [320, 480, 640, 960]
) {
  void widths;
  return undefined;
}
