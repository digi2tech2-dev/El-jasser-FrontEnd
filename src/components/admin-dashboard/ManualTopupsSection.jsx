import React from 'react';
import { Check, CreditCard, Eye, ImageOff, X } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button, { cn } from '../ui/Button';
import EmptyState from './EmptyState';
import StatusBadge from './StatusBadge';

const isPendingLike = (status) => ['pending', 'requested', 'under_review', 'processing'].includes(String(status || '').trim().toLowerCase());

const getTopupEmail = (topup, isArabic) => (
  topup?.userEmail
  || topup?.email
  || topup?.contactEmail
  || (isArabic ? 'لا يوجد بريد إلكتروني' : 'No email available')
);

const getTopupName = (topup, isArabic) => (
  topup?.userName
  || topup?.userId
  || (isArabic ? 'مستخدم غير معروف' : 'Unknown user')
);

const ManualTopupsSection = ({
  topups,
  pendingCount,
  isArabic,
  formatDate,
  formatMoney,
  onApproveTopup = null,
  onRejectTopup = null,
  onPreviewReceipt = null,
  approvingTopupId = '',
  rejectingTopupId = '',
}) => {
  return (
    <Card variant="elevated" className="mx-auto flex w-[calc(100vw-1.5rem)] max-w-[24rem] flex-col overflow-hidden p-3 sm:w-full sm:max-w-[42rem] sm:p-4 xl:max-w-none">
      <div className={cn(
        'mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between',
        isArabic ? 'items-end text-right sm:flex-row-reverse' : 'items-start text-left'
      )}>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[var(--color-text)] sm:text-lg">
            {isArabic ? 'إضافة الرصيد (الإيداعات)' : 'Add Balance (Deposits)'}
          </h2>
          <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-secondary)] sm:text-xs">
            {isArabic
              ? 'آخر 6 إيداعات مع معاينة الإيصال وإدارة الطلبات المعلّقة.'
              : 'The latest 6 deposits with receipt preview and pending-request management.'}
          </p>
        </div>
        <Badge variant={pendingCount > 0 ? 'warning' : 'premium'} className="shrink-0 px-2 py-0.5 text-[10px]">
          {isArabic ? `${pendingCount} معلّق` : `${pendingCount} pending`}
        </Badge>
      </div>

      {topups.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={isArabic ? 'لا توجد إيداعات حديثة' : 'No recent deposits'}
          description={isArabic
            ? 'ستظهر هنا أحدث إيداعات المستخدمين فور إرسالها.'
            : 'The latest user deposits will appear here as soon as they are submitted.'}
        />
      ) : (
        <div className={cn(
          'overflow-y-auto pe-1.5',
          topups.length > 2 ? 'max-h-none sm:h-[26rem]' : 'max-h-none sm:max-h-[26rem]'
        )}>
          <div className="space-y-2.5">
            {topups.map((topup) => {
              const isPending = isPendingLike(topup.status);
              const amount = Number(topup.actualPaidAmount ?? topup.requestedAmount ?? topup.amount ?? 0);
              const isApproving = String(approvingTopupId) === String(topup.id);
              const isRejecting = String(rejectingTopupId) === String(topup.id);
              const receiptUrl = topup?.proofImage || topup?.receiptImage || topup?.transferImageUrl || '';

              return (
                <article
                  key={topup.id}
                  className={`relative overflow-hidden rounded-[1.15rem] border p-3 sm:p-3.5 ${
                    isPending
                      ? 'border-[color:rgb(var(--color-warning-rgb)/0.42)] bg-[linear-gradient(135deg,rgb(var(--color-warning-rgb)/0.13),rgb(var(--color-card-rgb)/0.88))]'
                      : 'border-[color:rgb(var(--color-border-rgb)/0.85)] bg-[color:rgb(var(--color-card-rgb)/0.78)]'
                  }`}
                >
                  <span className={cn(
                    'absolute inset-y-0 w-1',
                    isArabic ? 'right-0' : 'left-0',
                    isPending ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-primary)]'
                  )} />
                  <div className={cn('flex items-start justify-between gap-2', isArabic && 'flex-row-reverse text-right')}>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[var(--color-text)]">
                        {getTopupName(topup, isArabic)}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-[var(--color-muted)]">
                        {getTopupEmail(topup, isArabic)}
                      </p>
                    </div>
                    <StatusBadge status={topup.status} isArabic={isArabic} />
                  </div>

                  <div className={cn('mt-3 grid grid-cols-2 gap-2 text-[11px]', isArabic && 'text-right')}>
                    <div className="min-w-0 rounded-xl bg-[color:rgb(var(--color-primary-rgb)/0.08)] p-2">
                      <p className="text-[10px] text-[var(--color-muted)]">{isArabic ? 'المبلغ' : 'Amount'}</p>
                      <p className="mt-0.5 truncate text-[12px] font-bold text-[var(--color-text)]">
                        {formatMoney(amount, topup.currencyCode)}
                      </p>
                    </div>
                    <div className="min-w-0 rounded-xl bg-[color:rgb(var(--color-card-rgb)/0.5)] p-2">
                      <p className="text-[10px] text-[var(--color-muted)]">{isArabic ? 'الدفع' : 'Method'}</p>
                      <p className="mt-0.5 truncate text-[12px] font-semibold text-[var(--color-text)]">
                        {topup.paymentChannel || topup.method || '-'}
                      </p>
                    </div>
                    <div className="col-span-2 min-w-0 px-1">
                      <p className="text-[10px] text-[var(--color-muted)]">{isArabic ? 'وقت الإيداع' : 'Deposit time'}</p>
                      <p className="mt-0.5 truncate text-[11px] font-medium text-[var(--color-text-secondary)]">{formatDate(topup.createdAt)}</p>
                    </div>
                  </div>

                  <div className={cn('mt-3 flex flex-wrap items-center gap-1.5 border-t border-[color:rgb(var(--color-border-rgb)/0.55)] pt-2.5', isArabic ? 'justify-start' : 'justify-end')}>
                    {receiptUrl && onPreviewReceipt ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded-xl px-2.5 text-[10px]"
                        onClick={() => onPreviewReceipt({ ...topup, receiptUrl })}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {isArabic ? 'معاينة الإيصال' : 'View receipt'}
                      </Button>
                    ) : (
                      <span className="inline-flex h-8 items-center gap-1 rounded-xl bg-[color:rgb(var(--color-border-rgb)/0.36)] px-2.5 text-[10px] text-[var(--color-muted)]">
                        <ImageOff className="h-3.5 w-3.5" />
                        {isArabic ? 'لا يوجد إيصال' : 'No receipt'}
                      </span>
                    )}

                    {isPending && onRejectTopup ? (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        className="h-8 rounded-xl px-2.5 text-[10px]"
                        onClick={() => onRejectTopup(topup)}
                        disabled={isApproving || isRejecting}
                      >
                        <X className="h-3.5 w-3.5" />
                        {isRejecting ? (isArabic ? 'جارٍ الرفض...' : 'Rejecting...') : (isArabic ? 'رفض' : 'Reject')}
                      </Button>
                    ) : null}

                    {isPending && onApproveTopup ? (
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 rounded-xl px-2.5 text-[10px]"
                        onClick={() => onApproveTopup(topup)}
                        disabled={isApproving || isRejecting}
                      >
                        {isApproving
                          ? (isArabic ? 'جارٍ الاعتماد...' : 'Approving...')
                          : <><Check className="h-3.5 w-3.5" />{isArabic ? 'قبول الإيداع' : 'Approve deposit'}</>}
                      </Button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ManualTopupsSection;
