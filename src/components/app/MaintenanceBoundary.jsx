import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import apiClient from '../../services/client';
import useAuthStore from '../../store/useAuthStore';

export default function MaintenanceBoundary({ children }) {
  const user = useAuthStore((state) => state.user);
  const { pathname } = useLocation();
  const [status, setStatus] = useState({ enabled: false, canBypass: false });
  const isAuthPage = ['/auth', '/login', '/email-verified'].includes(pathname);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const next = await apiClient.maintenance.getStatus();
        if (active && next) {
          setStatus({ enabled: next.enabled === true, canBypass: next.canBypass === true });
        }
      } catch {
        // Retain the last server-confirmed maintenance status while offline.
      }
    };
    const onUpdated = (event) => {
      if (active && event.detail) setStatus(event.detail);
    };

    void refresh();
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener('jasser:maintenance-updated', onUpdated);
    window.addEventListener('online', refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('jasser:maintenance-updated', onUpdated);
      window.removeEventListener('online', refresh);
    };
  }, [user?.id, user?._id]);

  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';
  if (!status.enabled || status.canBypass || isAdmin || isAuthPage) return children;

  const isArabic = document.documentElement.lang?.toLowerCase().startsWith('ar');
  return (
    <main dir={isArabic ? 'rtl' : 'ltr'} className="fixed inset-0 z-[1000] grid min-h-[100dvh] place-items-center overflow-auto bg-[#071527] px-5 py-12 text-white">
      <section className="w-full max-w-lg rounded-[2rem] border border-cyan-300/25 bg-[#10283a] p-8 text-center shadow-2xl sm:p-10">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-200">
          <Wrench className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black">{isArabic ? 'الموقع تحت الصيانة' : 'Site maintenance'}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          {isArabic ? 'سنعود للعمل قريبًا. شكرًا لصبركم.' : 'We will be back soon. Thank you for your patience.'}
        </p>
        <Link to="/auth" className="mt-6 inline-flex rounded-xl border border-cyan-300/40 px-5 py-2 text-sm font-bold text-cyan-100">
          {isArabic ? 'دخول الإدارة' : 'Admin sign in'}
        </Link>
      </section>
    </main>
  );
}