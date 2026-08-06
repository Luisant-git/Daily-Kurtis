export function normalizePhone(phone: string | undefined | null): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  let cleanPhone = phone.replace(/\D/g, '');
  
  // If it's a 12-digit Indian number starting with 91, strip the 91
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    return cleanPhone.substring(2);
  }
  
  return cleanPhone;
}

export function formatForWhatsApp(phone: string | undefined | null): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  let cleanPhone = phone.replace(/\D/g, '');
  
  // If it's exactly 10 digits (standard Indian number), prefix with 91
  if (cleanPhone.length === 10) {
    return `91${cleanPhone}`;
  }
  
  // Otherwise, return as is (in case it already has country code or is international)
  return cleanPhone;
}
