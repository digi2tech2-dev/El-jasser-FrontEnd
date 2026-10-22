import { Capacitor } from '@capacitor/core';
import { resolveImageUrl } from './imageUrl';

const queued = new Set();
const pending = [];
let active = 0;
let scheduled = false;

const loadNext = () => {
  while (active < 2 && pending.length > 0) {
    const url = pending.shift();
    active += 1;
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = 'low';
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      active -= 1;
      loadNext();
    };
    const timeout = window.setTimeout(done, 12000);
    image.onload = done;
    image.onerror = done;
    image.src = url;
  }
};

export const warmProductImages = (products) => {
  if (!Capacitor.isNativePlatform() || typeof window === 'undefined' || !Array.isArray(products)) return;
  if (navigator.connection?.saveData || /(?:^|-)2g|3g/.test(navigator.connection?.effectiveType || '') || document.visibilityState === 'hidden') return;

  for (const product of products.slice(0, 48)) {
    const url = resolveImageUrl(product?.image);
    if (!/^https?:\/\//i.test(url) || queued.has(url)) continue;
    queued.add(url);
    pending.push(url);
  }

  if (scheduled || pending.length === 0) return;
  scheduled = true;
  const start = () => {
    scheduled = false;
    loadNext();
  };
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 3500 });
  } else {
    window.setTimeout(start, 1500);
  }
};
