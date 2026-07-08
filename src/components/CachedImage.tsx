import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

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

  if (!isReady) {
    return (
      <div
        className={cn(
          className,
          'flex items-center justify-center bg-slate-100 text-rose-500 dark:bg-slate-800 dark:text-rose-300'
        )}
        role="status"
        aria-label="Carregando imagem"
      >
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      {...props}
      src={displaySrc}
      className={cn(className, 'transition-opacity duration-150 opacity-100')}
      onLoad={onLoad}
      onError={(event) => {
        if (fallbackSrc && displaySrc !== fallbackSrc) {
          setDisplaySrc(fallbackSrc);
          setIsReady(false);
          preloadImage(fallbackSrc)
            .catch(() => undefined)
            .finally(() => setIsReady(true));
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
