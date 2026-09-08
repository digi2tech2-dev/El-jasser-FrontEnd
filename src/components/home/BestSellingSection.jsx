import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageUrl';

const getImageValue = (value) => {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';

  return String(value.url || value.path || value.src || value.preview || value.location || '').trim();
};

const getProductImageCandidates = (product = {}, categoryImage = '') => {
  const candidates = [
    product.image,
    product.imageUrl,
    product.productImage,
    product.productImageUrl,
    product.thumbnail,
    product.thumbnailUrl,
    product.coverImage,
    product.photo,
    product.logo,
    product.icon,
    product.images?.[0],
    product.media?.image,
    product.providerProduct?.image,
    product.providerProduct?.imageUrl,
    product.rawPayload?.image,
    product.rawPayload?.imageUrl,
    categoryImage,
  ]
    .map(getImageValue)
    .filter(Boolean)
    .map(resolveImageUrl);

  return [...new Set(candidates)];
};

const ProductArtwork = ({ product, categoryImage, isUnavailable }) => {
  const candidates = useMemo(() => getProductImageCandidates(product, categoryImage), [categoryImage, product]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [product?.id]);

  const imageSrc = candidates[candidateIndex];

  if (!imageSrc) {
    return (
      <span className="grid h-full w-full place-items-center text-[var(--color-primary)]" aria-hidden="true">
        <ShoppingBag className="h-8 w-8 opacity-55" strokeWidth={1.6} />
      </span>
    );
  }

  return (
    <img
      src={imageSrc}
      alt=""
      aria-hidden="true"
      className={`h-full w-full object-contain p-2.5 ${isUnavailable ? 'opacity-45 grayscale' : ''}`}
      loading="lazy"
      decoding="async"
      onError={() => setCandidateIndex((current) => current + 1)}
    />
  );
};

const BestSellingSection = ({
  id,
  title,
  viewAllLabel,
  products,
  categories = [],
  language = 'ar',
  onViewAll,
  onProductSelect,
  disableUnavailable = false,
}) => {
  const isArabic = language === 'ar';
  const DirectionIcon = isArabic ? ChevronLeft : ChevronRight;
  const categoryImages = useMemo(() => new Map(
    categories.map((category) => [String(category?.id || category?._id || ''), category?.image || ''])
  ), [categories]);

  return (
    <section
      className="best-selling-section mx-auto w-full max-w-5xl"
      aria-labelledby={id}
    >
      <div className="best-selling-heading">
        <div className="best-selling-heading-title">
          <span className="best-selling-heading-icon" aria-hidden="true">
            <ShoppingBag className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <div>
            <span className="best-selling-kicker">{isArabic ? 'مختارات الجاسر كارد' : 'El-Jasser picks'}</span>
            <h2 id={id} className="best-selling-title">
            {title}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="best-selling-view-all"
        >
          <span>{viewAllLabel}</span>
          <DirectionIcon className="h-3.5 w-3.5" strokeWidth={2.3} aria-hidden="true" />
        </button>
      </div>

      <div
        className="best-selling-list scrollbar-hide flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {products.map((product) => {
          const productName = product.displayName || product.nameAr || product.name || '';
          const categoryImage = categoryImages.get(String(product.category || '')) || '';
          const isUnavailable = product.storefrontStatus?.isPurchasable === false;
          const unavailableLabel = product.storefrontStatus?.badgeLabel || (isArabic ? 'غير متاح' : 'Unavailable');
          const statusLabel = isUnavailable ? unavailableLabel : (isArabic ? 'متوفر' : 'Available');
          const isDisabled = disableUnavailable && isUnavailable;

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                if (!isDisabled) onProductSelect(product);
              }}
              disabled={isDisabled}
              className={`best-selling-product group snap-start text-start ${isDisabled ? 'best-selling-product--disabled cursor-not-allowed' : ''}`}
              aria-label={productName}
            >
              <span className="best-selling-product-media">
                <ProductArtwork product={product} categoryImage={categoryImage} isUnavailable={isUnavailable} />
                <span className={`best-selling-status ${isUnavailable ? 'best-selling-status--unavailable' : ''}`}>
                  <span className="best-selling-status-dot" aria-hidden="true" />
                  {statusLabel}
                </span>
              </span>

              <span className="best-selling-product-content">
                <span className="best-selling-product-name">
                  {productName}
                </span>
                <span className="best-selling-product-arrow" aria-hidden="true">
                  <DirectionIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default BestSellingSection;
