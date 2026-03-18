/** 
 * @interface Quest
 * @description 게임 내 퀘스트 정보를 관리하는 인터페이스입니다.
 */
export interface Quest {
  id: string; 
  /** 퀘스트 그룹 ID (같은 종류의 퀘스트 식별용) */
  groupId: string; 
  /** 퀘스트 제목 */
  title: string; 
  /** 퀘스트 설명 */
  description: string;
  /** 목표 대상 타입: 판매량, 처치수, 소 보유수 등 */
  targetType: 'MILK_SOLD' | 'WOLF_KILLED' | 'COW_COUNT' | 'GOLD_EARNED' | 'MILK_ACTION';
  /** 달성해야 하는 목표 수치 */
  targetValue: number; 
  /** 보상으로 지급되는 골드 */
  rewardGold: number; 
  /** 보상 수령 여부 */
  isClaimed: boolean; 
  /** 퀘스트 기간 타입: 일일, 주간 */
  type: 'DAILY' | 'WEEKLY'; 
  /** 퀘스트 단계 (티어) */
  tier: number;
}

export interface Achievement {
  id: string; 
  groupId: string; 
  title: string; 
  description: string;
  targetType: 'MILK_SOLD' | 'WOLF_KILLED' | 'COW_COUNT' | 'GOLD_EARNED' | 'PLAYER_LEVEL';
  targetValue: number; 
  rewardDia: number; 
  isClaimed: boolean; 
  tier: number;
}

/** 
 * @interface AttendanceReward
 * @description 출석 체크 보상 정보를 담는 인터페이스입니다.
 */
export interface AttendanceReward {
  /** 출석 일수 */
  day: number; 
  /** 보상 종류: 골드, 다이아몬드, 탄약 */
  type: 'GOLD' | 'DIA' | 'AMMO'; 
  /** 보상 수량 */
  amount: number;
}

export const ATTENDANCE_REWARDS: AttendanceReward[] = [
  { day: 1, type: 'GOLD', amount: 500 }, { day: 2, type: 'GOLD', amount: 1000 },
  { day: 3, type: 'AMMO', amount: 10 }, { day: 4, type: 'GOLD', amount: 1500 },
  { day: 5, type: 'GOLD', amount: 2000 }, { day: 6, type: 'AMMO', amount: 20 },
  { day: 7, type: 'DIA', amount: 5 },
];
