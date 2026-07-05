import React, { useEffect, useState } from 'react';

import { isImagePreloaded, preloadImage } from '@/lib/imagePreloadCache';
import { cn } from '@/lib/utils';

type CachedImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string;
  fallbackSrc?: string;
};

const CachedImage = React.memo(({
  src = '',
  fallbackSrc,
  className,
  onError,
  onLoad,
  ...props
}: CachedImageProps) => {
  const [displaySrc, setDisplaySrc] = useState(src);
  const [isReady, setIsReady] = useState(() => isImagePreloaded(src));

  useEffect(() => {
    let active = true;

    setDisplaySrc(src);

    if (!src) {
      setIsReady(true);
      return () => {
        active = false;
      };
    }

    if (isImagePreloaded(src)) {
      setIsReady(true);
      return () => {
        active = false;
      };
    }

    setIsReady(false);

    preloadImage(src)
      .then(() => {
        if (active) setIsReady(true);
      })
      .catch(() => {
        if (!active) return;

        if (fallbackSrc && fallbackSrc !== src) {
          setDisplaySrc(fallbackSrc);
          preloadImage(fallbackSrc)
            .catch(() => undefined)
            .finally(() => {
              if (active) setIsReady(true);
            });
          return;
        }

        setIsReady(true);
      });

    return () => {
      active = false;
    };
  }, [fallbackSrc, src]);

  return (
    <img
      {...props}
      src={displaySrc}
      className={cn(
        className,
        'transition-opacity duration-150',
        isReady ? 'opacity-100' : 'opacity-0'
      )}
      onLoad={(event) => {
        const loadedSrc = event.currentTarget.currentSrc || displaySrc;
        void preloadImage(loadedSrc).finally(() => setIsReady(true));
        onLoad?.(event);
      }}
      onError={(event) => {
        if (fallbackSrc && displaySrc !== fallbackSrc) {
          setDisplaySrc(fallbackSrc);
          return;
        }

        setIsReady(true);
        onError?.(event);
      }}
    />
  );
});

CachedImage.displayName = 'CachedImage';

export default CachedImage;
