import React, { useEffect, useState } from 'react';
import { ArrowUpLeft, Boxes, CheckCircle2, ClipboardList, ImagePlus, Target } from 'lucide-react';
import AdminOrdersTable from '../../components/target/AdminOrdersTable';
import AdminProducts from '../../components/target/AdminProducts';
import RejectionReasonModal from '../../components/target/RejectionReasonModal';
import TargetOrderDetailsModal from '../../components/target/TargetOrderDetailsModal';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import useTargetStore from '../../store/useTargetStore';
import useAuthStore from '../../store/useAuthStore';
import useSystemStore from '../../store/useSystemStore';
import { useToast } from '../../components/ui/Toast';
import { formatNumber } from '../../utils/intl';
import { PERMISSIONS, hasPermission } from '../../utils/permissions';
import { getTargetPaymentMethods } from '../../utils/paymentSettings';

const AdminPaymentProofModal = ({ request, isSubmitting, onClose, onConfirm }) => {
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    setProofFile(null);
    setPreviewUrl('');
  }, [request?.id]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  if (!request) return null;

  const selectProof = (file) => {
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setProofFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };
  const appName = request.appNameSnapshot || request.productName || request.app?.name || 'طلب تارجت';
  const customer = request.userName || request.customerName || request.userEmail || request.userId || '-';
  const paymentMethod = request.paymentMethodName || request.paymentMethod || '-';
  const paymentAccount = request.transferNumber || request.paymentAccount || '-';

  return (
    <Modal isOpen={Boolean(request)} onClose={isSubmitting ? undefined : onClose} title="تأكيد دفع قيمة التارجت" size="lg" className="z-[260]">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (proofFile && !isSubmitting) onConfirm(proofFile);
        }}
      >
        <div className="grid gap-2 rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.78)] bg-[color:rgb(var(--color-surface-rgb)/0.55)] p-3 text-sm sm:grid-cols-2">
          <p><span className="text-[var(--color-text-secondary)]">العميل: </span><strong>{customer}</strong></p>
          <p><span className="text-[var(--color-text-secondary)]">التطبيق: </span><strong>{appName}</strong></p>
          <p><span className="text-[var(--color-text-secondary)]">كمية التارجت: </span><strong>{formatNumber(request.coinAmount || request.quantity, 'en-US')}</strong></p>
          <p><span className="text-[var(--color-text-secondary)]">المبلغ المستحق: </span><strong>{formatNumber(request.totalPrice, 'en-US', { maximumFractionDigits: 2 })} EGP</strong></p>
          <p><span className="text-[var(--color-text-secondary)]">طريقة الاستلام: </span><strong>{paymentMethod}</strong></p>
          <p className="break-all"><span className="text-[var(--color-text-secondary)]">رقم/حساب التحويل: </span><strong>{paymentAccount}</strong></p>
        </div>

        <div>
          <p className="mb-2 text-sm font-black text-[var(--color-text)]">إثبات تحويل المبلغ للمستخدم</p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[color:rgb(var(--color-primary-rgb)/0.45)] bg-[color:rgb(var(--color-primary-rgb)/0.06)] p-5 text-center">
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={isSubmitting} onChange={(event) => selectProof(event.target.files?.[0])} />
            <ImagePlus className="h-7 w-7 text-[var(--color-primary)]" />
            <span className="text-sm font-bold text-[var(--color-primary)]">{proofFile ? proofFile.name : 'اختر صورة الإثبات'}</span>
            <span className="text-xs text-[var(--color-text-secondary)]">JPG أو PNG أو WebP — صورة واحدة مطلوبة</span>
          </label>
          {previewUrl ? <img src={previewUrl} alt="معاينة إثبات دفع الموقع" className="mt-3 max-h-64 w-full rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.78)] object-contain" /> : null}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onClose}>إلغاء</Button>
          <Button type="submit" disabled={!proofFile || isSubmitting}>
            <CheckCircle2 className="h-4 w-4" />
            {isSubmitting ? 'جارٍ الحفظ...' : 'تأكيد الدفع وقبول الطلب'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const AdminTargetRequests = () => {
  const {
    products,
    requests,
    addProduct,
    updateProduct,
    deleteProduct,
    loadApps,
    loadRequests,
    updateRequestStatus,
    approveTargetRequest,
  } = useTargetStore();
  const { paymentSettings, loadPaymentSettings } = useSystemStore();
  const { user: actor } = useAuthStore();
  const { addToast } = useToast();
  const [rejectingRequest, setRejectingRequest] = useState(null);
  const [approvingRequest, setApprovingRequest] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isRequestsPanelOpen, setIsRequestsPanelOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const canConfirmTargetRequests = hasPermission(actor, PERMISSIONS.CONFIRM_TARGET_REQUESTS);

  useEffect(() => {
    void loadApps({ includeInactive: true });
    void loadRequests({ page: 1, limit: 100 });
    void loadPaymentSettings({ force: true });
  }, [loadApps, loadRequests, loadPaymentSettings]);

  const paymentMethods = getTargetPaymentMethods(paymentSettings);

  const handleAddProduct = async (payload) => {
    await addProduct(payload);
    addToast('تم إنشاء تطبيق التارجت بنجاح.', 'success');
  };

  const handleUpdateProduct = async (id, payload) => {
    await updateProduct(id, payload);
    addToast('تم تحديث تطبيق التارجت بنجاح.', 'success');
  };

  const handleDeleteProduct = async (id) => {
    await deleteProduct(id);
    addToast('تم تعطيل تطبيق التارجت.', 'success');
  };

  const handleStatusChange = async (id, status) => {
    if (!canConfirmTargetRequests) {
      addToast('ليس لديك صلاحية مراجعة طلبات التارجت.', 'error');
      return;
    }

    if (String(status).toUpperCase() === 'REJECTED') {
      setRejectingRequest(requests.find((request) => String(request.id) === String(id)) || { id });
      return;
    }

    if (['APPROVED', 'APPROVE', 'DONE'].includes(String(status).toUpperCase())) {
      setApprovingRequest(requests.find((request) => String(request.id) === String(id)) || { id });
      return;
    }

    setIsStatusUpdating(true);
    try {
      const updated = await updateRequestStatus(id, status, { rejectionReason: '' });
      setSelectedRequest((current) => (String(current?.id) === String(id) ? { ...current, ...updated } : current));
      addToast('تم تحديث حالة طلب التارجت.', 'success');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleConfirmApproval = async (proofFile) => {
    if (!approvingRequest?.id || !proofFile) return;
    setIsStatusUpdating(true);
    try {
      const updated = await approveTargetRequest(approvingRequest.id, proofFile);
      setSelectedRequest((current) => (String(current?.id) === String(approvingRequest.id) ? { ...current, ...updated } : current));
      setApprovingRequest(null);
      addToast('تم تأكيد الدفع وقبول طلب التارجت.', 'success');
    } catch (error) {
      addToast(error?.message || 'تعذر تأكيد دفع طلب التارجت.', 'error');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleConfirmReject = async (reason) => {
    if (!rejectingRequest?.id) return;
    setIsStatusUpdating(true);
    try {
      const updated = await updateRequestStatus(rejectingRequest.id, 'REJECTED', { adminNotes: reason, rejectionReason: reason });
      setSelectedRequest((current) => (String(current?.id) === String(rejectingRequest.id) ? { ...current, ...updated } : current));
      setRejectingRequest(null);
      addToast('تم رفض طلب التارجت.', 'success');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const pendingCount = requests.filter((request) => String(request.status).toUpperCase() === 'PENDING').length;
  const completedCount = requests.filter((request) => String(request.status).toUpperCase() === 'APPROVED').length;

  return (
    <div className="min-w-0 space-y-4 text-[var(--color-text)] sm:space-y-5">
      <section className="overflow-hidden rounded-[1.4rem] border border-sky-500/20 bg-[radial-gradient(26rem_circle_at_top_right,rgb(14_165_233/0.12),transparent_48%),linear-gradient(135deg,rgb(var(--color-card-rgb)/0.98),rgb(var(--color-surface-rgb)/0.9))] p-3.5 shadow-[0_20px_55px_-44px_rgb(14_165_233/0.52)] sm:p-4">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/15">
              <Target className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-base font-black text-[var(--color-text)] sm:text-xl">تطبيقات وطلبات التارجت</h1>
              <p className="mt-0.5 text-[11px] leading-5 text-[var(--color-text-secondary)] sm:text-xs">
              إدارة تطبيقات التارجت ومراجعة طلبات العملاء من لوحة التحكم.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 lg:w-[24rem]">
            <div className="flex items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/[0.07] px-2.5 py-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-500"><Boxes className="h-3.5 w-3.5" /></span>
              <div>
                <p className="text-base font-black leading-none text-sky-500">{formatNumber(products.length, 'en-US')}</p>
                <p className="mt-1 text-[9px] text-[var(--color-text-secondary)] sm:text-[10px]">التطبيقات</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-2.5 py-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500"><ClipboardList className="h-3.5 w-3.5" /></span>
              <div>
                <p className="text-base font-black leading-none text-amber-500">{formatNumber(pendingCount, 'en-US')}</p>
                <p className="mt-1 text-[9px] text-[var(--color-text-secondary)] sm:text-[10px]">قيد المراجعة</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-2.5 py-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500"><CheckCircle2 className="h-3.5 w-3.5" /></span>
              <div>
                <p className="text-base font-black leading-none text-emerald-500">{formatNumber(completedCount, 'en-US')}</p>
                <p className="mt-1 text-[9px] text-[var(--color-text-secondary)] sm:text-[10px]">المقبولة</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.4rem] border border-indigo-500/20 bg-[radial-gradient(22rem_circle_at_left,rgb(99_102_241/0.1),transparent_60%),linear-gradient(135deg,rgb(var(--color-card-rgb)/0.96),rgb(var(--color-surface-rgb)/0.82))] p-3.5 shadow-[0_20px_55px_-46px_rgb(99_102_241/0.6)] sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/15">
              <ClipboardList className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-[var(--color-text)] sm:text-base">طلبات التارجت</h2>
              <p className="mt-0.5 text-[11px] leading-5 text-[var(--color-text-secondary)] sm:text-xs">
                افتح الطلبات في خانة مستقلة لمراجعة التحويلات والإثباتات بدون ازدحام الصفحة.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5 text-[10px] font-bold text-amber-500">
              <ClipboardList className="h-3.5 w-3.5" />
              {formatNumber(pendingCount, 'en-US')} قيد المراجعة
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-bold text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {formatNumber(completedCount, 'en-US')} مقبولة
            </span>
            <Button type="button" variant="secondary" className="h-9 rounded-xl border-indigo-500/25 bg-indigo-500/10 px-3 text-xs text-indigo-500 hover:border-indigo-500/40 hover:bg-indigo-500/15" onClick={() => setIsRequestsPanelOpen(true)}>
              فتح الطلبات
              <ArrowUpLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </section>

      <AdminProducts
        products={products}
        paymentMethods={paymentMethods}
        onAdd={handleAddProduct}
        onUpdate={handleUpdateProduct}
        onDelete={handleDeleteProduct}
      />

      <Modal
        isOpen={isRequestsPanelOpen}
        onClose={() => setIsRequestsPanelOpen(false)}
        title="طلبات التارجت"
        size="xl"
        className="z-[240]"
        placement="bottom"
      >
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-sky-500/15 bg-sky-500/[0.06] p-2.5 text-center">
              <p className="text-[9px] text-[var(--color-text-secondary)] sm:text-[10px]">كل الطلبات</p>
              <p className="mt-1 text-lg font-black leading-none text-sky-500">{formatNumber(requests.length, 'en-US')}</p>
            </div>
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.06] p-2.5 text-center">
              <p className="text-[9px] text-[var(--color-text-secondary)] sm:text-[10px]">قيد المراجعة</p>
              <p className="mt-1 text-lg font-black leading-none text-amber-500">{formatNumber(pendingCount, 'en-US')}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06] p-2.5 text-center">
              <p className="text-[9px] text-[var(--color-text-secondary)] sm:text-[10px]">المقبولة</p>
              <p className="mt-1 text-lg font-black leading-none text-emerald-500">{formatNumber(completedCount, 'en-US')}</p>
            </div>
          </div>

          <div className="lg:rounded-[1.25rem] lg:border lg:border-[color:rgb(var(--color-border-rgb)/0.78)] lg:bg-[color:rgb(var(--color-card-rgb)/0.72)] lg:p-2">
            <AdminOrdersTable
              requests={requests}
              onStatusChange={handleStatusChange}
              onViewDetails={(request) => setSelectedRequest(request)}
              canConfirm={canConfirmTargetRequests}
              showHeader={false}
            />
          </div>
        </div>
      </Modal>

      <RejectionReasonModal
        isOpen={Boolean(rejectingRequest)}
        onClose={() => setRejectingRequest(null)}
        onConfirm={handleConfirmReject}
      />

      <AdminPaymentProofModal
        request={approvingRequest}
        isSubmitting={isStatusUpdating}
        onClose={() => setApprovingRequest(null)}
        onConfirm={handleConfirmApproval}
      />

      <TargetOrderDetailsModal
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        order={selectedRequest}
        canManage={canConfirmTargetRequests}
        isUpdating={isStatusUpdating}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default AdminTargetRequests;
