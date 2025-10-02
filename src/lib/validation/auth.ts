export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('8자 이상 입력해주세요');
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('영문을 포함해주세요');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('숫자를 포함해주세요');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const sanitizeName = (name: string): string => {
  return name.trim().substring(0, 100);
};
