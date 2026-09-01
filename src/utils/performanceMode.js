const readAndroidMajorVersion = (userAgent = '') => {
  const match = String(userAgent).match(/Android\s+(\d+)/i);
  return match ? Number(match[1]) : null;
};

export const detectLitePerformanceMode = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent || '';
  const isAndroid = /Android/i.test(userAgent);
  const androidMajorVersion = readAndroidMajorVersion(userAgent);
  const isCompactViewport = window.matchMedia?.('(max-width: 767px)').matches ?? false;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const memory = Number(navigator.deviceMemory || 0);
  const cpuCores = Number(navigator.hardwareConcurrency || 0);
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const effectiveType = String(connection?.effectiveType || '').toLowerCase();
  const constrainedConnection = Boolean(connection?.saveData)
    || effectiveType === 'slow-2g'
    || effectiveType === '2g';
  const constrainedMemory = memory > 0 && memory <= 4;
  const constrainedCpu = cpuCores > 0 && cpuCores <= 4;
  const legacyAndroid = isAndroid
    && Number.isFinite(androidMajorVersion)
    && androidMajorVersion <= 10;

  // Small screens benefit from the lighter visual path even on newer phones:
  // large backdrops, filters, and animated shadows are disproportionately
  // expensive on mobile GPUs and make scrolling feel sluggish.
  return reducedMotion
    || constrainedConnection
    || isCompactViewport
    || legacyAndroid
    || constrainedMemory
    || constrainedCpu;
};

export const applyPerformanceMode = () => {
  if (typeof document === 'undefined') return false;
  const enabled = detectLitePerformanceMode();
  document.documentElement.classList.toggle('performance-lite', enabled);
  document.documentElement.dataset.performanceMode = enabled ? 'lite' : 'full';
  return enabled;
};

export const isLitePerformanceMode = () => (
  typeof document !== 'undefined'
  && document.documentElement.classList.contains('performance-lite')
);
