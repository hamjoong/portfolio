import { MAX_RANCH_LEVEL } from '../types/game';
import type { CowType, Cow, GameStats } from '../types/game';

/**
 * 목장 레벨에 따른 최대 소 보유 가능 수를 계산합니다.
 * @param level 현재 목장 레벨
 */
export const calculateMaxCows = (level: number): number => {
  if (level >= MAX_RANCH_LEVEL) return 15;
  return 3 + (level - 1) * 2;
};

/**
 * 소의 종류에 따른 우유 생산 품질을 반환합니다.
 */
export const getQualityByCowType = (type: CowType): number => {
  const qualityMap: Record<CowType, number> = {
    'BASIC': 1.0,
    'JERSEY': 2.0,
    'PREMIUM': 3.0,
    'GOLDEN': 4.5
  };
  return qualityMap[type] || 1.0;
};

/**
 * 소의 종류에 따른 기본 생산 속도를 반환합니다.
 */
export const getProductionRateByCowType = (type: CowType): number => {
  const rateMap: Record<CowType, number> = {
    'BASIC': 1.5,
    'JERSEY': 2.5,
    'PREMIUM': 4.0,
    'GOLDEN': 8.0
  };
  return rateMap[type] || 1.5;
};

/**
 * 유저 레벨업에 필요한 경험치를 계산합니다.
 */
export const getExpNeededForLevel = (level: number): number => {
  return level * 1000;
};

/**
 * 무기 종류에 따른 데미지를 반환합니다.
 */
export const getWeaponDamage = (type: string): number => {
  const damageMap: Record<string, number> = {
    'SLINGSHOT': 10,
    'PISTOL': 25,
    'RIFLE': 60,
    'SNIPER': 150
  };
  return damageMap[type] || 10;
};

/**
 * 퀘스트 또는 업적의 진행도를 계산합니다.
 */
export const calculateProgress = (
  targetType: string,
  stats: GameStats | null,
  cows: Cow[],
  ranchLevel: number
): number => {
  if (!stats) return 0;
  switch (targetType) {
    case 'MILK_SOLD': return stats.totalMilkSold || 0;
    case 'WOLF_KILLED': return stats.totalWolvesKilled || 0;
    case 'COW_COUNT': return cows?.length || 0;
    case 'GOLD_EARNED': return stats.totalGoldEarned || 0;
    case 'MILK_ACTION': return stats.totalMilkClicks || 0;
    case 'PLAYER_LEVEL': return ranchLevel || 1;
    default: return 0;
  }
};
