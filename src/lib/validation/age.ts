/**
 * 나이 검증 유틸리티
 */

export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const isAgeValid = (birthDate: string, minAge: number = 14): boolean => {
  return calculateAge(birthDate) >= minAge;
};

export const validateAge = (birthDate: string): { valid: boolean; age: number; message?: string } => {
  const age = calculateAge(birthDate);
  
  if (age < 14) {
    return {
      valid: false,
      age,
      message: '만 14세 이상만 가입 가능합니다',
    };
  }
  
  return { valid: true, age };
};

