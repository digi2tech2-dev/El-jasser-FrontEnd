import React, { useEffect, useMemo, useState } from 'react';
import { History, SearchX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useMediaStore from '../store/useMediaStore';
import useGroupStore from '../store/useGroupStore';
import ProductSearchBar from '../components/products/ProductSearchBar';
import ProductPurchaseDialog from '../components/products/ProductPurchaseDialog';
import LoadingSkeleton from '../components/products/LoadingSkeleton';
import { createStorefrontProducts, getStorefrontLanguage } from '../utils/storefront';
import { resolveImageUrl } from '../utils/imageUrl';

const RECENT_SEARCHES_KEY = 'ka-card:recent-product-searches:v1';
const MAX_RECENT_PRODUCTS = 8;

const readRecentProducts = () => {
  try {
    const value = JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
    if (!Array.isArray(value)) return [];

    return value.map((item) => {
      if (typeof item === 'string') {
        return { id: item, name: '', image: '' };
      }

      return {
        id: String(item?.id || ''),
        name: String(item?.name || ''),
        image: String(item?.image || ''),
      };
    }).filter((item) => item.id).slice(0, MAX_RECENT_PRODUCTS);
  } catch {
    return [];
  }
};

const ProductSearch = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const products = useMediaStore((state) => state.products);
  const isLoading = useMediaStore((state) => state.isLoading);
  const loadProducts = useMediaStore((state) => state.loadProducts);
  const groupsLastLoadedAt = useGroupStore((state) => state.groupsLastLoadedAt);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recentProductEntries, setRecentProductEntries] = useState(readRecentProducts);
  const [showAllRecentProducts, setShowAllRecentProducts] = useState(false);

  const language = getStorefrontLanguage(i18n);
  const isArabic = language === 'ar';

  useEffect(() => {
    void loadProducts({ force: true, bypassCache: true });
  }, [loadProducts]);

  useEffect(() => {
    const focusTimer = window.setTimeout(() => {
      document.getElementById('search-input')?.focus();
    }, 180);
    return () => window.clearTimeout(focusTimer);
  }, []);

  const storefrontProducts = useMemo(
    () => createStorefrontProducts(products, {
      language,
      userGroup: user?.groupId || user?.group || 'Normal',
      userGroupPercentage: user?.groupPercentage ?? null,
    }),
    [groupsLastLoadedAt, language, products, user?.group, user?.groupId, user?.groupPercentage]
  );

  const recentProducts = useMemo(() => {
    const byId = new Map(storefrontProducts.map((product) => [String(product.id), product]));
    return recentProductEntries.map((entry) => {
      const product = byId.get(entry.id);
      return {
        ...entry,
        product: product || null,
        name: product?.displayName || product?.nameAr || entry.name || (isArabic ? 'منتج غير متوفر' : 'Unavailable product'),
        image: product?.image || entry.image || '',
      };
    });
  }, [isArabic, recentProductEntries, storefrontProducts]);

  const rememberAndOpenProduct = (product) => {
    if (!product?.id) return;
    const productId = String(product.id);
    setRecentProductEntries((current) => {
      const entry = {
        id: productId,
        name: String(product.displayName || product.nameAr || product.name || ''),
        image: String(product.image || ''),
      };
      const next = [entry, ...current.filter((item) => item.id !== productId)].slice(0, MAX_RECENT_PRODUCTS);
      try {
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // The page remains usable when browser storage is unavailable.
      }
      return next;
    });
    setSelectedProduct(product);
  };

  const clearRecentProducts = () => {
    setRecentProductEntries([]);
    setShowAllRecentProducts(false);
    try {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Nothing else is required when storage is unavailable.
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-8 sm:space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-[color:rgb(var(--color-border-rgb)/0.7)] bg-[color:rgb(var(--color-card-rgb)/0.94)] px-4 py-5 shadow-[var(--shadow-medium)] backdrop-blur-xl sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_top,rgb(var(--color-primary-rgb)/0.18),transparent_68%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <ProductSearchBar
            products={storefrontProducts}
            language={language}
            onSelectProduct={rememberAndOpenProduct}
            placeholder={isArabic ? 'ابحث باسم المنتج...' : 'Search by product name...'}
            noResultsLabel={isArabic ? 'لا توجد منتجات مطابقة لبحثك' : 'No products match your search'}
            className="text-start"
            inputClassName="h-13 rounded-2xl border-[color:rgb(var(--color-primary-rgb)/0.28)] bg-[color:rgb(var(--color-surface-rgb)/0.76)] text-sm shadow-[0_16px_32px_-24px_rgb(var(--color-primary-rgb)/0.72)] focus:border-[var(--color-primary)] focus:bg-[color:rgb(var(--color-card-rgb)/0.96)]"
            forceIconRight={isArabic}
            maxResults={8}
          />
        </div>
      </section>

      <section className="rounded-[1.7rem] border border-[color:rgb(var(--color-border-rgb)/0.62)] bg-[color:rgb(var(--color-card-rgb)/0.76)] p-3 shadow-[var(--shadow-subtle)] backdrop-blur-xl sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 text-[var(--color-text)]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color:rgb(var(--color-secondary-rgb)/0.14)] text-[var(--color-secondary)]">
              <History className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="text-sm font-black">{isArabic ? 'آخر المنتجات التي بحثت عنها' : 'Recently searched products'}</h2>
              <p className="mt-0.5 text-[0.68rem] font-medium text-[var(--color-text-secondary)]">{isArabic ? 'اضغط على أي منتج لإكمال الشراء.' : 'Select a product to continue purchasing.'}</p>
            </div>
          </div>
          {recentProducts.length > 0 ? (
            <button type="button" onClick={clearRecentProducts} className="rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.68)] px-2.5 py-1.5 text-[0.65rem] font-bold text-[var(--color-text-secondary)] transition hover:border-[color:rgb(var(--color-primary-rgb)/0.75)] hover:text-[var(--color-primary)]">
              {isArabic ? 'مسح الكل' : 'Clear all'}
            </button>
          ) : null}
        </div>

        {isLoading && storefrontProducts.length === 0 ? (
          <LoadingSkeleton variant="search" />
        ) : recentProducts.length > 0 ? (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              {(showAllRecentProducts ? recentProducts : recentProducts.slice(0, 6)).map((item) => {
                const isAvailable = Boolean(item.product) && item.product.storefrontStatus?.isPurchasable !== false;
                const imageSrc = item.image ? resolveImageUrl(item.image) : '';

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => isAvailable && rememberAndOpenProduct(item.product)}
                    className={`group flex min-h-16 w-full items-center gap-2.5 rounded-2xl border p-2 text-start transition-all ${isAvailable
                      ? 'border-[color:rgb(var(--color-border-rgb)/0.65)] bg-[color:rgb(var(--color-surface-rgb)/0.5)] hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.55)] hover:bg-[color:rgb(var(--color-primary-rgb)/0.08)]'
                      : 'cursor-not-allowed border-rose-400/20 bg-rose-500/5 opacity-70'}`}
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.7)] bg-[color:rgb(var(--color-card-rgb)/0.86)]">
                      {imageSrc ? (
                        <img src={imageSrc} alt="" className={`h-full w-full object-contain p-1 ${!isAvailable ? 'grayscale opacity-60' : ''}`} loading="lazy" decoding="async" />
                      ) : (
                        <span className="text-sm font-black text-[var(--color-muted)]">{item.name.slice(0, 1)}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-black text-[var(--color-text)]">{item.name}</span>
                      <span className={`mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[0.58rem] font-bold ${isAvailable ? 'bg-[color:rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]' : 'bg-rose-500/12 text-rose-600 dark:text-rose-300'}`}>
                        {isAvailable ? (isArabic ? 'اضغط للشراء' : 'Tap to buy') : (isArabic ? 'غير متوفر' : 'Unavailable')}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {recentProducts.length > 6 ? (
              <button
                type="button"
                onClick={() => setShowAllRecentProducts((current) => !current)}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[color:rgb(var(--color-primary-rgb)/0.28)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-3 py-2 text-xs font-black text-[var(--color-primary)] transition hover:bg-[color:rgb(var(--color-primary-rgb)/0.14)]"
              >
                {showAllRecentProducts
                  ? (isArabic ? 'عرض أقل' : 'Show less')
                  : (isArabic ? `عرض المزيد (${recentProducts.length - 6})` : `View ${recentProducts.length - 6} more`)}
              </button>
            ) : null}
          </>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-[color:rgb(var(--color-border-rgb)/0.65)] bg-[color:rgb(var(--color-surface-rgb)/0.5)] px-5 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[color:rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]">
              <SearchX className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-sm font-black text-[var(--color-text)]">{isArabic ? 'لا توجد عمليات بحث سابقة' : 'No recent searches yet'}</h3>
            <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--color-text-secondary)]">{isArabic ? 'ابدأ بالبحث عن منتج، وستظهر اختياراتك الأخيرة هنا.' : 'Start searching for a product and your latest choices will appear here.'}</p>
          </div>
        )}
      </section>

      <ProductPurchaseDialog
        isOpen={Boolean(selectedProduct)}
        productId={selectedProduct?.id}
        initialProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onViewOrder={(orderId) => {
          setSelectedProduct(null);
          navigate(`/orders/${encodeURIComponent(orderId)}`);
        }}
      />
    </div>
  );
};

export default ProductSearch;
