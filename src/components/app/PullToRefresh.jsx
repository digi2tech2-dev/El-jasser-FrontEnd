import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { isNativeApp } from '../../utils/platform';
import './PullToRefresh.css';

const REFRESH_THRESHOLD = 82;

const documentScrollTop = () => Math.max(
  window.scrollY || 0,
  document.documentElement.scrollTop || 0,
  document.body.scrollTop || 0,
);

const isAtTopOfScrollArea = (target) => {
  let element = target instanceof Element ? target : null;
  while (element && element !== document.body && element !== document.documentElement) {
    const style = window.getComputedStyle(element);
    const isScrollable = /(auto|scroll|overlay)/.test(style.overflowY)
      && element.scrollHeight > element.clientHeight + 2;
    if (isScrollable) return element.scrollTop <= 0 && documentScrollTop() <= 0;
    element = element.parentElement;
  }
  return documentScrollTop() <= 0;
};

const PullToRefresh = () => {
  const isNative = isNativeApp();
  const { dir } = useLanguage();
  const startY = useRef(null);
  const pullDistanceRef = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isNative) return undefined;
    const updatePullDistance = (distance) => {
      pullDistanceRef.current = distance;
      setPullDistance(distance);
    };
    const resetGesture = () => {
      startY.current = null;
      updatePullDistance(0);
    };
    const onTouchStart = (event) => {
      if (event.touches.length !== 1) return resetGesture();
      const target = event.target;
      if (target instanceof Element && (
        target.closest('[role="dialog"]')
        || target.closest('input, textarea, select, [contenteditable="true"]')
      )) return resetGesture();
      if (isAtTopOfScrollArea(target)) startY.current = event.touches[0].clientY;
    };
    const onTouchMove = (event) => {
      if (startY.current == null || event.touches.length !== 1) return;
      const delta = event.touches[0].clientY - startY.current;
      if (delta <= 0) return updatePullDistance(0);
      if (!isAtTopOfScrollArea(event.target)) return resetGesture();
      if (delta >= 8) event.preventDefault();
      updatePullDistance(Math.min(delta * 0.62, REFRESH_THRESHOLD + 24));
    };
    const onTouchEnd = () => {
      if (pullDistanceRef.current >= REFRESH_THRESHOLD) {
        setIsRefreshing(true);
        window.setTimeout(() => window.location.reload(), 180);
      }
      resetGesture();
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('touchcancel', resetGesture, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', resetGesture);
    };
  }, [isNative]);

  if (!isNative || (!pullDistance && !isRefreshing)) return null;
  const ready = pullDistance >= REFRESH_THRESHOLD;
  return (
    <div
      className={'pull-to-refresh-indicator' + (isRefreshing ? ' is-refreshing' : '')}
      dir={dir}
      style={{ transform: 'translate(-50%, ' + Math.min(pullDistance, REFRESH_THRESHOLD) + 'px)' }}
      role="status"
      aria-live="polite"
    >
      <span className="pull-to-refresh-spinner" aria-hidden="true" />
      <span>{isRefreshing ? (dir === 'rtl' ? '\u062c\u0627\u0631\u064d \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0635\u0641\u062d\u0629' : 'Refreshing…') : ready ? (dir === 'rtl' ? '\u0627\u062a\u0631\u0643 \u0644\u0644\u062a\u062d\u062f\u064a\u062b' : 'Release to refresh') : (dir === 'rtl' ? '\u0627\u0633\u062d\u0628 \u0644\u0623\u0633\u0641\u0644 \u0644\u0644\u062a\u062d\u062f\u064a\u062b' : 'Pull down to refresh')}</span>
    </div>
  );
};

export default PullToRefresh;
