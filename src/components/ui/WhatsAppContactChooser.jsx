import React from 'react';
import { ArrowUpLeft, Clock3, Headphones, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import Modal from './Modal';
import { buildPhoneLink, buildWhatsAppLink, getSupportContacts } from '../../utils/whatsapp';

const WhatsAppContactChooser = ({ isOpen, onClose, message = '', isArabic = true }) => {
  const contacts = getSupportContacts();

  const openContact = (contact) => {
    if (contact.type === 'phone') {
      window.location.href = buildPhoneLink(contact.number);
    } else {
      window.open(buildWhatsAppLink({ number: contact.number, message }), '_blank', 'noopener,noreferrer');
    }
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xs"
      title={isArabic ? 'تواصل مع فريق El-Jasser' : 'Contact the El-Jasser team'}
    >
      <div dir={isArabic ? 'rtl' : 'ltr'} className="space-y-4">
        <div className="relative overflow-hidden rounded-[1.35rem] border border-[color:rgb(var(--color-primary-rgb)/0.22)] bg-[radial-gradient(circle_at_85%_0%,rgb(var(--color-primary-rgb)/0.25),transparent_42%),linear-gradient(135deg,rgb(var(--color-primary-rgb)/0.13),rgb(var(--color-card-rgb)/0.72))] p-4 shadow-[0_18px_38px_-28px_rgb(var(--color-primary-rgb)/0.85)]">
          <div className="absolute -left-7 -top-8 h-20 w-20 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.12)] blur-xl" />
          <div className="relative flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--color-primary)] text-white shadow-[0_12px_24px_rgb(var(--color-primary-rgb)/0.3)]">
              <Headphones className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-[var(--color-text)]">
                {isArabic ? 'دعم الجاسر معك' : 'El-Jasser Support is here'}
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[var(--color-text-secondary)]">
                {isArabic ? 'اختر الطريقة الأنسب لك وسنساعدك فورًا' : 'Choose the channel that works best for you'}
              </p>
            </div>
          </div>
          <div className="relative mt-3 flex flex-wrap gap-2 text-[10px] font-extrabold text-[var(--color-text-secondary)]">
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:rgb(var(--color-surface-rgb)/0.72)] px-2.5 py-1">
              <Clock3 className="h-3 w-3 text-[var(--color-primary)]" />
              {isArabic ? 'استجابة سريعة' : 'Fast response'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:rgb(var(--color-surface-rgb)/0.72)] px-2.5 py-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              {isArabic ? 'دعم موثوق' : 'Trusted support'}
            </span>
          </div>
        </div>

        <div>
          <p className="mb-2 px-1 text-xs font-black uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            {isArabic ? 'اختر طريقة التواصل' : 'Choose a contact method'}
          </p>
          <div className="grid gap-2.5">
          {contacts.map((contact) => (
            <button
              key={contact.id || contact.number}
              type="button"
              onClick={() => openContact(contact)}
              aria-label={`${isArabic ? 'التواصل مع' : 'Contact'} ${isArabic ? contact.nameAr : contact.nameEn} ${contact.number}`}
              className="group flex w-full items-center gap-3 rounded-[1.2rem] border border-[color:rgb(var(--color-border-rgb)/0.78)] bg-[color:rgb(var(--color-surface-rgb)/0.62)] p-3 text-start shadow-[0_10px_28px_-24px_rgb(0_0_0/0.9)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.5)] hover:bg-[color:rgb(var(--color-card-rgb)/0.9)] hover:shadow-[var(--shadow-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
            >
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white shadow-lg transition-transform duration-200 group-hover:scale-105 ${contact.type === 'phone' ? 'bg-[var(--color-primary)] shadow-[0_10px_22px_rgb(var(--color-primary-rgb)/0.2)]' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
                {contact.type === 'phone' ? <Phone className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block text-sm font-black text-[var(--color-text)]">
                  {isArabic ? contact.nameAr : contact.nameEn}
                </strong>
                <span dir="ltr" className="mt-1 block text-xs font-bold tracking-wide text-[var(--color-text-secondary)]">
                  {contact.number}
                </span>
              </span>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:-translate-x-0.5 ${contact.type === 'phone' ? 'bg-[color:rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]' : 'bg-emerald-500/10 text-emerald-500'}`}>
                <ArrowUpLeft className="h-4 w-4" />
              </span>
            </button>
          ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WhatsAppContactChooser;
