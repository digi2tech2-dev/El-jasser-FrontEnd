import React, { useEffect, useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Download, Rocket, Target } from 'lucide-react';
import { cn } from '../ui/Button';

const isNativeApp = () => Capacitor.isNativePlatform();

const StorefrontPromotions = ({ language = 'ar', onSellTarget }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const isArabic = language === 'ar';
  const runningInApp = isNativeApp();
  const androidAppUrl = import.meta.env.VITE_ANDROID_APP_URL || '/el-jasser.apk';

  const slides = useMemo(() => {
    const targetSlide = {
      id: 'sell-target',
      icon: Target,
      tone: 'target',
      title: isArabic ? 'عندك Target؟ بِعه من هنا' : 'Have Target? Sell it here',
      description: isArabic ? 'اضغط هنا وابدأ طلب البيع بسهولة.' : 'Tap here to start your sale request easily.',
      action: isArabic ? 'اضغط لبيع Target' : 'Sell Target',
      onClick: onSellTarget,
    };

    // The APK is useful only in a browser. Capacitor already runs the app itself.
    if (runningInApp) return [targetSlide];

    return [
      targetSlide,
      {
        id: 'download-android',
        icon: Download,
        tone: 'android',
        title: isArabic ? 'حمّل التطبيق على أندرويد' : 'Download the Android app',
        description: isArabic ? 'لتجربة أسرع وأكثر استقرارًا.' : 'For a faster, more stable experience.',
        action: isArabic ? 'تحميل التطبيق' : 'Download app',
        href: androidAppUrl,
      },
    ];
  }, [androidAppUrl, isArabic, onSellTarget, runningInApp]);

  useEffect(() => {
    setActiveSlide(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  const slide = slides[activeSlide] || slides[0];
  const Icon = slide.icon;
  const isTargetSlide = slide.tone === 'target';
  const actionClassName = cn(
    'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-extrabold transition-all hover:-translate-y-0.5 hover:brightness-110 sm:px-4',
    isTargetSlide
      ? 'border-cyan-200/30 bg-gradient-to-l from-[#0b92bd] to-[#075d8d] text-white shadow-[0_10px_24px_-13px_rgba(20,190,229,0.58)]'
      : 'border-amber-100/35 bg-gradient-to-l from-[#e5b744] to-[#b87816] text-[#132b3f] shadow-[0_10px_24px_-13px_rgba(229,183,68,0.58)]'
  );

  const actionContent = (
    <>
      {slide.tone === 'target' ? <Rocket className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
      <span>{slide.action}</span>
    </>
  );

  return (
    <section
      className={cn(
        'storefront-promotions relative isolate overflow-hidden rounded-[1.35rem] border px-3 py-3 shadow-[0_20px_42px_-28px_rgba(2,17,35,0.88)] sm:px-4',
        isTargetSlide
          ? 'border-cyan-300/35 bg-[#071f35]'
          : 'border-amber-200/40 bg-[#172333]'
      )}
      data-tone={slide.tone}
      aria-label={isArabic ? 'روابط سريعة' : 'Quick links'}
    >
      <div className={cn(
        'pointer-events-none absolute inset-0 opacity-90',
        isTargetSlide
          ? 'bg-[radial-gradient(circle_at_94%_-20%,rgba(31,202,240,0.4),transparent_38%),radial-gradient(circle_at_2%_120%,rgba(7,89,133,0.66),transparent_48%)]'
          : 'bg-[radial-gradient(circle_at_94%_-20%,rgba(255,215,103,0.42),transparent_38%),radial-gradient(circle_at_2%_120%,rgba(184,120,22,0.42),transparent_48%)]'
      )} />
      <div className="pointer-events-none absolute -end-6 -top-10 h-28 w-28 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -end-1 top-3 h-16 w-16 rounded-full border border-white/[0.07]" />
      <div key={slide.id} className="relative flex items-center gap-2.5 animate-in fade-in duration-300 sm:gap-3">
        <span className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-[inset_0_1px_rgba(255,255,255,0.18)]',
          isTargetSlide
            ? 'border-cyan-200/30 bg-cyan-300/15 text-cyan-100'
            : 'border-amber-100/30 bg-amber-200/15 text-amber-100'
        )}>
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-white sm:text-[15px]">{slide.title}</p>
          <p className="mt-0.5 text-xs text-cyan-50/75">{slide.description}</p>
        </div>

        {slide.href ? (
          <a href={slide.href} className={actionClassName} download>
            {actionContent}
          </a>
        ) : (
          <button type="button" onClick={slide.onClick} className={actionClassName}>
            {actionContent}
          </button>
        )}
      </div>

      {slides.length > 1 && (
        <div className="relative mt-2 flex justify-center gap-1.5" aria-label={isArabic ? 'اختيار الإعلان' : 'Choose promotion'}>
          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={item.title}
              aria-current={index === activeSlide ? 'true' : undefined}
              className={cn(
                'h-1.5 rounded-full transition-all',
                index === activeSlide
                  ? cn('w-5', isTargetSlide ? 'bg-cyan-200' : 'bg-amber-200')
                  : 'w-1.5 bg-white/25 hover:bg-white/55'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default React.memo(StorefrontPromotions);
