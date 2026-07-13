import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(Boolean(src));

  useEffect(() => {
    setDisplaySrc(src);
    setIsLoading(Boolean(src));
  }, [src]);

  return (
    <div className={cn('relative', className)}>
      <img
        {...props}
        src={displaySrc}
        className={cn(className, 'h-full w-full transition-opacity duration-150', isLoading ? 'opacity-0' : 'opacity-100')}
        onLoad={(event) => {
          setIsLoading(false);
          onLoad?.(event);
        }}
        onError={(event) => {
          if (fallbackSrc && displaySrc !== fallbackSrc) {
            setDisplaySrc(fallbackSrc);
            setIsLoading(true);
            return;
          }

          setIsLoading(false);
          onError?.(event);
        }}
      />
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-slate-100 text-rose-500 dark:bg-slate-800 dark:text-rose-300"
          role="status"
          aria-label="Carregando imagem"
        >
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        </div>
      )}
    </div>
  );
});

CachedImage.displayName = 'CachedImage';

export default CachedImage;
