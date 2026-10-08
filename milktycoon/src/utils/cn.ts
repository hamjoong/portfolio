import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * @function cn
 * @description Tailwind CSS 클래스들을 조건부로 결합하고 중복을 병합하는 유틸리티 함수입니다.
 * @param {ClassValue[]} inputs - 결합할 클래스 값들
 * @returns {string} 병합된 클래스 문자열
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
