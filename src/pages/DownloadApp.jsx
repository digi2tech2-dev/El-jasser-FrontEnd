import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Copy, Download, ExternalLink, HardDriveDownload, Info, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import brandIconImage from '../assets/elgny.webp';
import { fetchAndroidReleaseManifest, getReleaseNotesForLanguage } from '../services/appUpdate';

const formatSize = (bytes, language) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return null;
  const units = ['B', 'KB', 'MB', 'GB'];
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** unit)).toLocaleString(language, { maximumFractionDigits: unit ? 1 : 0 })} ${units[unit]}`;
};

const DownloadApp = () => {
  const { i18n } = useTranslation();
  const [release, setRelease] = useState(undefined);
  const [copied, setCopied] = useState(false);
  const isArabic = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';

  useEffect(() => {
    let mounted = true;
    void fetchAndroidReleaseManifest().then((value) => {
      if (mounted) setRelease(value);
    });
    return () => { mounted = false; };
  }, []);

  const notes = useMemo(() => getReleaseNotesForLanguage(release?.releaseNotes, isArabic ? 'ar' : 'en'), [isArabic, release]);
  const releaseDate = release?.publishedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(release.publishedAt))
    : null;
  const apkSize = formatSize(release?.sizeBytes, locale);

  const copyDownloadLink = async () => {
    if (!release?.apkUrl || typeof window === 'undefined') return;
    try {
      await navigator.clipboard?.writeText(new URL(release.apkUrl, window.location.origin).href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_85%_8%,rgba(8,127,155,0.2),transparent_28%),linear-gradient(180deg,#fff8ee_0%,#fff3e4_48%,#fffaf4_100%)] px-4 py-7 text-slate-900 dark:bg-[radial-gradient(circle_at_85%_8%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_10%_94%,rgba(245,158,11,0.12),transparent_30%),linear-gradient(180deg,#03101a,#07111f_58%,#060815_100%)] dark:text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.7)] bg-[color:rgb(var(--color-card-rgb)/0.72)] px-4 py-2 text-sm font-extrabold text-[var(--color-text-secondary)] shadow-[var(--shadow-subtle)] transition hover:-translate-y-0.5 hover:text-[var(--color-primary)]">
            <ExternalLink className="h-4 w-4" />
            {isArabic ? 'العودة للموقع' : 'Back to website'}
          </Link>
          <div dir="ltr" className="flex items-center gap-2 text-sm font-black text-[var(--color-text)]">
            <img src={brandIconImage} alt="" className="h-9 w-9 rounded-xl object-contain" />
            EL-JASSER
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[1.7rem] border border-amber-200/75 bg-white/85 p-5 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.5)] dark:border-cyan-300/18 dark:bg-[linear-gradient(135deg,rgba(5,18,30,0.96),rgba(12,10,27,0.92))] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="relative grid items-center gap-7 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-500/10 px-3 py-1.5 text-xs font-black text-cyan-800 dark:text-cyan-100">
                <Smartphone className="h-4 w-4" /> Android app
              </div>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{isArabic ? 'حمّل تطبيق EL-JASSER للأندرويد' : 'Download the EL-JASSER Android app'}</h1>
              <p className="mt-3 max-w-xl text-base font-medium leading-8 text-slate-600 dark:text-slate-300">
                {isArabic ? 'كل ما تحتاجه لإدارة حسابك وطلباتك بسرعة من هاتفك.' : 'Everything you need to manage your account and orders quickly from your phone.'}
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {(isArabic
                  ? ['إشعارات فورية للطلبات', 'تسجيل Google من داخل التطبيق', 'متابعة الطلبات بسهولة', 'وصول أسرع للمحفظة']
                  : ['Instant order notifications', 'Google sign-in inside the app', 'Easy order tracking', 'Faster wallet access']
                ).map((benefit) => <div key={benefit} className="flex items-center gap-2 rounded-xl border border-slate-200/85 bg-slate-50/80 px-3 py-2.5 text-sm font-bold dark:border-white/10 dark:bg-white/[0.045]"><CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-500" />{benefit}</div>)}
              </div>
            </div>

            <aside className="rounded-[1.3rem] border border-cyan-300/35 bg-[linear-gradient(155deg,#06243a,#0d1528)] p-5 text-white shadow-[0_22px_48px_-30px_rgba(8,127,155,0.85)]">
              <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-100"><HardDriveDownload className="h-5 w-5" /></span><div><p className="text-xs font-bold text-cyan-100/75">{isArabic ? 'أحدث إصدار متاح' : 'Latest available release'}</p><p dir="ltr" className="text-xl font-black">{release?.versionName || '—'}</p></div></div>
              {release === undefined && <p className="mt-5 text-sm text-slate-300">{isArabic ? 'جارٍ تحميل معلومات الإصدار…' : 'Loading release information…'}</p>}
              {release === null && <p className="mt-5 rounded-xl border border-amber-200/25 bg-amber-100/10 p-3 text-sm leading-6 text-amber-50">{isArabic ? 'تعذر تحميل معلومات أحدث إصدار حاليًا.' : 'Unable to load the latest release details right now.'}</p>}
              {release && <>
                <div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-slate-200">
                  {releaseDate && <p><span className="text-slate-400">{isArabic ? 'تاريخ الإصدار: ' : 'Released: '}</span>{releaseDate}</p>}
                  {apkSize && <p><span className="text-slate-400">{isArabic ? 'حجم الملف: ' : 'File size: '}</span><span dir="ltr">{apkSize}</span></p>}
                  <p>{isArabic ? 'يتطلب جهاز Android متوافقًا.' : 'Requires a compatible Android device.'}</p>
                </div>
                {notes.length > 0 && <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-100">{notes.map((note) => <li key={note} className="flex gap-2"><Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-200" />{note}</li>)}</ul>}
                <a href={release.apkUrl} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#12a9c5,#087f9b)] px-4 text-sm font-black text-white shadow-[0_16px_30px_-16px_rgba(34,211,238,0.95)] transition hover:-translate-y-0.5 hover:brightness-110"><Download className="h-4 w-4" />{isArabic ? 'تحميل APK' : 'Download APK'}</a>
                <button type="button" onClick={copyDownloadLink} className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-sm font-bold text-slate-100 transition hover:bg-white/10"><Copy className="h-4 w-4" />{copied ? (isArabic ? 'تم نسخ الرابط' : 'Link copied') : (isArabic ? 'نسخ رابط التحميل' : 'Copy download link')}</button>
              </>}
            </aside>
          </div>
          <div className="relative mt-6 flex gap-3 rounded-xl border border-amber-200/70 bg-amber-50/80 p-3 text-sm leading-6 text-amber-950 dark:border-amber-200/15 dark:bg-amber-200/[0.07] dark:text-amber-50"><Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-200" />{isArabic ? 'لأمانك، نزّل التطبيق من هذا الموقع فقط. قد يطلب Android موافقتك لتثبيت التطبيقات من هذا المصدر؛ لا يتم التثبيت تلقائيًا.' : 'For your safety, download only from this site. Android may ask you to approve installation from this source; installation is never automatic.'}</div>
          {release?.sha256 && <details className="relative mt-3 rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.55)] p-3 text-xs text-[var(--color-text-secondary)]"><summary className="cursor-pointer font-bold">SHA-256</summary><code dir="ltr" className="mt-2 block break-all text-[0.68rem]">{release.sha256}</code></details>}
          <div className="relative mt-4 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]"><ShieldCheck className="h-4 w-4 text-emerald-500" />{isArabic ? 'رابط التحميل وبيانات الإصدار من مصدر EL-JASSER الرسمي.' : 'The download link and release metadata come from the official EL-JASSER source.'}</div>
        </section>
      </div>
    </main>
  );
};

export default DownloadApp;
