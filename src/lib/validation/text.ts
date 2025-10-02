/**
 * 텍스트 길이 검증 유틸리티
 */

export const validateTextLength = (
  text: string,
  min: number,
  max: number,
  fieldName: string = '텍스트'
): { valid: boolean; message?: string } => {
  const length = text.trim().length;

  if (length < min) {
    return {
      valid: false,
      message: `${fieldName}는 최소 ${min}자 이상 입력해주세요 (현재: ${length}자)`,
    };
  }

  if (length > max) {
    return {
      valid: false,
      message: `${fieldName}는 최대 ${max}자까지 입력 가능합니다 (현재: ${length}자)`,
    };
  }

  return { valid: true };
};

