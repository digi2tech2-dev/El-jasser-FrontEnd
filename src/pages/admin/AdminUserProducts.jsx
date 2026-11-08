import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, EyeOff, Package, Save, Search } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useLanguage } from '../../context/LanguageContext';
import useAuthStore from '../../store/useAuthStore';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import { formatWalletAmount } from '../../utils/storefront';
import apiClient from '../../services/client';

const AdminUserProducts = () => {
  const { userId = '' } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { dir } = useLanguage();
  const isArabic = dir === 'rtl';
  const actor = useAuthStore((state) => state.user);
  const canManageUsers = hasPermission(actor, PERMISSIONS.MANAGE_USERS);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const result = await apiClient.users.listProductsForUser(userId);
      const rows = Array.isArray(result?.products) ? result.products : [];
      setUser(result?.user || null);
      setProducts(rows);
      setDrafts(Object.fromEntries(rows.map((product) => [String(product.id), {
        priceOverride: product.priceOverride == null ? '' : String(product.priceOverride),
        isHiddenForUser: Boolean(product.isHiddenForUser),
      }])));
    } catch (error) {
      setLoadError(error?.message || (isArabic ? 'تعذر تحميل المنتجات.' : 'Could not load products.'));
    } finally {
      setIsLoading(false);
    }
  }, [isArabic, userId]);

  useEffect(() => { void loadProducts(); }, [loadProducts]);
  const visibleProducts = useMemo(() => {
    const term = String(search || '').trim().toLowerCase();
    return term ? products.filter((product) => (String(product.name || '') + ' ' + String(product.category || '')).toLowerCase().includes(term)) : products;
  }, [products, search]);
  const updateDraft = (id, updates) => setDrafts((current) => ({ ...current, [id]: { ...(current[id] || {}), ...updates } }));

  const saveProduct = async (product) => {
    if (!canManageUsers) return;
    const id = String(product.id);
    const draft = drafts[id] || {};
    const price = String(draft.priceOverride || '').trim();
    if (price && (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(price) || !Number.isFinite(Number(price)) || Number(price) <= 0)) {
      addToast(isArabic ? 'أدخل سعرًا أكبر من صفر أو اتركه فارغًا.' : 'Enter a price above zero or leave it blank.', 'error');
      return;
    }
    setSavingId(id);
    try {
      const saved = await apiClient.users.updateProductOverride(userId, id, { priceOverride: price || null, isHidden: Boolean(draft.isHiddenForUser) });
      setProducts((current) => current.map((row) => row.id === id ? { ...row, priceOverride: saved?.priceOverride ?? null, isHiddenForUser: Boolean(saved?.isHidden) } : row));
      addToast(isArabic ? 'تم حفظ إعدادات المنتج لهذا المستخدم.' : 'User product settings saved.', 'success');
    } catch (error) {
      addToast(error?.message || (isArabic ? 'تعذر حفظ الإعدادات.' : 'Could not save settings.'), 'error');
    } finally { setSavingId(''); }
  };

  return (
    <div className="mx-auto min-w-0 max-w-5xl space-y-4 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/users?userId=' + encodeURIComponent(userId))}><ArrowLeft className="h-4 w-4" />{isArabic ? 'العودة للمستخدم' : 'Back to user'}</Button>
          <div><h1 className="text-lg font-bold text-[var(--color-text)]">{isArabic ? 'إدارة منتجات المستخدم' : 'User product settings'}</h1><p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{user?.name || user?.email || userId}</p></div>
        </div>
        {user?.isApiEnabled ? <Badge variant="success">{isArabic ? 'API مفعّل — التغييرات تشمل الـ API' : 'API enabled — changes apply to API'}</Badge> : null}
      </div>
      <Card variant="elevated" className="space-y-3 p-3 sm:p-4">
        <p className="text-xs leading-5 text-[var(--color-text-secondary)]">{isArabic ? 'السعر المخصص هو السعر النهائي بالدولار لهذا المستخدم فقط. ترك السعر فارغًا يعيد سعر المجموعة. إخفاء المنتج يمنع ظهوره وطلبه لهذا المستخدم في الموقع والـ API.' : 'Custom price is this user’s final USD price. Leave it blank to use group pricing. Hiding removes it from this user’s website and API catalogs and prevents orders.'}</p>
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isArabic ? 'ابحث عن تطبيق أو منتج' : 'Search products'} icon={<Search className="h-4 w-4" />} variant="search" />
      </Card>
      {isLoading ? <Card className="p-6 text-center text-sm text-[var(--color-text-secondary)]">{isArabic ? 'جارٍ تحميل المنتجات…' : 'Loading products…'}</Card> : null}
      {!isLoading && loadError ? <Card className="space-y-3 p-5 text-center"><p className="text-sm text-red-600">{loadError}</p><Button variant="outline" onClick={() => void loadProducts()}>{isArabic ? 'إعادة المحاولة' : 'Retry'}</Button></Card> : null}
      {!isLoading && !loadError && visibleProducts.length === 0 ? <Card className="p-6 text-center text-sm text-[var(--color-text-secondary)]">{isArabic ? 'لا توجد منتجات مطابقة.' : 'No matching products.'}</Card> : null}
      <div className="space-y-3">
        {visibleProducts.map((product) => {
          const id = String(product.id);
          const draft = drafts[id] || { priceOverride: '', isHiddenForUser: false };
          return (
            <Card key={id} variant="elevated" className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.8fr)] sm:items-center sm:p-4">
              <div className="flex min-w-0 items-center gap-3">
                {product.image ? <img src={product.image} alt="" className="h-12 w-12 rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.75)] object-cover" /> : <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[color:rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]"><Package className="h-5 w-5" /></span>}
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[var(--color-text)]">{product.name}</p><p className="mt-0.5 truncate text-xs text-[var(--color-text-secondary)]">{product.category || (isArabic ? 'بدون تصنيف' : 'Uncategorized')}</p><div className="mt-1 flex flex-wrap gap-1.5"><Badge variant={product.isActive === false ? 'warning' : 'secondary'}>{product.isActive === false ? (isArabic ? 'غير نشط' : 'Inactive') : (isArabic ? 'نشط' : 'Active')}</Badge>{product.isHiddenForUser ? <Badge variant="danger">{isArabic ? 'مخفي لهذا المستخدم' : 'Hidden for user'}</Badge> : null}</div></div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">{isArabic ? 'السعر النهائي الخاص (USD)' : 'Custom final price (USD)'}<input type="text" inputMode="decimal" value={draft.priceOverride} onChange={(event) => updateDraft(id, { priceOverride: event.target.value })} placeholder={(isArabic ? 'سعر المجموعة' : 'Group price') + ' · ' + formatWalletAmount(product.basePrice || 0, 'USD')} disabled={!canManageUsers || savingId === id} className="mt-1 h-9 w-full rounded-lg border border-[color:rgb(var(--color-border-rgb)/0.8)] bg-[color:rgb(var(--color-surface-rgb)/0.8)] px-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60" /></label>
                <div className="flex flex-col justify-between gap-2"><label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-[color:rgb(var(--color-border-rgb)/0.75)] px-2.5 text-xs font-semibold text-[var(--color-text)]"><input type="checkbox" checked={Boolean(draft.isHiddenForUser)} onChange={(event) => updateDraft(id, { isHiddenForUser: event.target.checked })} disabled={!canManageUsers || savingId === id} className="h-4 w-4 accent-red-600" /><EyeOff className="h-3.5 w-3.5 text-red-500" />{isArabic ? 'إخفاء لهذا المستخدم' : 'Hide for this user'}</label><Button size="sm" className="w-full" onClick={() => void saveProduct(product)} disabled={!canManageUsers || savingId === id}><Save className="h-3.5 w-3.5" />{savingId === id ? (isArabic ? 'جارٍ الحفظ…' : 'Saving…') : (isArabic ? 'حفظ التعديل' : 'Save changes')}</Button></div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminUserProducts;
