import { useEffect, useState } from 'react';
import { Download, ShieldCheck, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { checkForAndroidUpdate, getReleaseNotesForLanguage } from '../../services/appUpdate';

let updateCheckPromise = null;

const checkOncePerAppLoad = () => {
  if (!updateCheckPromise) updateCheckPromise = checkForAndroidUpdate();
  return updateCheckPromise;
};

const AppUpdateController = () => {
  const { i18n } = useTranslation();
  const [update, setUpdate] = useState(null);

  useEffect(() => {
    let cancelled = false;
    void checkOncePerAppLoad()
      .then((result) => {
        if (!cancelled && result?.status && result.status !== 'none') setUpdate(result);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (!update) return null;

  const isArabic = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('ar');
  const required = update.status === 'required';
  const notes = getReleaseNotesForLanguage(update.releaseNotes, isArabic ? 'ar' : 'en');

  const openUpdate = () => {
    if (typeof window === 'undefined') return;
    // This is a standard same-origin browser navigation, so it also works in
    // old WebView shells that do not contain a download native plugin.
    window.location.assign(update.apkUrl);
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onClick={required ? undefined : () => setUpdate(null)}
    >
      <section
        dir={isArabic ? 'rtl' : 'ltr'}
        role="dialog"
        aria-modal="true"
        aria-labelledby="android-update-title"
        className="relative w-full max-w-md overflow-hidden rounded-[1.45rem] border border-cyan-200/30 bg-[linear-gradient(145deg,#071c2d,#0b1325_58%,#161127)] p-5 text-white shadow-[0_28px_70px_-25px_rgba(2,8,23,0.95)] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-amber-300/15 blur-3xl" />
        <div className="relative">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/30 bg-cyan-300/10 text-cyan-100 shadow-[0_14px_28px_-18px_rgba(34,211,238,0.9)]">
              {required ? <ShieldCheck className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200/80">EL-JASSER</p>
              <h2 id="android-update-title" className="mt-1 text-xl font-black">
                {required ? (isArabic ? 'يلزم تحديث التطبيق' : 'App update required') : (isArabic ? 'يتوفر تحديث جديد' : 'A new update is available')}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-200">
                {required
                  ? (isArabic ? 'يلزم تحديث التطبيق إلى أحدث إصدار للمتابعة.' : 'Update the app to the latest version to continue.')
                  : (isArabic ? 'يتوفر إصدار جديد من تطبيق EL-JASSER.' : 'A newer version of the EL-JASSER app is ready.')}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm">
            <span className="text-slate-300">{isArabic ? 'الإصدار' : 'Version'}</span>
            <span dir="ltr" className="ms-2 font-black text-amber-100">{update.latestVersionName}</span>
          </div>

          {notes.length > 0 && (
            <ul className="mt-4 space-y-2 rounded-xl border border-white/10 bg-black/10 p-3 text-sm leading-6 text-slate-100">
              {notes.map((note) => <li key={note} className="flex gap-2"><span className="text-cyan-300">•</span><span>{note}</span></li>)}
            </ul>
          )}

          {update.legacy && (
            <p className="mt-3 text-xs leading-5 text-slate-300">
              {isArabic ? 'هذا الإصدار القديم لا يدعم قراءة رقم الإصدار تلقائيًا.' : 'This older installation cannot report its version automatically.'}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={openUpdate}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#0e9fbd,#075d8d)] px-4 text-sm font-black text-white shadow-[0_16px_30px_-17px_rgba(34,211,238,0.9)] transition hover:-translate-y-0.5 hover:brightness-110"
            >
              <Download className="h-4 w-4" />
              {isArabic ? 'تحديث الآن' : 'Update now'}
            </button>
            {!required && (
              <button
                type="button"
                onClick={() => setUpdate(null)}
                className="min-h-11 rounded-xl border border-white/15 bg-white/[0.06] px-5 text-sm font-bold text-slate-100 transition hover:bg-white/10"
              >
                {isArabic ? 'لاحقًا' : 'Later'}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AppUpdateController;
