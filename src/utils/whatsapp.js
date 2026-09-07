const SUPPORT_PHONE_NUMBER = '01060682018';
const SUPPORT_WHATSAPP_NUMBER = '01144558644';
const SUPPORT_WHATSAPP_NUMBER_2 = '+96597178814';
const SUPPORT_CONTACTS = Object.freeze([
  {
    id: 'phone',
    type: 'phone',
    nameAr: 'دعم دراجون',
    nameEn: 'Dra90n Support',
    number: SUPPORT_PHONE_NUMBER,
  },
  {
    id: 'whatsapp',
    type: 'whatsapp',
    nameAr: 'دعم دراجون',
    nameEn: 'Dra90n Support',
    number: SUPPORT_WHATSAPP_NUMBER,
  },
  {
    id: 'whatsapp-2',
    type: 'whatsapp',
    nameAr: 'دعم دراجون 2',
    nameEn: 'Dra90n Support 2',
    number: SUPPORT_WHATSAPP_NUMBER_2,
  },
]);
const FALLBACK_WHATSAPP_NUMBER = SUPPORT_WHATSAPP_NUMBER;
const ENV_ADMIN_WHATSAPP_NUMBER =
  import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER
  || import.meta.env.ADMIN_WHATSAPP_NUMBER
  || '';

export const normalizeWhatsAppNumber = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return FALLBACK_WHATSAPP_NUMBER;

  // Support local numbers like 010xxxxxxxx by defaulting to Egypt country code.
  if (digits.startsWith('0') && digits.length >= 10) {
    return `20${digits.replace(/^0+/, '')}`;
  }

  return digits;
};

export const buildWhatsAppLink = ({ number, message = '' }) => {
  const normalizedNumber = normalizeWhatsAppNumber(number);
  const text = String(message || '').trim();
  const suffix = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${normalizedNumber}${suffix}`;
};

export const buildPhoneLink = (number) => {
  const value = String(number || '').trim().replace(/[^\d+]/g, '');
  return value ? `tel:${value}` : '';
};

export const getDefaultWhatsAppNumber = () => FALLBACK_WHATSAPP_NUMBER;
export const getAdminWhatsAppNumber = () => normalizeWhatsAppNumber(ENV_ADMIN_WHATSAPP_NUMBER || FALLBACK_WHATSAPP_NUMBER);
export const getSupportPhoneNumber = () => SUPPORT_PHONE_NUMBER;
export const getSupportContacts = () => SUPPORT_CONTACTS;
