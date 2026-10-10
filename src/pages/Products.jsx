import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Layers3 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useMediaStore from '../store/useMediaStore';
import useGroupStore from '../store/useGroupStore';
import CategoryCard from '../components/home/CategoryCard';
import ProductCardSimple from '../components/products/ProductCardSimple';
import ProductPurchaseDialog from '../components/products/ProductPurchaseDialog';
import { createStorefrontCategories, createStorefrontProducts, getStorefrontLanguage } from '../utils/storefront';

const Products = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const products = useMediaStore((state) => state.products);
  const categories = useMediaStore((state) => state.categories);
  const loadProducts = useMediaStore((state) => state.loadProducts);
  const groupsLastLoadedAt = useGroupStore((state) => state.groupsLastLoadedAt);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const language = getStorefrontLanguage(i18n);
  const isArabic = language === 'ar';
  const categoryId = String(params.get('category') || '').trim();

  useEffect(() => { void loadProducts({ force: true, bypassCache: true }); }, [loadProducts]);

  const storefrontProducts = useMemo(() => createStorefrontProducts(products, {
    language, userGroup: user?.groupId || user?.group || 'Normal', userGroupPercentage: user?.groupPercentage ?? null,
  }), [groupsLastLoadedAt, language, products, user?.group, user?.groupId, user?.groupPercentage]);
  const storefrontCategories = useMemo(() => createStorefrontCategories(categories, storefrontProducts, language).filter((item) => item.id !== 'all'), [categories, language, storefrontProducts]);
  const activeCategory = storefrontCategories.find((item) => item.id === categoryId);
  const displayedProducts = storefrontProducts.filter((item) => String(item.category || '') === categoryId);

  return (
    <div className="space-y-5 pb-6">
      <section className="rounded-[1.7rem] border border-[color:rgb(var(--color-border-rgb)/0.66)] bg-[color:rgb(var(--color-card-rgb)/0.8)] p-5 shadow-[var(--shadow-subtle)] backdrop-blur-xl">
        {categoryId ? (
          <>
            <button type="button" onClick={() => setParams({})} className="inline-flex items-center gap-1.5 rounded-xl border border-[color:rgb(var(--color-primary-rgb)/0.28)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-3 py-2 text-xs font-black text-[var(--color-primary)]">
              {isArabic ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}{isArabic ? 'كل الكاتلوجات' : 'All catalogs'}
            </button>
            <h1 className="mt-4 text-xl font-black text-[var(--color-text)]">{activeCategory?.title || (isArabic ? 'المنتجات' : 'Products')}</h1>
          </>
        ) : <div className="text-center"><Layers3 className="mx-auto h-6 w-6 text-[var(--color-primary)]" /><h1 className="mt-2 text-xl font-black text-[var(--color-text)]">{isArabic ? 'الكاتلوجات' : 'Catalogs'}</h1></div>}
      </section>

      {!categoryId ? (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {storefrontCategories.map((category, index) => <CategoryCard key={category.id} category={category} index={index} onSelect={(id) => setParams({ category: id })} />)}
        </section>
      ) : displayedProducts.length ? (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {displayedProducts.map((product) => <ProductCardSimple key={product.id} product={product} onOpen={setSelectedProduct} unavailableLabel={isArabic ? 'غير متاح' : 'Unavailable'} />)}
        </section>
      ) : <p className="py-12 text-center text-sm text-[var(--color-text-secondary)]">{isArabic ? 'لا توجد منتجات متاحة في هذا الكاتلوج.' : 'No available products in this catalog.'}</p>}

      <ProductPurchaseDialog isOpen={Boolean(selectedProduct)} productId={selectedProduct?.id} initialProduct={selectedProduct} onClose={() => setSelectedProduct(null)} onViewOrder={(orderId) => { setSelectedProduct(null); navigate(`/orders/${encodeURIComponent(orderId)}`); }} />
    </div>
  );
};

export default Products;
