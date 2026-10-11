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
        <div className="relative overflow-hidden rounded-xl border border-[color:rgb(var(--color-primary-rgb)/0.34)] border-s-4 border-s-[var(--color-secondary)] bg-[linear-gradient(135deg,rgb(var(--color-primary-rgb)/0.16),rgb(var(--color-card-rgb)/0.82))] p-4 shadow-[var(--shadow-subtle)]">
          <div className="relative flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-secondary)] text-[var(--color-button-text)] shadow-[0_10px_22px_rgb(var(--color-secondary-rgb)/0.3)]">
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
            <span className="inline-flex items-center gap-1 rounded-lg border border-[color:rgb(var(--color-primary-rgb)/0.14)] bg-[color:rgb(var(--color-surface-rgb)/0.72)] px-2.5 py-1">
              <Clock3 className="h-3 w-3 text-[var(--color-secondary)]" />
              {isArabic ? 'استجابة سريعة' : 'Fast response'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-[color:rgb(var(--color-primary-rgb)/0.14)] bg-[color:rgb(var(--color-surface-rgb)/0.72)] px-2.5 py-1">
              <ShieldCheck className="h-3 w-3 text-[var(--color-primary)]" />
              {isArabic ? 'دعم موثوق' : 'Trusted support'}
            </span>
          </div>
        </div>

        <div>
          <p className="mb-2 px-1 text-xs font-black text-[var(--color-text-secondary)]">
            {isArabic ? 'اختر طريقة التواصل' : 'Choose a contact method'}
          </p>
          <div className="grid gap-2.5">
          {contacts.map((contact) => (
            <button
              key={contact.id || contact.number}
              type="button"
              onClick={() => openContact(contact)}
              aria-label={`${isArabic ? 'التواصل مع' : 'Contact'} ${isArabic ? contact.nameAr : contact.nameEn} ${contact.number}`}
              className="group flex w-full items-center gap-3 rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.78)] bg-[color:rgb(var(--color-card-rgb)/0.72)] p-3 text-start shadow-none transition duration-200 hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-secondary-rgb)/0.58)] hover:bg-[color:rgb(var(--color-primary-rgb)/0.1)] hover:shadow-[var(--shadow-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[var(--color-button-text)] shadow-lg transition-transform duration-200 group-hover:scale-105 ${contact.type === 'phone' ? 'bg-[var(--color-secondary)] shadow-[0_10px_22px_rgb(var(--color-secondary-rgb)/0.24)]' : 'bg-[var(--color-primary)] shadow-[0_10px_22px_rgb(var(--color-primary-rgb)/0.24)]'}`}>
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
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:-translate-x-0.5 ${contact.type === 'phone' ? 'bg-[color:rgb(var(--color-secondary-rgb)/0.14)] text-[var(--color-secondary)]' : 'bg-[color:rgb(var(--color-primary-rgb)/0.14)] text-[var(--color-primary)]'}`}>
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
