import { useEffect, type RefObject } from 'react';

import { preloadImage } from '@/lib/imagePreloadCache';
import { getOptimizedImageUrl } from '@/lib/productImages';
import type { Product } from '@/types/Product';

type NetworkInformation = {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
};

const CARD_WIDTHS = [320, 480, 640];

function getLoadingPlan() {
  const connection = (navigator as NavigatorWithConnection).connection;
  const effectiveType = connection?.effectiveType || '';

  if (connection?.saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
    return null;
  }

  const viewportWidth = window.innerWidth;
  const columns = viewportWidth < 640 ? 1 : viewportWidth < 1024 ? 2 : viewportWidth < 1280 ? 3 : 4;
  const batchSize = effectiveType === '3g' ? 2 : viewportWidth < 640 ? 3 : viewportWidth < 1024 ? 4 : 6;
  const horizontalSpace = 32 + Math.max(0, columns - 1) * 24;
  const renderedCardWidth = Math.max(160, (viewportWidth - horizontalSpace) / columns);
  const requiredWidth = renderedCardWidth * Math.min(window.devicePixelRatio || 1, 2);
  const imageWidth = CARD_WIDTHS.find((width) => width >= requiredWidth) || CARD_WIDTHS[CARD_WIDTHS.length - 1];

  return {
    batchSize,
    imageWidth,
    rootMargin: effectiveType === '3g' ? '300px 0px' : viewportWidth < 640 ? '600px 0px' : '900px 0px',
  };
}

export function useProgressiveImagePreload(
  gridRef: RefObject<HTMLDivElement>,
  products: Product[]
) {
  useEffect(() => {
    const grid = gridRef.current;
    const plan = getLoadingPlan();

    if (!grid || !plan || typeof IntersectionObserver === 'undefined') return;

    let cancelled = false;
    const scheduledBatches = new Set<number>();
    const idleCallbacks = new Set<number>();
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const preloadBatch = async (startIndex: number) => {
      const urls = products
        .slice(startIndex, startIndex + plan.batchSize)
        .map((product) => product.image_urls?.[0])
        .filter((url): url is string => Boolean(url))
        .map((url) => ({
          original: url,
          optimized: getOptimizedImageUrl(url, { width: plan.imageWidth, quality: 70 }),
        }))
        // Never batch-preload a heavy original when its storage path is unknown.
        .filter(({ original, optimized }) => optimized !== original)
        .map(({ optimized }) => optimized);

      // Two concurrent decodes keep the next cards ready without saturating mobile networks.
      for (let index = 0; index < urls.length && !cancelled; index += 2) {
        await Promise.allSettled(
          urls.slice(index, index + 2).map((url) => preloadImage(url))
        );
      }
    };

    const scheduleBatch = (startIndex: number) => {
      if (scheduledBatches.has(startIndex)) return;
      scheduledBatches.add(startIndex);

      const run = () => {
        if (!cancelled && document.visibilityState === 'visible') {
          void preloadBatch(startIndex);
        }
      };

      if ('requestIdleCallback' in window) {
        const callbackId = window.requestIdleCallback(run, { timeout: 800 });
        idleCallbacks.add(callbackId);
      } else {
        const timerId = setTimeout(run, 100);
        timers.add(timerId);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const startIndex = Number((entry.target as HTMLElement).dataset.imageBatchStart);
        if (Number.isInteger(startIndex)) scheduleBatch(startIndex);
        observer.unobserve(entry.target);
      }
    }, {
      rootMargin: plan.rootMargin,
      threshold: 0.01,
    });

    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-product-image-index]'));
    cards.forEach((card, index) => {
      if (index % plan.batchSize !== 0) return;
      card.dataset.imageBatchStart = String(index);
      observer.observe(card);
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      idleCallbacks.forEach((callbackId) => window.cancelIdleCallback(callbackId));
      timers.forEach((timerId) => clearTimeout(timerId));
    };
  }, [gridRef, products]);
}
