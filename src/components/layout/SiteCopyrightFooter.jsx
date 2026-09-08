import React from 'react';
import { Code2 } from 'lucide-react';
import { buildWhatsAppLink } from '../../utils/whatsapp';

const ENGINEERS_WHATSAPP_URL = buildWhatsAppLink({
  number: '01019603238',
  message: 'مرحبًا، أريد تصميم موقع مشابه لـ El-Jasser Card.',
});

const SiteCopyrightFooter = ({ isArabic, showEngineerContact = true }) => (
  <footer className="mx-auto w-full max-w-[var(--shell-max-width)] px-3 pb-6 sm:px-4 md:px-6 lg:px-8">
    <div className="relative overflow-hidden rounded-[1.6rem] border border-[color:rgb(var(--color-border-rgb)/0.72)] bg-[linear-gradient(145deg,rgb(var(--color-card-rgb)/0.94),rgb(var(--color-elevated-rgb)/0.66))] px-4 py-5 shadow-[var(--shadow-subtle)] backdrop-blur-xl sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.16)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-40 w-40 rounded-full bg-orange-400/10 blur-3xl" />
      <div className="relative flex flex-col items-center gap-3 text-center lg:flex-row lg:justify-between lg:text-start">
        <div className="space-y-1.5 text-center lg:text-start">
          <p className="text-[0.82rem] font-black tracking-[0.04em] text-[var(--color-text)] sm:text-sm">
            © 2026 El-Jasser Card
          </p>
          <p className="mx-auto max-w-xl text-[0.65rem] font-semibold leading-5 text-[var(--color-text-secondary)] lg:mx-0 sm:text-[0.72rem]">
            {isArabic
              ? 'حقوق الملكية محفوظة بعناية · صُنعت الهوية والتجربة لتبقى خاصة بالعلامة.'
              : 'Copyright protected · Brand identity and experience are reserved for this store.'}
          </p>
        </div>

        {showEngineerContact ? (
          <a
            href={ENGINEERS_WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={isArabic ? 'التواصل مع مهندسي البرمجة لتصميم موقع مشابه' : 'Contact software engineers for a similar website design'}
            className="group inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-[0.58rem] font-semibold text-[var(--color-text-secondary)] opacity-70 transition-all hover:text-[var(--color-primary)] hover:opacity-100"
          >
            <Code2 className="h-3 w-3" />
            <span>{isArabic ? 'اطلب الآن منصة خاصة بك · فريق DIGI TECH' : 'Launch your own platform · DIGI TECH'}</span>
          </a>
        ) : null}
      </div>
    </div>
  </footer>
);

export default SiteCopyrightFooter;
