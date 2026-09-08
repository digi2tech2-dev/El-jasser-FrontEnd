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
import genieArtwork from '../assets/elgny.PNG';
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
  const [showWelcomeGenie, setShowWelcomeGenie] = useState(false);
  const language = getStorefrontLanguage(i18n);
  const isTwoFactorEnabled = Boolean(user?.twoFactorEnabled ?? user?.isTwoFactorEnabled);
  const isCustomerUser = String(user?.role || '').trim().toLowerCase() === 'customer';

  useEffect(() => {
    const userKey = String(user?.id || user?._id || user?.email || user?.username || '').trim();
    if (!userKey || typeof window === 'undefined') return;

    const storageKey = `el-jasser-card:dashboard-welcome:v1:${userKey}`;
    try {
      if (window.localStorage.getItem(storageKey)) return;
      window.localStorage.setItem(storageKey, 'seen');
      setShowWelcomeGenie(true);
    } catch {
      setShowWelcomeGenie(true);
    }
  }, [user?.email, user?.id, user?._id, user?.username]);

  useBodyScrollLock(showWelcomeGenie);

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

  const slideTwoUrl = 'https://whatsapp.com/channel/0029VbDq1UwDTkK4AeRqT02c';
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

  const welcomeOverlay = showWelcomeGenie ? (
    <div
      className="dashboard-welcome-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-welcome-title"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      onClick={() => setShowWelcomeGenie(false)}
    >
      <div className="dashboard-welcome-card" onClick={(event) => event.stopPropagation()}>
        <span className="dashboard-welcome-fire-glow" aria-hidden="true" />
        <div className="dashboard-welcome-dragon-stage" aria-hidden="true">
          <img src={genieArtwork} alt="" className="dashboard-welcome-dragon" decoding="async" fetchPriority="high" />
        </div>
        <div className="dashboard-welcome-content">
          <span className="dashboard-welcome-kicker">EL-JASSER CARD</span>
          <h1 id="dashboard-welcome-title">{language === 'ar' ? 'مرحبًا بك في الجاسر كارد' : 'Welcome to El-Jasser Card'}</h1>
          <p>{language === 'ar' ? 'كل خدماتك الرقمية تبدأ من هنا.' : 'Your digital services start here.'}</p>
          <button type="button" onClick={() => setShowWelcomeGenie(false)} className="dashboard-welcome-button">
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
        <section className="group relative z-20 mx-auto w-full max-w-lg overflow-hidden rounded-lg border border-[color:rgb(var(--color-primary-rgb)/0.28)] bg-[linear-gradient(120deg,rgb(var(--color-primary-rgb)/0.09),rgb(var(--color-card-rgb)/0.82)_52%,rgb(var(--color-secondary-rgb)/0.08))] p-1 shadow-[0_10px_22px_-20px_rgb(var(--color-primary-rgb)/0.7)] backdrop-blur-xl sm:p-1.5">
          <div className="relative flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="relative grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[color:rgb(var(--color-primary-rgb)/0.3)] bg-[linear-gradient(145deg,rgb(var(--color-primary-rgb)/0.16),rgb(var(--color-secondary-rgb)/0.12))] text-[var(--color-primary)] shadow-[inset_0_1px_0_rgb(255_255_255/0.14)] sm:h-7 sm:w-7">
                <span className="absolute end-0 top-0 h-1 w-1 -translate-y-1/4 translate-x-1/4 rounded-full border border-[rgb(var(--color-card-rgb))] bg-[var(--color-secondary)]" />
                <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[0.61rem] font-bold text-[var(--color-text)] sm:text-[0.67rem]">
                  {language === 'ar' ? 'حماية إضافية لحسابك' : 'Extra protection for your account'}
                </p>
                <p className="mt-0.5 truncate text-[0.5rem] font-medium text-[var(--color-text-secondary)] sm:text-[0.56rem]">
                  {language === 'ar' ? 'فعّل المصادقة الثنائية في أقل من دقيقة.' : 'Enable two-factor authentication in under a minute.'}
                </p>
              </div>
            </div>

            <Link
              to="/account-security"
              className="inline-flex h-6 shrink-0 items-center justify-center gap-0.5 rounded-md border border-[color:rgb(var(--color-secondary-rgb)/0.34)] bg-[color:rgb(var(--color-secondary-rgb)/0.1)] px-1.5 text-[0.52rem] font-extrabold text-[var(--color-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-secondary-rgb)/0.55)] hover:bg-[color:rgb(var(--color-secondary-rgb)/0.16)] hover:shadow-[0_8px_18px_-14px_rgb(var(--color-secondary-rgb)/0.8)] sm:h-7 sm:px-2 sm:text-[0.58rem]"
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
            className="group relative mx-auto block w-full max-w-5xl overflow-hidden rounded-[1.25rem] border border-[color:rgb(var(--color-primary-rgb)/0.35)] bg-[var(--color-card)] shadow-[0_20px_50px_-25px_rgb(var(--color-primary-rgb)/0.8)] transition-all duration-300 hover:-translate-y-1 hover:border-[color:rgb(var(--color-primary-rgb)/0.6)] hover:shadow-[0_25px_60px_-20px_rgb(var(--color-primary-rgb)/0.95)]"
            aria-label={language === 'ar' ? 'بيع تارجت' : 'Sell Target'}
          >
            <div className="relative aspect-[1280/485] w-full overflow-hidden">
              <img
                src={targetBannerImage}
                alt={language === 'ar' ? 'بيع تارجت' : 'Sell Target'}
                className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                loading="lazy"
                decoding="async"
              />
              <div className="pointer-events-none absolute bottom-[10%] left-[23.5%] flex h-[19%] w-[35.5%] items-center justify-center">
                <span className="text-[clamp(0.75rem,2.5vw,1.25rem)] font-black tracking-wider text-[#ffe58f] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] transition-transform duration-300 group-hover:scale-105">
                  {language === 'ar' ? 'بيع التارجت' : 'Sell Target'}
                </span>
              </div>
            </div>
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
