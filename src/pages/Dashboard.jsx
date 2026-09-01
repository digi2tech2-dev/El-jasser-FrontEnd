import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useMediaStore from '../store/useMediaStore';
import useGroupStore from '../store/useGroupStore';
import HeroSlider from '../components/home/HeroSlider';
import CategoryCard from '../components/home/CategoryCard';
import BestSellingSection from '../components/home/BestSellingSection';
import ProductSearchBar from '../components/products/ProductSearchBar';
import ProductPurchaseDialog from '../components/products/ProductPurchaseDialog';
import slideOneHeroImage from '../assets/slide-1.jpg';
import slideTwoHeroImage from '../assets/slide-2.jpg';
import slideThreeHeroImage from '../assets/slide-3.jpg';
import slideFourHeroImage from '../assets/slide-4.jpg';
import targetBannerImage from '../assets/تارجت.jpg';
import paymentWarningDragon from '../assets/payment-warning-dragon-lite.webp';
import { useBodyScrollLock } from '../utils/bodyScrollLock';
import {
  createStorefrontCategories,
  createStorefrontProducts,
  getStorefrontLanguage,
} from '../utils/storefront';

const Dashboard = () => {
  const { user, refreshProfile } = useAuthStore();
  const { categories, products, loadProducts } = useMediaStore();
  const groupsLastLoadedAt = useGroupStore((state) => state.groupsLastLoadedAt);
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showWelcomeDragon, setShowWelcomeDragon] = useState(false);
  const language = getStorefrontLanguage(i18n);
  const isTwoFactorEnabled = Boolean(user?.twoFactorEnabled ?? user?.isTwoFactorEnabled);
  const isCustomerUser = String(user?.role || '').trim().toLowerCase() === 'customer';

  useEffect(() => {
    const userKey = String(user?.id || user?._id || user?.email || user?.username || '').trim();
    if (!userKey || typeof window === 'undefined') return;

    const storageKey = `dra90n:dashboard-welcome:v1:${userKey}`;
    try {
      if (window.localStorage.getItem(storageKey)) return;
      window.localStorage.setItem(storageKey, 'seen');
      setShowWelcomeDragon(true);
    } catch {
      setShowWelcomeDragon(true);
    }
  }, [user?.email, user?.id, user?._id, user?.username]);

  useBodyScrollLock(showWelcomeDragon);

  useEffect(() => {
    if (refreshProfile) refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    const refreshProducts = () => {
      void loadProducts({ force: true, bypassCache: true });
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshProducts();
    };

    refreshProducts();
    window.addEventListener('focus', refreshProducts);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    const refreshInterval = window.setInterval(refreshProducts, 30_000);

    return () => {
      window.removeEventListener('focus', refreshProducts);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.clearInterval(refreshInterval);
    };
  }, [loadProducts]);

  const slideTwoUrl = 'https://whatsapp.com/channel/0029VbDau0q0G0XdNPUJjN1F';
  const heroSlides = useMemo(() => ([
    { id: 'landing-slide-1', image: slideOneHeroImage, title: '' },
    { id: 'landing-slide-2', image: slideTwoHeroImage, title: '', href: slideTwoUrl },
    { id: 'landing-slide-3', image: slideThreeHeroImage, title: '', href: '/referral' },
    { id: 'landing-slide-4', image: slideFourHeroImage, title: '' },
  ]), []);

  const storefrontProducts = useMemo(
    () => createStorefrontProducts(products, {
      language,
      userGroup: user?.groupId || user?.group || 'Normal',
      userGroupPercentage: user?.groupPercentage ?? null,
    }),
    [groupsLastLoadedAt, language, products, user?.group, user?.groupId, user?.groupPercentage]
  );

  const storefrontCategories = useMemo(
    () => createStorefrontCategories(categories, storefrontProducts, language),
    [categories, storefrontProducts, language]
  );

  const visibleHomepageCategories = useMemo(
    () => storefrontCategories.filter((category) => {
      if (category.id === 'all') return false;
      const p = category.parentCategory;
      if (!p) return true;
      if (typeof p === 'string' && !p.trim()) return true;
      return false;
    }),
    [storefrontCategories]
  );

  const categoryChildrenByParent = useMemo(() => (
    storefrontCategories.reduce((map, category) => {
      const parentId = String(category?.parentCategory || '').trim();
      if (!parentId) return map;
      if (!map.has(parentId)) map.set(parentId, []);
      map.get(parentId).push(category.id);
      return map;
    }, new Map())
  ), [storefrontCategories]);

  const collectCategoryIds = useCallback((categoryId) => {
    const seen = new Set();
    const stack = [String(categoryId || '').trim()].filter(Boolean);
    while (stack.length) {
      const currentId = stack.pop();
      if (!currentId || seen.has(currentId)) continue;
      seen.add(currentId);
      (categoryChildrenByParent.get(currentId) || []).forEach((childId) => {
        if (!seen.has(childId)) stack.push(childId);
      });
    }
    return seen;
  }, [categoryChildrenByParent]);

  const bestSellingProducts = useMemo(() => {
    const firstCategory = visibleHomepageCategories[0];
    const secondCategory = visibleHomepageCategories[1];
    const pickedIds = new Set();

    const pickFromCategory = (category, limit) => {
      if (!category) return [];
      const categoryIds = collectCategoryIds(category.id);
      const selected = [];

      for (const product of storefrontProducts) {
        if (selected.length >= limit) break;
        if (!categoryIds.has(String(product?.category || '').trim())) continue;
        if (pickedIds.has(product.id)) continue;
        pickedIds.add(product.id);
        selected.push(product);
      }

      return selected;
    };

    return [
      ...pickFromCategory(firstCategory, 4),
      ...pickFromCategory(secondCategory, 4),
    ];
  }, [collectCategoryIds, storefrontProducts, visibleHomepageCategories]);

  const handleCategorySelect = useCallback((categoryId) => {
    navigate(categoryId === 'all' ? '/products' : `/products?category=${encodeURIComponent(categoryId)}`);
  }, [navigate]);

  const handleProductSelect = useCallback((product) => {
    const next = new URLSearchParams();
    if (product?.category) next.set('category', product.category);
    next.set('request', product.id);
    navigate(`/products?${next.toString()}`);
  }, [navigate]);

  const openPurchaseDialog = useCallback((product) => {
    setSelectedProduct(product);
  }, []);

  const closePurchaseDialog = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const viewCreatedOrder = useCallback((orderId) => {
    setSelectedProduct(null);
    navigate(`/orders/${encodeURIComponent(orderId)}`);
  }, [navigate]);

  const welcomeOverlay = showWelcomeDragon ? (
    <div
      className="dashboard-welcome-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-welcome-title"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      onClick={() => setShowWelcomeDragon(false)}
    >
      <div className="dashboard-welcome-card" onClick={(event) => event.stopPropagation()}>
        <span className="dashboard-welcome-fire-glow" aria-hidden="true" />
        <span className="dashboard-welcome-embers" aria-hidden="true" />
        <div className="dashboard-welcome-dragon-stage" aria-hidden="true">
          <img src={paymentWarningDragon} alt="" className="dashboard-welcome-dragon" decoding="async" fetchPriority="high" />
        </div>
        <div className="dashboard-welcome-content">
          <span className="dashboard-welcome-kicker">DRA90N STORE</span>
          <h1 id="dashboard-welcome-title">{language === 'ar' ? 'مرحبًا بك في DRA90N' : 'Welcome to DRA90N'}</h1>
          <p>{language === 'ar' ? 'استعد لتجربة شحن نارية وسريعة.' : 'Get ready for a fast, fiery top-up experience.'}</p>
          <button type="button" onClick={() => setShowWelcomeDragon(false)} className="dashboard-welcome-button">
            {language === 'ar' ? 'ابدأ الآن' : 'Start now'}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-5 pb-5 sm:space-y-6">
      {typeof document !== 'undefined' && welcomeOverlay ? createPortal(welcomeOverlay, document.body) : null}

      {!isTwoFactorEnabled ? (
        <section className="group relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-emerald-400/20 bg-[linear-gradient(120deg,rgb(16_185_129/0.08),rgb(var(--color-card-rgb)/0.72)_48%,rgb(56_189_248/0.07))] p-2 shadow-[0_16px_40px_-34px_rgb(16_185_129/0.72)] backdrop-blur-xl sm:p-2.5">
          <span className="pointer-events-none absolute -start-8 -top-10 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="relative flex items-center justify-between gap-2.5">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-300/25 bg-[linear-gradient(145deg,rgb(16_185_129/0.18),rgb(56_189_248/0.12))] text-emerald-500 shadow-[inset_0_1px_0_rgb(255_255_255/0.16)] sm:h-10 sm:w-10">
                <span className="absolute end-0 top-0 h-2 w-2 -translate-y-1/4 translate-x-1/4 rounded-full border-2 border-[rgb(var(--color-card-rgb))] bg-emerald-400" />
                <ShieldCheck className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[0.75rem] font-bold text-[var(--color-text)] sm:text-[0.84rem]">
                  {language === 'ar' ? 'حماية إضافية لحسابك' : 'Extra protection for your account'}
                </p>
                <p className="mt-0.5 truncate text-[0.64rem] font-medium text-[var(--color-text-secondary)] sm:text-[0.71rem]">
                  {language === 'ar' ? 'فعّل المصادقة الثنائية في أقل من دقيقة.' : 'Enable two-factor authentication in under a minute.'}
                </p>
              </div>
            </div>

            <Link
              to="/account-security"
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-2.5 text-[0.66rem] font-extrabold text-emerald-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-emerald-500/16 hover:shadow-[0_10px_24px_-16px_rgb(16_185_129/0.9)] sm:h-9 sm:px-3 sm:text-[0.73rem]"
            >
              <span>{language === 'ar' ? 'تفعيل الحماية' : 'Protect now'}</span>
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.4} />
            </Link>
          </div>
        </section>
      ) : null}

      <HeroSlider slides={heroSlides} />

      <section id="categories" className="scroll-mt-28 space-y-3 sm:space-y-3.5">
        <div className="relative z-10 mx-auto flex w-full max-w-5xl justify-center px-0.5 sm:px-2">
          <ProductSearchBar products={storefrontProducts} language={language} onSelectProduct={handleProductSelect} forceIconRight placeholder={language === 'ar' ? 'ابحث عن منتج...' : 'Search for a product...'} noResultsLabel={language === 'ar' ? 'لا يوجد منتج مطابق' : 'No matching product found'} className="mx-auto w-full" inputClassName="h-10 rounded-full" />
        </div>

        <div className="relative z-0 grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 xl:grid-cols-4">
          {visibleHomepageCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} active={false} index={index} onSelect={handleCategorySelect} />
          ))}
        </div>

      </section>

      {isCustomerUser ? (
        <div className="mx-auto w-full max-w-5xl px-0.5 sm:px-2">
          <Link
            to="/buy-target"
            className="group mx-auto block w-full max-w-5xl overflow-hidden rounded-[1rem] border border-[color:rgb(var(--color-primary-rgb)/0.28)] bg-[color:rgb(var(--color-card-rgb)/0.76)] shadow-[0_18px_42px_-30px_rgb(var(--color-primary-rgb)/0.82),inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.46)] hover:shadow-[0_22px_48px_-30px_rgb(var(--color-primary-rgb)/0.9)]"
            aria-label={language === 'ar' ? 'بيع تارجت' : 'Sell Target'}
          >
            <span className="block overflow-hidden bg-black">
              <img
                src={targetBannerImage}
                alt={language === 'ar' ? 'بيع تارجت' : 'Sell Target'}
                className="block aspect-[2112/745] w-full object-contain transition-transform duration-500 group-hover:scale-[1.012]"
                loading="lazy"
              />
            </span>
            <span className="block border-t border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[linear-gradient(180deg,rgb(var(--color-card-rgb)/0.94),rgb(var(--color-primary-rgb)/0.08))] px-3 py-1.5 text-center">
              <span className="text-xs font-extrabold text-[var(--color-text)] sm:text-sm">
                {language === 'ar' ? 'بيع تارجت' : 'Sell Target'}
              </span>
            </span>
          </Link>
        </div>
      ) : null}

      {bestSellingProducts.length ? (
        <BestSellingSection
          id="best-selling-title"
          title={language === 'ar' ? 'الأكثر مبيعًا' : 'Best sellers'}
          viewAllLabel={language === 'ar' ? 'عرض الكل' : 'View all'}
          products={bestSellingProducts}
          categories={storefrontCategories}
          language={language}
          onViewAll={() => navigate('/products')}
          onProductSelect={openPurchaseDialog}
          disableUnavailable
        />
      ) : null}

      <ProductPurchaseDialog
        isOpen={Boolean(selectedProduct)}
        productId={selectedProduct?.id}
        initialProduct={selectedProduct}
        onClose={closePurchaseDialog}
        onViewOrder={viewCreatedOrder}
      />

    </div>
  );
};

export default Dashboard;
