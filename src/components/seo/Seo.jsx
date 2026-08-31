import { useEffect } from 'react';

const DEFAULT_SOCIAL_IMAGE = '/dra90n-og.png?v=dra90n-store';

const upsertMeta = (selector, createAttributes, valueAttribute, value) => {
  if (typeof document === 'undefined' || !value) return;

  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(createAttributes).forEach(([key, attributeValue]) => {
      element.setAttribute(key, attributeValue);
    });
    element.setAttribute('data-seo-managed', 'true');
    document.head.appendChild(element);
  }

  element.setAttribute(valueAttribute, value);
};

const upsertLink = (rel, href) => {
  if (typeof document === 'undefined' || !href) return;

  let element = document.head.querySelector(`link[rel="${rel}"][data-seo-managed="true"]`)
    || document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    element.setAttribute('data-seo-managed', 'true');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
};

const removeManagedJsonLd = () => {
  if (typeof document === 'undefined') return;
  document.head
    .querySelectorAll('script[type="application/ld+json"][data-seo-managed="true"]')
    .forEach((element) => element.remove());
};

const Seo = ({
  title,
  description,
  keywords,
  canonicalUrl,
  image,
  language = 'ar',
  jsonLd = [],
}) => {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const safeTitle = title || 'Dra90n STORE';
    const socialImage = image || DEFAULT_SOCIAL_IMAGE;
    document.title = safeTitle;
    document.documentElement.lang = language === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

    upsertMeta('meta[name="description"]', { name: 'description' }, 'content', description);
    upsertMeta('meta[name="keywords"]', { name: 'keywords' }, 'content', keywords);
    upsertMeta('meta[name="robots"]', { name: 'robots' }, 'content', 'index, follow, max-image-preview:large');
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, 'content', safeTitle);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, 'content', description);
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, 'content', 'Dra90n STORE');
    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, 'content', 'website');
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale' }, 'content', language === 'ar' ? 'ar_EG' : 'en_US');
    upsertMeta('meta[property="og:locale:alternate"]', { property: 'og:locale:alternate' }, 'content', language === 'ar' ? 'en_US' : 'ar_EG');
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'content', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, 'content', safeTitle);
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, 'content', description);

    if (canonicalUrl) {
      upsertLink('canonical', canonicalUrl);
      upsertMeta('meta[property="og:url"]', { property: 'og:url' }, 'content', canonicalUrl);
    }

    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, 'content', socialImage);
    upsertMeta('meta[property="og:image:type"]', { property: 'og:image:type' }, 'content', 'image/png');
    upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width' }, 'content', '1240');
    upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height' }, 'content', '1268');
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt' }, 'content', 'شعار Dra90n STORE لشحن الألعاب والتطبيقات');
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, 'content', socialImage);
    upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt' }, 'content', 'شعار Dra90n STORE لشحن الألعاب والتطبيقات');

    removeManagedJsonLd();
    (Array.isArray(jsonLd) ? jsonLd : []).filter(Boolean).forEach((item) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-managed', 'true');
      script.textContent = JSON.stringify(item);
      document.head.appendChild(script);
    });

    return undefined;
  }, [canonicalUrl, description, image, jsonLd, keywords, language, title]);

  return null;
};

export default Seo;
