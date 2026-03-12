/** 계절 타입: 봄, 여름, 가을, 겨울 */
export type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';
/** 소의 상태: 정상, 배부름(생산 완료), 지침(쿨다운) */
export type CowStatus = 'NORMAL' | 'FULL' | 'EXHAUSTED';
/** 소의 종류: 기본, 저지, 프리미엄, 골든 */
export type CowType = 'BASIC' | 'JERSEY' | 'PREMIUM' | 'GOLDEN';
/** 무기 종류: 새총, 권총, 소총, 저격총 */
export type WeaponType = 'SLINGSHOT' | 'PISTOL' | 'RIFLE' | 'SNIPER';
/** 생산 가능 제품 종류 */
export type ProductType = 'YOGURT' | 'BUTTER' | 'CHEESE' | 'CREAM' | 'ICE_CREAM' | 'GOLDEN_CHEESE';

export const MAX_RANCH_LEVEL = 7;
export const MAX_COW_CAPACITY = 15;

export interface ProductionTask {
  id: string;
  type: ProductType;
  quantity: number;
  remainingTime: number;
  totalTime: number;
}

/** 
 * @interface Cow
 * @description 목장에서 관리되는 소의 상세 정보를 담는 인터페이스입니다.
 */
export interface Cow {
  /** 소의 고유 ID */
  id: string; 
  /** 소의 종류 */
  type: CowType; 
  /** 소의 레벨 */
  level: number; 
  /** 소의 체력 */
  health: number;
  /** 소의 현재 위치 (0-100 사이의 x, y 좌표) */
  position: { x: number; y: number }; 
  /** 우유 생산 게이지 (0-100) */
  milkGauge: number; 
  /** 소의 현재 상태 */
  status: CowStatus; 
  /** 다음 상태 변화까지 남은 시간 (초) */
  cooldownRemaining: number;
  /** 초당 우유 생산 속도 */
  productionRate: number;
  /** 생산되는 우유의 품질 가중치 */
  milkQuality: number;
}

export interface RankingEntry { name: string; score: number; }

export const PRODUCT_CONFIG: Record<ProductType, {
  milkCost: number;
  time: number;
  label: string;
  icon: string;
  minLevel: number;
  minFreshness: number;
  basePrice: number;
}> = {
  YOGURT: { milkCost: 20, time: 15, label: '요구르트', icon: '🥛', minLevel: 1, minFreshness: 0, basePrice: 150 },
  BUTTER: { milkCost: 30, time: 30, label: '버터', icon: '🧈', minLevel: 1, minFreshness: 0, basePrice: 250 },
  CHEESE: { milkCost: 50, time: 60, label: '치즈', icon: '🧀', minLevel: 3, minFreshness: 1.5, basePrice: 500 },
  CREAM: { milkCost: 40, time: 45, label: '생크림', icon: '🍦', minLevel: 5, minFreshness: 2.0, basePrice: 400 },
  ICE_CREAM: { milkCost: 60, time: 90, label: '아이스크림', icon: '🍨', minLevel: 6, minFreshness: 2.5, basePrice: 800 },
  GOLDEN_CHEESE: { milkCost: 100, time: 180, label: '황금 치즈', icon: '🏆', minLevel: 7, minFreshness: 3.5, basePrice: 2000 },
};

export const NEWS_POOL = [
  { message: "신선한 우유가 건강에 좋다는 기사가 보도되었습니다!", multiplier: 1.5 },
  { message: "학교 급식 우유 수요가 급증하고 있습니다.", multiplier: 1.3 },
  { message: "사료 가격 폭등으로 우유 생산이 어려워졌습니다.", multiplier: 1.8 },
  { message: "옆집 목장이 우유를 덤핑 판매하여 시세가 하락합니다.", multiplier: 0.7 },
  { message: "전국적인 치즈 열풍으로 우유가 부족합니다.", multiplier: 2.0 },
  { message: "우유의 신선도 논란으로 소비자가 줄어듭니다.", multiplier: 0.5 },
];
