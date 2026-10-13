import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Heart, Search, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useFavoritesStore, { favoriteUserKey } from '../store/useFavoritesStore';
import useGroupStore from '../store/useGroupStore';
import useMediaStore from '../store/useMediaStore';
import ProductPurchaseDialog from '../components/products/ProductPurchaseDialog';
import ProductCardSimple from '../components/products/ProductCardSimple';
import apiClient from '../services/client';
import { createStorefrontProducts, getStorefrontLanguage } from '../utils/storefront';
import './Favorites.css';

const EMPTY_IDS = [];
const isRealProvider = (import.meta.env.VITE_DATA_PROVIDER || 'mock').toLowerCase() === 'real';

const Favorites = () => {
  const user = useAuthStore((state) => state.user);
  const products = useMediaStore((state) => state.products);
  const isLoading = useMediaStore((state) => state.isLoading);
  const loadProducts = useMediaStore((state) => state.loadProducts);
  const groupsLastLoadedAt = useGroupStore((state) => state.groupsLastLoadedAt);
  const userKey = favoriteUserKey(user);
  const favoriteIds = useFavoritesStore((state) => state.favoritesByUser[userKey] || EMPTY_IDS);
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const language = getStorefrontLanguage(i18n);
  const isArabic = language === 'ar';
  const DirectionIcon = isArabic ? ArrowLeft : ArrowRight;
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [publicCatalog, setPublicCatalog] = useState(null);

  useEffect(() => {
    void loadProducts({ force: true });
    if (!isRealProvider) return undefined;
    let active = true;
    void apiClient.publicCatalog.fetch()
      .then((catalog) => { if (active) setPublicCatalog(catalog); })
      .catch(() => { if (active) setPublicCatalog(null); });
    return () => { active = false; };
  }, [loadProducts]);

  const catalogProducts = useMemo(() => {
    if (!Array.isArray(publicCatalog?.products)) return products;
    const privateById = new Map(products.map((product) => [String(product?.id || ''), product]));
    return publicCatalog.products.map((product) => {
      const privateProduct = privateById.get(String(product?.id || ''));
      return privateProduct ? {
        ...product,
        ...privateProduct,
        category: product.category || privateProduct.category,
        status: product.status,
        productStatus: product.productStatus,
        isActive: product.isActive,
        isVisibleInStore: product.isVisibleInStore,
        showWhenUnavailable: product.showWhenUnavailable,
      } : product;
    });
  }, [products, publicCatalog]);

  const storefrontProducts = useMemo(() => createStorefrontProducts(catalogProducts, {
    language,
    userGroup: user?.groupId || user?.group || 'Normal',
    userGroupPercentage: user?.groupPercentage ?? null,
  }), [catalogProducts, groupsLastLoadedAt, language, user?.group, user?.groupId, user?.groupPercentage]);

  const favoriteProducts = useMemo(() => {
    const byId = new Map(storefrontProducts.map((product) => [String(product.id), product]));
    return favoriteIds.map((id) => byId.get(id)).filter(Boolean);
  }, [favoriteIds, storefrontProducts]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return favoriteProducts;
    return favoriteProducts.filter((product) => [product.nameAr, product.name, product.displayName]
      .some((name) => String(name || '').toLocaleLowerCase().includes(query)));
  }, [favoriteProducts, search]);

  return (
    <div className="favorites-page mx-auto w-full max-w-6xl pb-10" dir={isArabic ? 'rtl' : 'ltr'}>
      <section className="favorites-hero">
        <div className="favorites-hero-glow" aria-hidden="true" />
        <div className="favorites-hero-content">
          <span className="favorites-eyebrow"><Sparkles size={14} /> {isArabic ? 'اختياراتك الخاصة' : 'Your personal picks'}</span>
          <h1>{isArabic ? 'منتجاتي المفضلة' : 'My favorite products'}</h1>
          <p>{isArabic ? 'كل المنتجات التي أحببتها في مكان واحد. ارجع إليها وابدأ الشراء بضغطة واحدة.' : 'All the products you love in one place. Return to them and start shopping in a tap.'}</p>
          <Link to="/dashboard/category" className="favorites-browse-link">
            {isArabic ? 'استكشف المنتجات' : 'Explore products'} <DirectionIcon size={17} />
          </Link>
        </div>
        <div className="favorites-hero-art" aria-hidden="true"><Heart fill="currentColor" /></div>
      </section>

      <div className="favorites-toolbar">
        <div className="favorites-count"><Heart size={17} fill="currentColor" /><span>{favoriteProducts.length} {isArabic ? 'منتج مفضل' : 'favorites'}</span></div>
        {favoriteProducts.length > 0 ? (
          <label className="favorites-search">
            <Search size={18} aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isArabic ? 'ابحث في مفضلتك...' : 'Search your favorites...'} aria-label={isArabic ? 'البحث في المفضلة' : 'Search favorites'} />
          </label>
        ) : null}
      </div>

      {visibleProducts.length ? (
        <section className="relative z-0 grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCardSimple
              key={product.id}
              product={product}
              onOpen={setSelectedProduct}
              unavailableLabel={isArabic ? 'غير متاح' : 'Unavailable'}
            />
          ))}
        </section>
      ) : (
        <div className="favorites-empty">
          <span className="favorites-empty-icon"><Heart size={30} /></span>
          <h2>{search ? (isArabic ? 'لا توجد نتائج مطابقة' : 'No matching favorites') : (isArabic ? 'مفضلتك تنتظر أول منتج' : 'Your favorites are waiting')}</h2>
          <p>{search ? (isArabic ? 'جرّب اسم منتج آخر.' : 'Try another product name.') : (isArabic ? 'افتح أي منتج واضغط على القلب في نافذة الشراء ليظهر هنا.' : 'Open a product and tap the heart in the purchase window to see it here.')}</p>
          {!search && !isLoading ? <Link to="/dashboard/category">{isArabic ? 'تصفح المنتجات' : 'Browse products'} <DirectionIcon size={16} /></Link> : null}
        </div>
      )}

      <ProductPurchaseDialog
        isOpen={Boolean(selectedProduct)}
        productId={selectedProduct?.id}
        initialProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onViewOrder={(orderId) => { setSelectedProduct(null); navigate(`/orders/${encodeURIComponent(orderId)}`); }}
      />
    </div>
  );
};

export default Favorites;
