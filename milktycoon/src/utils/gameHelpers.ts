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
 * baseline을 주면(일일·주간 퀘스트) 기간 시작 시점의 누적 통계를 뺀 값을 돌려줍니다.
 */
export const calculateProgress = (
  targetType: string,
  stats: GameStats | null,
  cows: Cow[],
  ranchLevel: number,
  baseline?: GameStats
): number => {
  if (!stats) return 0;
  const since = (key: keyof GameStats) => Math.max(0, (stats[key] || 0) - (baseline?.[key] || 0));
  switch (targetType) {
    case 'MILK_SOLD': return since('totalMilkSold');
    case 'WOLF_KILLED': return since('totalWolvesKilled');
    case 'COW_COUNT': return cows?.length || 0;
    case 'GOLD_EARNED': return since('totalGoldEarned');
    case 'MILK_ACTION': return since('totalMilkClicks');
    case 'PLAYER_LEVEL': return ranchLevel || 1;
    default: return 0;
  }
};

/**
 * 상인 매입가에 시장 시세와 가공 효율을 반영한 실제 판매 단가를 계산합니다.
 * 저장된 매입가(merchantRates)는 상인이 올 때만 갱신되므로, 시세·시설 변화가
 * 바로 반영되도록 판매 시점에 계산합니다. 가공 효율은 가공품에만 적용합니다(원유 제외).
 */
export const getEffectivePrice = (
  type: string,
  baseRate: number,
  priceMultiplier: number,
  processingMultiplier: number
): number => {
  const processing = type === 'milk' ? 1 : processingMultiplier;
  return Math.floor(baseRate * priceMultiplier * processing);
};
