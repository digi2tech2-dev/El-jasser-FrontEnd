import React from 'react';
import { Code2 } from 'lucide-react';
import { buildPhoneLink, buildWhatsAppLink, getSupportPhoneNumber } from '../../utils/whatsapp';

const ENGINEERS_WHATSAPP_URL = buildWhatsAppLink({
  number: '01019603238',
  message: 'مرحبًا، أريد تصميم موقع مشابه لـ El-Jasser Card.',
});
const SITE_MANAGER_PHONE = getSupportPhoneNumber();

const SiteCopyrightFooter = ({ isArabic, showEngineerContact = true }) => (
  <footer className="mx-auto w-full max-w-[var(--shell-max-width)] border-t border-[color:rgb(var(--color-border-rgb)/0.48)] px-3 py-5 sm:px-4 sm:py-6 md:px-6 lg:px-8">
    <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-start" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="space-y-1">
          <p className="text-[0.78rem] font-black tracking-[0.04em] text-[var(--color-text)] sm:text-sm">
            © 2026 El-Jasser Card
          </p>
          <p className="text-[0.64rem] font-semibold leading-5 text-[var(--color-text-secondary)] sm:text-[0.7rem]">
            {isArabic
              ? 'حقوق الملكية محفوظة بعناية · صُنعت الهوية والتجربة لتبقى خاصة بالعلامة.'
              : 'Copyright protected · Brand identity and experience are reserved for this store.'}
          </p>
          <a
            href={buildPhoneLink(SITE_MANAGER_PHONE)}
            className="inline-flex text-[0.64rem] font-bold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)] hover:underline hover:underline-offset-4 sm:text-[0.7rem]"
          >
            {isArabic
              ? `اضغط هنا للتواصل مع مسؤول الموقع: ${SITE_MANAGER_PHONE}`
              : `Contact the site manager: ${SITE_MANAGER_PHONE}`}
          </a>
        </div>

        {showEngineerContact ? (
          <a
            href={ENGINEERS_WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={isArabic ? 'التواصل مع مهندسي البرمجة لتصميم موقع مشابه' : 'Contact software engineers for a similar website design'}
            className="inline-flex items-center gap-1.5 text-[0.64rem] font-bold text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline hover:underline-offset-4 sm:text-[0.7rem]"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>{isArabic ? 'اطلب الآن منصة خاصة بك · فريق DIGI TECH' : 'Launch your own platform · DIGI TECH'}</span>
          </a>
        ) : null}
      </div>
  </footer>
);

export default SiteCopyrightFooter;
