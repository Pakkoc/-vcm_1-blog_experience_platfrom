/**
 * 사업자등록번호 검증 유틸리티
 */

export const formatBusinessNumber = (number: string): string => {
  const numbers = number.replace(/\D/g, '');
  
  if (numbers.length === 10) {
    return numbers.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
  }
  
  return number;
};

export const validateBusinessNumberFormat = (number: string): boolean => {
  const regex = /^\d{3}-\d{2}-\d{5}$/;
  return regex.test(number);
};

export const validateBusinessNumberChecksum = (number: string): boolean => {
  const numbers = number.replace(/-/g, '');
  
  if (numbers.length !== 10) {
    return false;
  }
  
  const checkArray = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * checkArray[i];
  }
  
  sum += Math.floor((parseInt(numbers[8]) * 5) / 10);
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return checkDigit === parseInt(numbers[9]);
};

export const validateBusinessNumber = (number: string): {
  valid: boolean;
  message?: string;
} => {
  if (!validateBusinessNumberFormat(number)) {
    return {
      valid: false,
      message: '올바른 사업자등록번호 형식이 아닙니다 (000-00-00000)',
    };
  }
  
  if (!validateBusinessNumberChecksum(number)) {
    return {
      valid: false,
      message: '유효하지 않은 사업자등록번호입니다',
    };
  }
  
  return { valid: true };
};

