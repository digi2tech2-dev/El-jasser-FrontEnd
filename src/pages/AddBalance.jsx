import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Bot,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Globe2,
  ShieldCheck,
  Smartphone,
  Wallet,
  Zap,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import useAuthStore from '../store/useAuthStore';
import useSystemStore from '../store/useSystemStore';
import { resolveImageUrl } from '../utils/imageUrl';
import { formatWalletNumber } from '../utils/storefront';
import { getActivePaymentGroups } from '../utils/paymentSettings';
import dragonLogo from '../assets/elgny.PNG';

const getMethodIcon = (method) => {
  const token = `${method?.type || ''} ${method?.id || ''} ${method?.name || ''}`.toLowerCase();
  if (token.includes('bank') || token.includes('تحويل')) return Building2;
  if (token.includes('wallet') || token.includes('vodafone') || token.includes('orange') || token.includes('etisalat')) return Smartphone;
  return CreditCard;
};

const PaymentMethodButton = ({ method, groupImage, onSelect }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const isVodafoneCash = /vodafone|فودافون/i.test(`${method?.name || ''} ${method?.id || ''}`);
  const Icon = isVodafoneCash ? Bot : getMethodIcon(method);
  const showImage = Boolean(method?.image) && !imageFailed;

  return (
    <button
      type="button"
      onClick={() => onSelect(method)}
      className={`wallet-payment-method-card group flex min-w-0 flex-col items-center gap-2 rounded-[1rem] border p-2.5 text-center transition-all ${isVodafoneCash ? 'wallet-payment-method-card--vodafone' : ''}`}
    >
      <span className="grid h-28 w-full shrink-0 place-items-center overflow-hidden rounded-xl border border-indigo-500/15 bg-indigo-500/[0.07] text-indigo-500 sm:h-36">
        {showImage ? (
          <img
            src={resolveImageUrl(method.image)}
            alt=""
            className="h-full w-full object-contain p-1"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Icon className="h-10 w-10" aria-label={isVodafoneCash ? 'بوت فودافون كاش' : undefined} />
        )}
      </span>
      <span className="block min-w-0 max-w-full">
        <strong
          className="block whitespace-normal break-words text-xs font-black leading-4 text-[var(--color-text)]"
          title={method.name}
        >
          {isVodafoneCash ? (
            <>
              <span className="inline-flex items-center justify-center gap-1.5">
                {method.name}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-red-400/35 bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-400">
                <Bot className="h-3 w-3" aria-hidden="true" />
                <span>دفع اوتوماتك</span>
              </span>
            </>
          ) : method.name}
        </strong>
      </span>
    </button>
  );
};

const PaymentGroupImage = ({ group, isSelected, isGlobal }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const GroupIcon = isGlobal ? Globe2 : Building2;
  const showImage = Boolean(group?.image) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [group?.image]);

  return (
    <span className={`grid h-[4.35rem] w-[4.35rem] shrink-0 place-items-center overflow-hidden rounded-full border ${
      isSelected ? 'bg-indigo-500 text-white' : 'bg-indigo-500/[0.08] text-indigo-500'
    }`}>
      {showImage ? (
        <img
          src={resolveImageUrl(group.image)}
          alt=""
          className="h-full w-full bg-white object-contain p-1"
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <GroupIcon className="h-4.5 w-4.5" />
      )}
    </span>
  );
};

const AddBalance = ({
  embedded = false,
  automaticAmount = null,
  automaticCurrency = '',
  onSelectMethod = null,
}) => {
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const paymentSettings = useSystemStore((state) => state.paymentSettings);
  const loadPaymentSettings = useSystemStore((state) => state.loadPaymentSettings);
  const isRTL = dir === 'rtl';

  useEffect(() => {
    void loadPaymentSettings({ force: true }).catch(() => null);
  }, [loadPaymentSettings]);

  const currentBalance = Number(user?.walletBalance ?? user?.coins ?? user?.balance ?? 0);
  const currentCurrency = String(user?.currency || 'USD').toUpperCase();
  const suggestedAmount = Number(automaticAmount ?? searchParams.get('amount') ?? 0);
  const suggestedCurrency = String(automaticCurrency || searchParams.get('currency') || currentCurrency).toUpperCase();
  const isAutomaticTopup = (embedded || searchParams.get('mode') === 'auto')
    && Number.isFinite(suggestedAmount)
    && suggestedAmount > 0;
  const [openGroupId, setOpenGroupId] = useState(null);

  const paymentGroups = useMemo(
    () => getActivePaymentGroups(paymentSettings, { fallbackToDefault: false }),
    [paymentSettings]
  );
  const activePaymentGroup = paymentGroups.find((group) => String(group.id) === String(openGroupId)) || null;

  useEffect(() => {
    if (!paymentGroups.length) {
      setOpenGroupId(null);
      return;
    }
    setOpenGroupId((current) => (
      paymentGroups.some((group) => String(group.id) === String(current)) ? current : null
    ));
  }, [paymentGroups]);

  const handleMethodSelect = (method) => {
    if (onSelectMethod) {
      onSelectMethod(method);
      return;
    }

    const next = new URLSearchParams();
    if (isAutomaticTopup) {
      next.set('amount', String(suggestedAmount));
      next.set('currency', suggestedCurrency);
      next.set('mode', 'auto');
    }
    const query = next.toString();
    navigate(`/wallet/payment-details/${method.id}${query ? `?${query}` : ''}`);
  };

  return (
    <div className={embedded ? 'w-full min-w-0 overflow-x-hidden pb-1' : 'min-h-full pb-6'} dir={dir}>
      <div className="mx-auto w-full min-w-0 max-w-3xl space-y-3 px-1 sm:space-y-4 sm:px-2">
        <section className="wallet-topup-hero relative isolate overflow-hidden rounded-[1.35rem] border border-[color:rgb(var(--color-primary-rgb)/0.38)] bg-[radial-gradient(22rem_circle_at_95%_-20%,rgb(var(--color-secondary-rgb)/0.26),transparent_48%),radial-gradient(18rem_circle_at_4%_115%,rgb(var(--color-primary-rgb)/0.3),transparent_52%),linear-gradient(135deg,#061426_0%,#0a2038_46%,#075a75_78%,#8b641c_125%)] p-4 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_30px_70px_-38px_rgb(var(--color-primary-rgb)/0.8),0_18px_45px_-34px_rgb(var(--color-secondary-rgb)/0.62)] sm:p-5">
          <span className="pointer-events-none absolute -end-8 -top-12 -z-10 h-32 w-32 rounded-full border border-white/10 bg-white/8 blur-[1px]" />
          <span className="pointer-events-none absolute end-12 top-2 -z-10 h-20 w-20 rounded-full bg-amber-300/20 blur-3xl" />
          <span className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(255_255_255/0.025)_1px,transparent_1px),linear-gradient(180deg,rgb(255_255_255/0.025)_1px,transparent_1px)] bg-[length:28px_28px] [mask-image:linear-gradient(110deg,black,transparent_72%)]" />
          <img src={dragonLogo} alt="" aria-hidden="true" className="wallet-topup-dragon-logo" />

          <div className="wallet-topup-hero-content relative z-10 flex items-center justify-between gap-3 sm:gap-5">
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-[color:rgb(var(--color-secondary-rgb)/0.32)] bg-[color:rgb(var(--color-secondary-rgb)/0.12)] px-2 py-1 text-[0.62rem] font-black text-[#ffe08a] backdrop-blur-md">
                <Wallet className="h-3 w-3" />
                {isRTL ? 'المحفظة' : 'Wallet'}
              </p>
              <h1 className="mt-2 text-lg font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgb(0_0_0/0.24)] sm:text-2xl">
                {t('wallet.addBalance')}
              </h1>
              <p className="mt-1 max-w-sm text-[0.68rem] font-semibold leading-5 text-[#b9eff8]/80 sm:text-xs">
                {isRTL ? 'اختر وسيلة الدفع المناسبة وأكمل البيانات' : 'Choose a payment method and complete the details'}
              </p>
            </div>

            <div className="relative shrink-0 overflow-hidden rounded-xl border border-[color:rgb(var(--color-secondary-rgb)/0.3)] bg-[linear-gradient(145deg,rgb(var(--color-card-rgb)/0.34),rgb(var(--color-primary-rgb)/0.12))] px-3 py-2.5 text-end shadow-[inset_0_1px_0_rgb(255_255_255/0.13),0_16px_35px_-26px_rgb(0_0_0/0.75)] backdrop-blur-xl sm:min-w-36 sm:px-4 sm:py-3">
              <span className="pointer-events-none absolute -end-3 -top-5 h-14 w-14 rounded-full bg-[color:rgb(var(--color-secondary-rgb)/0.2)] blur-xl" />
              <span className="relative text-[0.58rem] font-bold text-[#b9eff8]/75 sm:text-[0.65rem]">
                {isRTL ? 'الرصيد الحالي' : 'Current balance'}
              </span>
              <div className="relative mt-1 flex items-baseline justify-end gap-1.5" dir="ltr">
                <strong className="font-['Poppins'] text-xl font-extrabold tracking-tight text-white [font-variant-numeric:tabular-nums] sm:text-2xl">
                  {formatWalletNumber(currentBalance, false, { maximumFractionDigits: 3 })}
                </strong>
                <span className="rounded-md bg-[color:rgb(var(--color-secondary-rgb)/0.18)] px-1.5 py-0.5 font-['Poppins'] text-[0.58rem] font-extrabold text-[#ffe08a] sm:text-[0.65rem]">{currentCurrency}</span>
              </div>
            </div>
          </div>
        </section>

        {isAutomaticTopup ? (
          <section className="flex items-center gap-3 rounded-[1rem] border border-amber-400/25 bg-[linear-gradient(115deg,rgb(245_158_11/0.1),rgb(var(--color-primary-rgb)/0.08))] p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-[0_12px_24px_-16px_rgb(245_158_11/0.8)]">
              <Zap className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-xs font-black text-[var(--color-text)]">
                {isRTL ? 'شحن آلي لإكمال الشراء' : 'Auto top-up for your purchase'}
              </strong>
              <span className="mt-0.5 block text-[0.68rem] font-semibold text-[var(--color-text-secondary)]">
                {isRTL ? 'سنضع المبلغ المطلوب تلقائيًا بعد اختيار وسيلة الدفع' : 'The required amount will be entered automatically'}
              </span>
            </div>
            <strong className="shrink-0 text-sm font-black text-amber-600 dark:text-amber-300" dir="ltr">
              {formatWalletNumber(suggestedAmount, false, { maximumFractionDigits: 3 })} {suggestedCurrency}
            </strong>
          </section>
        ) : null}

        <section className="wallet-payment-flow">
          {activePaymentGroup ? (
            <div className="wallet-payment-method-page">
              <div className="wallet-payment-page-header">
                <button
                  type="button"
                  onClick={() => setOpenGroupId(null)}
                  className="wallet-payment-back-button"
                >
                  {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  <span>{isRTL ? 'المجموعات' : 'Groups'}</span>
                </button>
                <span className="wallet-payment-step">{isRTL ? 'الخطوة 2 من 2' : 'Step 2 of 2'}</span>
              </div>

              <div className="wallet-payment-selected-group">
                <PaymentGroupImage
                  group={activePaymentGroup}
                  isSelected
                  isGlobal={String(activePaymentGroup.currency || '').toUpperCase() === 'USD' || /global|عالمي/i.test(String(activePaymentGroup.name || ''))}
                />
                <div className="min-w-0 flex-1">
                  <span className="wallet-payment-eyebrow">{isRTL ? 'وسائل الدفع المتاحة' : 'Available payment methods'}</span>
                  <h2>{activePaymentGroup.name}</h2>
                  <p>{activePaymentGroup.description || (isRTL ? 'اختر الوسيلة التي تناسبك لإكمال الشحن' : 'Choose the method that suits you to complete your top-up')}</p>
                </div>
                {activePaymentGroup.currency ? (
                  <span className="wallet-payment-currency">{String(activePaymentGroup.currency).toUpperCase()}</span>
                ) : null}
              </div>

              <div className="wallet-payment-methods-grid">
                {activePaymentGroup.methods.map((method) => (
                  <PaymentMethodButton
                    key={method.id}
                    method={method}
                    groupImage={activePaymentGroup.image}
                    onSelect={handleMethodSelect}
                    isRTL={isRTL}
                  />
                ))}
              </div>

              <aside className="wallet-payment-tips" aria-label={isRTL ? 'نصائح قبل الدفع' : 'Payment tips'}>
                <div className="wallet-payment-tips-heading">
                  <span aria-hidden="true">✦</span>
                  <div>
                    <h3>{isRTL ? 'نصائح قبل الدفع' : 'Tips before payment'}</h3>
                    <p>{isRTL ? 'خطوات بسيطة لحماية عملية الشحن' : 'A few steps to keep your top-up safe'}</p>
                  </div>
                </div>
                <div className="wallet-payment-tips-list">
                  <p><b>1</b>{isRTL ? 'تأكد من اسم الوسيلة والمبلغ قبل التحويل.' : 'Confirm the payment method and amount before transferring.'}</p>
                  <p><b>2</b>{isRTL ? 'احتفظ بإيصال التحويل حتى يكتمل الشحن.' : 'Keep your transfer receipt until the top-up is completed.'}</p>
                  <p><b>3</b>{isRTL ? 'لا تشارك رمز التحقق أو بيانات حسابك مع أي شخص.' : 'Never share verification codes or account details with anyone.'}</p>
                </div>
              </aside>
            </div>
          ) : !paymentGroups.length ? (
            <div className="rounded-[1rem] border border-dashed border-[color:rgb(var(--color-border-rgb)/0.82)] px-4 py-8 text-center">
              <Wallet className="mx-auto h-7 w-7 text-[var(--color-text-secondary)]" />
              <h3 className="mt-2 text-sm font-black text-[var(--color-text)]">
                {isRTL ? 'لا توجد وسائل دفع متاحة الآن' : 'No payment methods available'}
              </h3>
              <p className="mt-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                {isRTL ? 'يرجى المحاولة لاحقًا أو التواصل مع الدعم' : 'Try again later or contact support'}
              </p>
            </div>
          ) : (
            <div className="wallet-payment-groups-page">
              <div className="wallet-payment-page-header wallet-payment-page-header--groups">
                <span className="wallet-payment-header-icon"><CreditCard className="h-4.5 w-4.5" /></span>
                <div>
                  <span className="wallet-payment-eyebrow">{isRTL ? '1 / 2' : '1 / 2'}</span>
                  <h2>{isRTL ? 'اختر التحويل' : 'Choose transfer'}</h2>
                  <p>{isRTL ? 'اختر البلد أو العملة' : 'Choose country or currency'}</p>
                </div>
              </div>

              <div className="wallet-payment-groups-grid">
                {paymentGroups.map((group) => {
                  const isGlobal = String(group.currency || '').toUpperCase() === 'USD' || /global|عالمي/i.test(String(group.name || ''));
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setOpenGroupId(group.id)}
                      className="wallet-payment-group-card"
                    >
                      <PaymentGroupImage group={group} isSelected={false} isGlobal={isGlobal} />
                      <strong title={group.name}>{group.name}</strong>
                      <span>{group.currency ? String(group.currency).toUpperCase() : `${group.methods.length} ${isRTL ? 'وسائل' : 'methods'}`}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <div className="flex items-center justify-center gap-2 py-1 text-[0.68rem] font-semibold text-[var(--color-text-secondary)]">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          {isRTL ? 'بيانات التحويل محمية وتُراجع بأمان' : 'Payment details are protected and reviewed securely'}
        </div>
      </div>
    </div>
  );
};

export default AddBalance;
