const SUPPORT_PHONE_NUMBER = '01092301323';
const SUPPORT_WHATSAPP_NUMBER = '01201111390';
const SUPPORT_WHATSAPP_NUMBER_2 = '01270347430';
const SUPPORT_CONTACTS = Object.freeze([
  {
    id: 'phone',
    type: 'phone',
    nameAr: 'عمو المدير',
    nameEn: 'Manager',
    number: SUPPORT_PHONE_NUMBER,
  },
  {
    id: 'whatsapp',
    type: 'whatsapp',
    nameAr: 'نائب المدير',
    nameEn: 'Deputy Manager',
    number: SUPPORT_WHATSAPP_NUMBER,
  },
  {
    id: 'whatsapp-2',
    type: 'whatsapp',
    nameAr: 'خدمة عملاء',
    nameEn: 'Customer Service',
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
export const resolveSupportContacts = (value, isArabic = true) => {
  const defaultEntries = () => SUPPORT_CONTACTS.map((contact, index) => ({
    id: `default-${index}`, name: isArabic ? (contact.nameAr || contact.nameEn) : (contact.nameEn || contact.nameAr),
    role: isArabic ? 'خدمة العملاء' : 'Customer support', number: `+${normalizeWhatsAppNumber(contact.number)}`,
  }));
  if (!value) return defaultEntries();
  if (Array.isArray(value?.entries)) return value.entries.length || Number(value.revision || 0) > 0 ? value.entries : defaultEntries();
  if (value?.owner || value?.support) return [
    ...(value.owner ? [{ id: 'legacy-owner', name: isArabic ? 'صاحب الموقع' : 'Site owner', role: isArabic ? 'الإدارة' : 'Management', number: value.owner }] : []),
    ...(value.support ? [{ id: 'legacy-support', name: isArabic ? 'خدمة العملاء' : 'Customer support', role: isArabic ? 'الدعم' : 'Support', number: value.support }] : []),
  ];
  return [];
};
export const getSupportContacts = (value = null) => {
  const entries = value && (Array.isArray(value.entries) || value.owner || value.support)
    ? resolveSupportContacts(value) : SUPPORT_CONTACTS;
  return entries.map((contact) => ({
    ...contact, type: contact.type || 'whatsapp',
    nameAr: contact.nameAr || contact.name || contact.nameEn || '',
    nameEn: contact.nameEn || contact.name || contact.nameAr || '',
  }));
};
