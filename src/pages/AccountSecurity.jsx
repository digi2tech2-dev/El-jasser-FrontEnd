import React, { useMemo } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import TwoFactorCard from '../components/account/TwoFactorCard';
import useAuthStore from '../store/useAuthStore';
import { useLanguage } from '../context/LanguageContext';

const AccountSecurity = () => {
  const { user } = useAuthStore();
  const { language, dir } = useLanguage();
  const isEnglish = language === 'en';
  const isRTL = dir === 'rtl';

  const text = useMemo(
    () =>
      isEnglish
        ? {
            title: 'Account Protection',
            subtitle: 'Manage advanced security settings for your account.',
            securityOverview: 'Security Overview',
            securityHint: 'Keep two-factor authentication enabled to protect your account from unauthorized access.',
            whyMatters: 'Why Account Security Matters',
            protection: 'Account Protection',
            protectionDesc: 'Your account contains sensitive information and financial data. Enabling security features helps prevent unauthorized access.',
            dataPrivacy: 'Data Privacy',
            dataPrivacyDesc: 'Control how your personal information is used and protect it from third-party access.',
            monitoring: 'Activity Monitoring',
            monitoringDesc: 'Monitor your account activity and get alerts about unusual login attempts.',
          }
        : {
            title: 'حماية الحساب',
            subtitle: 'إدارة إعدادات الأمان المتقدمة الخاصة بحسابك.',
            securityOverview: 'ملخص الأمان',
            securityHint: 'الحفاظ على تفعيل المصادقة الثنائية يساعد في حماية حسابك من الوصول غير المصرح به.',
            whyMatters: 'لماذا يهم أمان الحساب',
            protection: 'حماية الحساب',
            protectionDesc: 'يحتوي حسابك على معلومات حساسة وبيانات مالية. تفعيل ميزات الأمان يساعد في منع الوصول غير المصرح به.',
            dataPrivacy: 'خصوصية البيانات',
            dataPrivacyDesc: 'تحكم في كيفية استخدام معلوماتك الشخصية وحمايتها من الوصول من طرف ثالث.',
            monitoring: 'مراقبة النشاط',
            monitoringDesc: 'راقب نشاط حسابك واحصل على تنبيهات حول محاولات تسجيل دخول غير عادية.',
          },
    [isEnglish]
  );

  return (
    <div className={`min-h-screen bg-[var(--color-bg)] pb-6 sm:pb-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={dir}>
      <div
        className="mx-auto w-full max-w-3xl space-y-3 px-3 sm:px-4 sm:space-y-4"
      >
        {/* Hero Header */}
        <header
          className="rounded-[18px] border border-[color:rgb(var(--color-border-rgb)/0.72)] bg-[color:rgb(var(--color-card-rgb)/0.92)] p-4 shadow-[var(--shadow-subtle)] sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-[var(--color-button-text)]"
            >
              <Shield className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-secondary)]">
                {text.securityOverview}
              </div>
              <h1 className="mt-1 text-xl font-black text-[var(--color-text)] sm:text-2xl">
                {text.title}
              </h1>
              <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-[var(--color-text-secondary)] sm:text-sm">
                {text.subtitle}
              </p>
            </div>
          </div>
        </header>

        {/* Security Alert Card */}
        <div
          className="rounded-[16px] border border-[color:rgb(var(--color-secondary-rgb)/0.3)] bg-[color:rgb(var(--color-secondary-rgb)/0.1)] p-3"
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-button-text)]"
            >
              <AlertCircle className="h-4 w-4" />
            </div>

            <div>
              <h3 className="text-sm font-bold leading-5 text-[var(--color-text)]">
                {text.securityHint}
              </h3>
              <p className="mt-1 text-xs font-medium leading-5 text-[var(--color-text-secondary)]">
                {isEnglish 
                  ? 'Enable two-factor authentication to add an extra layer of security to your account.'
                  : 'فعّل المصادقة الثنائية لإضافة طبقة أمان إضافية لحسابك.'}
              </p>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication Card */}
        <div>
          <TwoFactorCard
            userId={user?.id}
            email={String(user?.email || '')}
            twoFactorEnabled={Boolean(user?.twoFactorEnabled ?? user?.isTwoFactorEnabled)}
            emailChangedPending={false}
          />
        </div>

      </div>
    </div>
  );
};

export default AccountSecurity;
