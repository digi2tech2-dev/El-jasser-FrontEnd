import React from 'react';

// Soft scallops on both edges stay inside the existing content padding.
// Normalized coordinates keep the outline responsive without resizing the drawer.
const contour = 'M.025 .022 C.14 .004 .26 .004 .38 .014 C.53 .03 .61 .005 .78 .011 C.90 .018 .96 .004 .978 .012 C.995 .027 .995 .045 .985 .06 C.965 0.078 .965 0.097 .985 0.115 C1 0.133 1 0.152 .985 0.17 C.965 0.188 .965 0.207 .985 0.225 C1 0.243 1 0.262 .985 0.28 C.965 0.298 .965 0.317 .985 0.335 C1 0.353 1 0.372 .985 0.39 C.965 0.408 .965 0.427 .985 0.445 C1 0.463 1 0.482 .985 0.5 C.965 0.518 .965 0.537 .985 0.555 C1 0.573 1 0.592 .985 0.61 C.965 0.628 .965 0.647 .985 0.665 C1 0.683 1 0.702 .985 0.72 C.965 0.738 .965 0.757 .985 0.775 C1 0.793 1 0.812 .985 0.83 C.965 0.848 .965 0.867 .985 0.885 C1 0.903 1 0.922 .985 0.94 C.99 .96 .994 .982 .975 .989 C.85 1 .78 .984 .64 .99 C.47 1 .34 .983 .17 .991 C.08 .998 .017 1 .015 .94 C.035 0.922 .035 0.903 .015 0.885 C0 0.867 0 0.848 .015 0.83 C.035 0.812 .035 0.793 .015 0.775 C0 0.757 0 0.738 .015 0.72 C.035 0.702 .035 0.683 .015 0.665 C0 0.647 0 0.628 .015 0.61 C.035 0.592 .035 0.573 .015 0.555 C0 0.537 0 0.518 .015 0.5 C.035 0.482 .035 0.463 .015 0.445 C0 0.427 0 0.408 .015 0.39 C.035 0.372 .035 0.353 .015 0.335 C0 0.317 0 0.298 .015 0.28 C.035 0.262 .035 0.243 .015 0.225 C0 0.207 0 0.188 .015 0.17 C.035 0.152 .035 0.133 .015 0.115 C0 0.097 0 0.078 .015 0.06 C.005 .035 .006 .017 .025 .022 Z';

// Shallower purchase edges leave all form controls inside the original padding.
let coordinateIndex = 0;
const purchaseContour = contour.replace(/\d*\.?\d+/g, (coordinate) => {
  const value = Number(coordinate);
  const isX = coordinateIndex++ % 2 === 0;
  const depth = isX ? 0.25 : 0.5;
  return String(value < 0.1 ? value * depth : value > 0.9 ? 1 - (1 - value) * depth : value);
});

const SidebarWave = ({ id, variant = 'sidebar' }) => {
  const isPurchase = variant === 'purchase';
  const outline = isPurchase ? purchaseContour : contour;
  return (
  <svg
    className={isPurchase ? 'purchase-dialog-royal-outline' : 'sidebar-wave-outline'}
    viewBox="0 0 1 1"
    preserveAspectRatio="none"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <clipPath id={id} clipPathUnits="objectBoundingBox">
        <path d={outline} />
      </clipPath>
      {isPurchase ? (
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff0bb" />
          <stop offset="24%" stopColor="#d9ad56" />
          <stop offset="52%" stopColor="#a36b1b" />
          <stop offset="78%" stopColor="#f5db98" />
          <stop offset="100%" stopColor="#d9ad56" />
        </linearGradient>
      ) : null}
    </defs>
    <path d={outline} fill="none" stroke={isPurchase ? `url(#${id}-gold)` : 'var(--brand-gold)'} strokeWidth={isPurchase ? 3 : 1.5} vectorEffect="non-scaling-stroke" />
  </svg>
  );
};

export default SidebarWave;
