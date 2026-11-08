import React, { useEffect, useState } from 'react';
import { ShieldCheck, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/client';
import useAuthStore from '../../store/useAuthStore';
import { useToast } from '../ui/Toast';

export default function MaintenanceControl() {
  const { i18n } = useTranslation();
  const { addToast } = useToast();
  const role = useAuthStore((state) => state.user?.role);
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  useEffect(() => {
    let active = true;
    apiClient.maintenance.getStatus()
      .then((status) => {
        if (!active) return;
        setEnabled(status?.enabled === true);
        setLoaded(true);
      })
      .catch(() => {
        if (active) {
          setLoadFailed(true);
          setLoaded(true);
        }
      });
    return () => { active = false; };
  }, []);

  if (String(role || '').toUpperCase() !== 'ADMIN') return null;

  const toggle = async () => {
    setBusy(true);
    try {
      const next = await apiClient.maintenance.setEnabled(!enabled);
      const nextEnabled = next?.enabled === true;
      setEnabled(nextEnabled);
      window.dispatchEvent(new CustomEvent('jasser:maintenance-updated', {
        detail: { enabled: nextEnabled, canBypass: next?.canBypass === true },
      }));
      addToast(isArabic ? 'تم تحديث وضع الصيانة' : 'Maintenance mode updated', 'success');
    } catch (error) {
      addToast(error?.message || (isArabic ? 'تعذر تحديث وضع الصيانة' : 'Could not update maintenance mode'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const statusLabel = !loaded
    ? (isArabic ? 'جارٍ التحميل' : 'Loading')
    : loadFailed
      ? (isArabic ? 'تعذر الاتصال' : 'Connection failed')
      : enabled
        ? (isArabic ? 'الصيانة مفعلة' : 'Maintenance on')
        : (isArabic ? 'الموقع يعمل' : 'Store online');

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-l from-slate-900 to-cyan-950 px-4 py-3 text-white shadow-sm sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-200">
          <Wrench className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-black">{isArabic ? 'التحكم في وضع الصيانة' : 'Maintenance control'}</h2>
          <p className="mt-0.5 text-xs text-slate-300">
            {isArabic ? 'إيقاف وصول العملاء مؤقتًا، مع بقاء الإدارة متاحة.' : 'Pause customer access while keeping admin access.'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4 text-cyan-200" />
          {statusLabel}
        </span>
        <button
          type="button"
          onClick={toggle}
          disabled={!loaded || loadFailed || busy}
          className="rounded-xl bg-cyan-300 px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy
            ? (isArabic ? 'جارٍ الحفظ' : 'Saving')
            : enabled
              ? (isArabic ? 'إيقاف الصيانة' : 'Disable')
              : (isArabic ? 'تفعيل الصيانة' : 'Enable')}
        </button>
      </div>
    </section>
  );
}