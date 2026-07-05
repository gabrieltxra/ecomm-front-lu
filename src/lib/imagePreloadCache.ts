const decodedImages = new Map<string, HTMLImageElement>();
const pendingImages = new Map<string, Promise<void>>();

function canPreloadImages() {
  return typeof window !== 'undefined' && typeof Image !== 'undefined';
}

export function preloadImage(src?: string) {
  if (!src || decodedImages.has(src)) return Promise.resolve();
  if (pendingImages.has(src)) return pendingImages.get(src) as Promise<void>;
  if (!canPreloadImages()) return Promise.resolve();

  const image = new Image();
  image.decoding = 'async';

  const promise = new Promise<void>((resolve, reject) => {
    image.onload = () => {
      const decode = image.decode ? image.decode() : Promise.resolve();

      decode
        .catch(() => undefined)
        .then(() => {
          decodedImages.set(src, image);
          resolve();
        });
    };

    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  }).finally(() => {
    pendingImages.delete(src);
  });

  pendingImages.set(src, promise);
  return promise;
}

export function isImagePreloaded(src?: string) {
  return Boolean(src && decodedImages.has(src));
}
