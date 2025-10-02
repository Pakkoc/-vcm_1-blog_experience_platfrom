export const formatPhoneNumber = (phone: string): string => {
  const numbers = phone.replace(/\D/g, '');

  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }

  return phone;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
};

export const normalizePhoneNumber = (phone: string): string => {
  return phone.replace(/-/g, '');
};
