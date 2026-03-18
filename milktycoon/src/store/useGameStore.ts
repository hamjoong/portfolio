import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  PRODUCT_CONFIG,
  MAX_RANCH_LEVEL
} from '../types/game';
import type { 
  Season, 
  CowStatus, 
  CowType, 
  WeaponType, 
  ProductType, 
  Cow, 
  RankingEntry
} from '../types/game';
import { 
  calculateMaxCows, 
  getQualityByCowType, 
  getProductionRateByCowType, 
  getWeaponDamage 
} from '../utils/gameHelpers';

/**
 * @interface ProductionTask
 * @description 생산 중인 작업의 정보를 담는 인터페이스입니다.
 * @property {string} id - 작업의 고유 ID
 * @property {ProductType} type - 생산 중인 제품의 종류
 * @property {number} quantity - 생산 수량
 * @property {number} remainingTime - 남은 생산 시간 (초)
 * @property {number} totalTime - 총 생산 시간 (초)
 */
interface ProductionTask {
  id: string;
  type: ProductType;
  quantity: number;
  remainingTime: number;
  totalTime: number;
}

/**
 * @interface GameState
 * @description 게임의 모든 상태와 액션을 관리하는 Zustand 스토어의 인터페이스입니다.
 */
interface GameState {
  /** @property {number} ranchLevel - 목장 레벨 */
  ranchLevel: number;
  /** @property {number} experience - 현재 경험치 */
  experience: number;
  /** @property {Cow[]} cows - 목장에 현재 배치된 소들의 목록 */
  cows: Cow[];
  /** @property {Cow[]} ownedCows - 플레이어가 소유한 모든 소들의 목록 */
  ownedCows: Cow[];
  /** @property {object} facilities - 시설물 정보 */
  facilities: { 
    storage: { level: number; capacity: number }; // 저장고: 레벨, 용량
    processing: { level: number; multiplier: number }; // 가공 공장: 레벨, 생산 효율
    house: { level: number; maxCows: number }; // 소 축사: 레벨, 최대 소 수
    extraction: { level: number; amountPerClick: number }; // 착유 시설: 레벨, 클릭 당 우유 생산량
  };
  /** @property {object} inventory - 인벤토리 정보 */
  inventory: { 
    milk: number; // 우유
    averageQuality: number; // 우유 평균 품질
    ammo: number; // 탄약
    yogurt: number; // 요거트
    butter: number; // 버터
    cheese: number; // 치즈
    cream: number; // 크림
    iceCream: number; // 아이스크림
    goldenCheese: number; // 황금 치즈
  };
  /** @property {ProductionTask[]} activeProductions - 현재 진행 중인 생산 작업 목록 */
  activeProductions: ProductionTask[];
  /** @property {object} stats - 각종 통계 정보 */
  stats: { totalMilkSold: number; totalWolvesKilled: number; totalGoldEarned: number; totalMilkClicks: number };
  /** @property {WeaponType} currentWeapon - 현재 사용 중인 무기 */
  currentWeapon: WeaponType;
  /** @property {WeaponType[]} ownedWeapons - 소유한 무기 목록 */
  ownedWeapons: WeaponType[];
  /** @property {Season} season - 현재 계절 */
  season: Season;
  /** @property {boolean} isWolfEventActive - 늑대 출현 이벤트 활성화 여부 */
  isWolfEventActive: boolean;
  /** @property {object} wolfStats - 늑대 상태 정보 */
  wolfStats: { hp: number; maxHp: number; level: number };
  /** @property {number} marketPrice - 시장 기준 가격 */
  marketPrice: number;
  /** @property {number} priceMultiplier - 가격 변동률 */
  priceMultiplier: number;
  /** @property {string} newsMessage - 가격 변동 관련 뉴스 메시지 */
  newsMessage: string;
  /** @property {RankingEntry[]} dailyRanking - 일일 랭킹 정보 */
  dailyRanking: RankingEntry[];
  /** @property {RankingEntry[]} weeklyRanking - 주간 랭킹 정보 */
  weeklyRanking: RankingEntry[];
  /** @property {object} playerPos - 플레이어 현재 위치 */
  playerPos: { x: number; y: number };
  /** @property {object} playerTarget - 플레이어 목표 위치 */
  playerTarget: { x: number; y: number };
  /** @property {boolean} isMerchantPresent - 상인 존재 여부 */
  isMerchantPresent: boolean;
  /** @property {number} merchantTimer - 다음 상인 도착까지 남은 시간 */
  merchantTimer: number;
  /** @property {Record<string, number>} merchantRates - 상인의 현재 아이템 매입가 */
  merchantRates: Record<string, number>;
  /** @property {object} actions - 게임 상태를 변경하는 액션 함수들 */
  actions: {
    updateCowGauge: (id: string, delta: number) => void;
    setCowStatus: (id: string, status: CowStatus, cooldown?: number) => void;
    produceMilk: (cowType: CowType) => boolean;
    startProduction: (type: ProductType, quantity: number) => boolean;
    sellProduct: (type: string, amount: number, price: number) => number;
    addExperience: (amount: number) => void;
    upgradeFacility: (type: 'STORAGE' | 'PROCESSING' | 'HOUSE' | 'EXTRACTION') => void;
    buyCow: (type: CowType) => boolean;
    toggleCowPlacement: (id: string) => boolean;
    buyWeapon: (type: WeaponType) => boolean;
    buyAmmo: (amount: number) => boolean;
    tickCows: () => void;
    setPlayerPos: (pos: { x: number; y: number }) => void;
    setPlayerTarget: (pos: { x: number; y: number }) => void;
    toggleWolfEvent: (a: boolean) => void;
    spawnWolf: () => void;
    damageWolf: (amount: number) => { killed: boolean, reward: number };
    setMarketPrice: (p: number, m: number, n: string) => void;
    incrementWolvesKilled: () => void;
    nextSeason: () => void;
    spawnMerchant: () => void;
    dismissMerchant: () => void;
    updateMerchantRates: () => void;
  };
}

// 목업 데이터: 일일 랭킹
const MOCK_DAILY: RankingEntry[] = [
  { name: '새벽목장주', score: 25000 }, { name: '우유마왕', score: 18500 }, { name: '나(Player)', score: 0 },
  { name: '치즈장인', score: 12000 }, { name: '카우보이', score: 8500 },
];

// 목업 데이터: 주간 랭킹
const MOCK_WEEKLY: RankingEntry[] = [
  { name: '전설의목장', score: 450000 }, { name: '나(Player)', score: 0 }, { name: '버터왕자', score: 320000 },
  { name: '밀크쉐이크', score: 280000 }, { name: '소사랑', score: 150000 },
];

/**
 * @store useGameStore
 * @description 게임의 핵심 로직과 상태를 관리하는 Zustand 스토어입니다.
 * `persist` 미들웨어를 사용하여 localStorage에 상태를 저장합니다.
 */
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // --- 초기 상태 정의 ---
      ranchLevel: 1,
      experience: 0,
      cows: [{ id: '1', type: 'BASIC', level: 1, health: 100, position: { x: 50, y: 50 }, milkGauge: 0, status: 'NORMAL', cooldownRemaining: 0, productionRate: 1.5, milkQuality: 1.0 }],
      ownedCows: [{ id: '1', type: 'BASIC', level: 1, health: 100, position: { x: 50, y: 50 }, milkGauge: 0, status: 'NORMAL', cooldownRemaining: 0, productionRate: 1.5, milkQuality: 1.0 }],
      facilities: { storage: { level: 1, capacity: 100 }, processing: { level: 1, multiplier: 1.0 }, house: { level: 1, maxCows: 3 }, extraction: { level: 1, amountPerClick: 10 } },
      inventory: { milk: 0, averageQuality: 1.0, ammo: 10, yogurt: 0, butter: 0, cheese: 0, cream: 0, iceCream: 0, goldenCheese: 0 },
      activeProductions: [],
      stats: { totalMilkSold: 0, totalWolvesKilled: 0, totalGoldEarned: 0, totalMilkClicks: 0 },
      currentWeapon: 'SLINGSHOT',
      ownedWeapons: ['SLINGSHOT'],
      season: 'SPRING',
      isWolfEventActive: false,
      wolfStats: { hp: 0, maxHp: 0, level: 1 },
      marketPrice: 10,
      priceMultiplier: 1.0,
      newsMessage: "평화로운 목장의 아침입니다.",
      dailyRanking: MOCK_DAILY,
      weeklyRanking: MOCK_WEEKLY,
      playerPos: { x: 50, y: 50 },
      playerTarget: { x: 50, y: 50 },
      isMerchantPresent: false,
      merchantTimer: 20 + Math.floor(Math.random() * 10), 
      merchantRates: { milk: 10, yogurt: 150, butter: 250, cheese: 500, cream: 400, iceCream: 800, goldenCheese: 2000 },
      
      // --- 액션 함수 구현 ---
      actions: {
        /** 특정 소의 우유 게이지를 조절합니다. */
        updateCowGauge: (id, delta) => set(() => {
          const updateFn = (list: Cow[]) => list.map(c => {
            if (c.id !== id) return c;
            const newGauge = Math.min(Math.max(c.milkGauge + delta, 0), 100);
            let newStatus = c.status;
            let newCooldown = c.cooldownRemaining;
            if (newGauge <= 0 && c.status === 'NORMAL') { newStatus = 'EXHAUSTED'; newCooldown = 15; }
            return { ...c, milkGauge: newGauge, status: newStatus, cooldownRemaining: newCooldown };
          });
          const newOwned = updateFn(get().ownedCows);
          const newPlaced = get().cows.map(pc => newOwned.find(oc => oc.id === pc.id) || pc);
          return { ownedCows: newOwned, cows: newPlaced };
        }),

        /** 특정 소의 상태와 쿨다운을 설정합니다. */
        setCowStatus: (id, status, cooldown = 0) => set(() => {
          const updateFn = (list: Cow[]) => list.map(c => c.id === id ? { ...c, status, cooldownRemaining: cooldown } : c);
          const newOwned = updateFn(get().ownedCows);
          const newPlaced = get().cows.map(pc => newOwned.find(oc => oc.id === pc.id) || pc);
          return { ownedCows: newOwned, cows: newPlaced };
        }),
        
        /** 우유를 생산합니다. 저장고 용량을 초과하면 실패합니다. */
        produceMilk: (cowType) => {
          const state = get();
          const currentMilk = state.inventory.milk;
          const capacity = state.facilities.storage.capacity;
          
          if (currentMilk >= capacity) return false;

          const producedAmount = state.facilities.extraction.amountPerClick;
          const actualAdded = Math.min(producedAmount, capacity - currentMilk);
          const totalAmount = currentMilk + actualAdded;
          
          const newQuality = getQualityByCowType(cowType);
          const newAverageQuality = totalAmount > 0 
            ? ((currentMilk * state.inventory.averageQuality) + (actualAdded * newQuality)) / totalAmount 
            : newQuality;

          set((s) => ({ 
            inventory: { ...s.inventory, milk: totalAmount, averageQuality: newAverageQuality },
            stats: { ...s.stats, totalMilkClicks: (s.stats.totalMilkClicks || 0) + 1 } 
          }));
          return true;
        },

        /** 제품 생산을 시작합니다. 재료가 부족하거나 조건 미달 시 실패합니다. */
        startProduction: (type, quantity) => {
          const state = get();
          const config = PRODUCT_CONFIG[type];
          const totalCost = config.milkCost * quantity;
          if (state.inventory.milk < totalCost || state.ranchLevel < config.minLevel || state.inventory.averageQuality < config.minFreshness) return false;
          const reducedTime = Math.max(5, config.time - (state.facilities.processing.level * 2));
          const additionalTime = reducedTime * quantity;
          const existingTaskIndex = state.activeProductions.findIndex(p => p.type === type);
          if (existingTaskIndex !== -1) {
            const newProductions = [...state.activeProductions];
            const existing = newProductions[existingTaskIndex];
            newProductions[existingTaskIndex] = { ...existing, quantity: existing.quantity + quantity, remainingTime: existing.remainingTime + additionalTime, totalTime: existing.totalTime + additionalTime };
            set(() => ({ inventory: { ...get().inventory, milk: get().inventory.milk - totalCost }, activeProductions: newProductions }));
          } else {
            set(() => ({ inventory: { ...get().inventory, milk: get().inventory.milk - totalCost }, activeProductions: [...get().activeProductions, { id: Math.random().toString(36).substring(2, 9), type, quantity, remainingTime: additionalTime, totalTime: additionalTime }] }));
          }
          return true;
        },

        /** 경험치를 추가합니다. */
        addExperience: (amount) => set(() => {
          const state = get();
          const newExp = state.experience + amount;
          const expNeeded = state.ranchLevel * 1000;
          return { experience: Math.min(newExp, expNeeded) };
        }),

        /** 제품을 판매하고 골드와 경험치를 얻습니다. */
        sellProduct: (type, amount, price) => {
          const goldEarned = Math.floor(amount * price);
          const key = type === 'GOLDEN_CHEESE' ? 'goldenCheese' : type === 'ICE_CREAM' ? 'iceCream' : type.toLowerCase() as keyof GameState['inventory'];
          set(() => ({
            inventory: { ...get().inventory, [key]: (get().inventory[key] as number) - amount },
            stats: { ...get().stats, totalGoldEarned: (get().stats.totalGoldEarned || 0) + goldEarned, totalMilkSold: (get().stats.totalMilkSold || 0) + amount },
            dailyRanking: get().dailyRanking.map(r => r.name === '나(Player)' ? { ...r, score: r.score + goldEarned } : r),
            weeklyRanking: get().weeklyRanking.map(r => r.name === '나(Player)' ? { ...r, score: r.score + goldEarned } : r),
          }));
          get().actions.addExperience(amount * 50);
          return goldEarned;
        },

        /** 1초마다 호출되는 게임의 메인 틱(tick) 함수입니다. */
        tickCows: () => set((state) => {
          // 플레이어 위치 업데이트 (미사용)
          const { playerPos, playerTarget } = state;
          const dx = playerTarget.x - playerPos.x;
          const dy = playerTarget.y - playerPos.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          let nextPos = playerPos;
          if (dist > 1) { nextPos = { x: playerPos.x + (dx / dist) * 5, y: playerPos.y + (dy / dist) * 5 }; }

          // 생산 작업 시간 감소
          const newProductions = state.activeProductions.map(p => ({ ...p, remainingTime: p.remainingTime - 1 }));
          const completed = newProductions.filter(p => p.remainingTime <= 0);
          const remaining = newProductions.filter(p => p.remainingTime > 0);
          
          // 완료된 생산품 인벤토리에 추가
          const newInventory = { ...state.inventory };
          const productMapping: Record<ProductType, keyof GameState['inventory']> = { 'YOGURT': 'yogurt', 'BUTTER': 'butter', 'CHEESE': 'cheese', 'CREAM': 'cream', 'ICE_CREAM': 'iceCream', 'GOLDEN_CHEESE': 'goldenCheese' };
          completed.forEach(task => { 
            const key = productMapping[task.type];
            if (key) { (newInventory[key] as number) += task.quantity; }
          });

          // 상인 타이머 및 등장 처리
          let { isMerchantPresent, merchantTimer } = state;
          if (!isMerchantPresent) { merchantTimer -= 1; if (merchantTimer <= 0) { isMerchantPresent = true; merchantTimer = 0; get().actions.updateMerchantRates(); } }
          
          // 늑대 랜덤 등장
          if (!state.isWolfEventActive && Math.random() < 0.005) { get().actions.spawnWolf(); }
          
          // 모든 소의 상태 업데이트
          const newOwnedCows = state.ownedCows.map(c => {
            const isPlaced = state.cows.some(pc => pc.id === c.id);
            const newPos = { ...c.position };
            let newCooldown = c.cooldownRemaining > 0 ? c.cooldownRemaining - 1 : 0;
            let newStatus = c.status;
            let newGauge = c.milkGauge;

            if (newCooldown === 0 && (c.status === 'FULL' || c.status === 'EXHAUSTED')) { 
              newStatus = 'NORMAL'; 
              newGauge = 0; 
            }

            if (newStatus === 'NORMAL') {
              newGauge = Math.min(newGauge + (c.productionRate || 1.5), 100);
              if (newGauge >= 100) { newStatus = 'FULL'; newCooldown = 20; }
              
              if (isPlaced && Math.random() > 0.9) {
                const nX = Math.min(Math.max(newPos.x + (Math.random() * 10 - 5), 10), 90);
                const nY = Math.min(Math.max(newPos.y + (Math.random() * 10 - 5), 20), 80);
                // 특정 영역(시설물 위치)은 피해서 이동
                if (!(nX > 30 && nX < 70 && nY < 45) && !(nX < 35 && nY > 60) && !(nX > 65 && nY > 60)) { 
                  newPos.x = nX; 
                  newPos.y = nY; 
                }
              }
            }
            return { ...c, position: newPos, status: newStatus, milkGauge: newGauge, cooldownRemaining: newCooldown };
          });

          const newPlacedCows = state.cows.map(pc => newOwnedCows.find(oc => oc.id === pc.id) || pc);

          return { playerPos: nextPos, inventory: newInventory, activeProductions: remaining, isMerchantPresent: isMerchantPresent, merchantTimer: merchantTimer, ownedCows: newOwnedCows, cows: newPlacedCows };
        }),

        /** 시설을 업그레이드합니다. */
        upgradeFacility: (type) => set(() => {
          const facilities = { ...get().facilities };
          let ranchLevel = get().ranchLevel;
          if (type === 'STORAGE') facilities.storage = { level: facilities.storage.level + 1, capacity: facilities.storage.capacity * 2 };
          else if (type === 'PROCESSING') facilities.processing = { level: facilities.processing.level + 1, multiplier: facilities.processing.multiplier + 0.1 };
          else if (type === 'EXTRACTION') facilities.extraction = { level: facilities.extraction.level + 1, amountPerClick: facilities.extraction.amountPerClick + 5 };
          else if (type === 'HOUSE') {
            if (ranchLevel >= MAX_RANCH_LEVEL) return { facilities, ranchLevel };
            ranchLevel += 1;
            const nextMaxCows = calculateMaxCows(ranchLevel);
            facilities.house = { level: ranchLevel, maxCows: nextMaxCows };
          }
          return { facilities, ranchLevel };
        }),

        /** 새로운 소를 구매합니다. */
        buyCow: (type) => {
          const state = get();
          const newCow: Cow = { 
            id: `cow_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, 
            type, level: 1, health: 100, 
            position: { x: 20 + Math.random() * 60, y: 30 + Math.random() * 40 }, 
            milkGauge: 0, status: 'NORMAL', cooldownRemaining: 0, 
            productionRate: getProductionRateByCowType(type), 
            milkQuality: getQualityByCowType(type) 
          };
          const newOwned = [...state.ownedCows, newCow];
          const newCows = [...state.cows];
          if (newCows.length < state.facilities.house.maxCows) { newCows.push(newCow); }
          set({ ownedCows: newOwned, cows: newCows });
          return true;
        },

        /** 소를 목장에 배치하거나 보관소로 이동시킵니다. */
        toggleCowPlacement: (id) => {
          const state = get();
          const isPlaced = state.cows.some(c => c.id === id);
          if (isPlaced) { 
            set({ cows: state.cows.filter(c => c.id !== id) }); 
            return true; 
          } else {
            if (state.cows.length >= state.facilities.house.maxCows) return false;
            const cow = state.ownedCows.find(c => c.id === id);
            if (cow) { 
              set({ cows: [...state.cows, cow] }); 
              return true; 
            }
          }
          return false;
        },

        /** 새로운 무기를 구매합니다. */
        buyWeapon: (type) => {
          if (get().ownedWeapons.includes(type)) return false;
          set(() => ({ ownedWeapons: [...get().ownedWeapons, type], currentWeapon: type }));
          return true;
        },

        /** 탄약을 구매합니다. */
        buyAmmo: (amount) => { 
          set((s) => ({ inventory: { ...s.inventory, ammo: s.inventory.ammo + amount } })); 
          return true; 
        },

        /** 늑대를 스폰시킵니다. 늑대의 레벨은 목장 상태에 따라 결정됩니다. */
        spawnWolf: () => {
          const { ranchLevel, cows, actions } = get();
          const highest = cows.reduce((max, c) => { 
            const scores: Record<string, number> = { 'BASIC': 1, 'JERSEY': 3, 'PREMIUM': 6, 'GOLDEN': 12 }; 
            return Math.max(max, scores[c.type] || 1); 
          }, 1);
          const wolfLevel = Math.max(1, Math.floor((ranchLevel * 0.5) + (cows.length * 0.2) + (highest * 0.3)));
          const baseHp = 30;
          const wolfHp = baseHp + (wolfLevel * 10);
          set({ wolfStats: { hp: wolfHp, maxHp: wolfHp, level: wolfLevel } });
          actions.toggleWolfEvent(true);
        },

        /** 늑대에게 데미지를 입힙니다. 처치 시 보상을 반환합니다. */
        damageWolf: (amount) => {
          const state = get();
          if (!state.isWolfEventActive || state.inventory.ammo <= 0) return { killed: false, reward: 0 };
          
          const actualDamage = amount || getWeaponDamage(state.currentWeapon);
          const newHp = Math.max(0, state.wolfStats.hp - actualDamage);
          
          set((s) => ({ inventory: { ...s.inventory, ammo: s.inventory.ammo - 1 } }));

          if (newHp <= 0) { 
            const reward = state.wolfStats.level * 500; 
            set({ isWolfEventActive: false, wolfStats: { ...state.wolfStats, hp: 0 } }); 
            get().actions.incrementWolvesKilled(); 
            return { killed: true, reward }; 
          } else { 
            set({ wolfStats: { ...state.wolfStats, hp: newHp } }); 
            return { killed: false, reward: 0 }; 
          }
        },

        /** 늑대 처치 횟수를 1 증가시킵니다. */
        incrementWolvesKilled: () => set(() => ({ stats: { ...get().stats, totalWolvesKilled: get().stats.totalWolvesKilled + 1 } })),
        
        /** 다음 계절로 변경합니다. */
        nextSeason: () => set((state) => { 
          const order: Season[] = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER']; 
          return { season: order[(order.indexOf(state.season) + 1) % 4] }; 
        }),

        /** 플레이어 위치를 설정합니다. (미사용) */
        setPlayerPos: (playerPos) => set({ playerPos }), 
        
        /** 플레이어 목표 위치를 설정합니다. (미사용) */
        setPlayerTarget: (playerTarget) => set({ playerTarget }), 
        
        /** 시장 가격, 변동률, 뉴스 메시지를 설정합니다. */
        setMarketPrice: (marketPrice, priceMultiplier, newsMessage) => set({ marketPrice, priceMultiplier, newsMessage }), 
        
        /** 늑대 이벤트를 토글합니다. 활성화 시 15초 후 자동으로 비활성화됩니다. */
        toggleWolfEvent: (active) => {
          set({ isWolfEventActive: active });
          if (active) {
            setTimeout(() => {
              set({ isWolfEventActive: false });
            }, 15000);
          }
        },
        
        /** 상인을 즉시 스폰시킵니다. */
        spawnMerchant: () => set({ isMerchantPresent: true, merchantTimer: 0 }),
        
        /** 상인을 떠나보내고 다음 등장까지의 타이머를 설정합니다. */
        dismissMerchant: () => set(() => {
          const { ranchLevel, cows, facilities } = get();
          const hasGoldenCow = cows.some(c => c.type === 'GOLDEN');
          const hasMidTierCow = cows.some(c => c.type === 'JERSEY' || c.type === 'PREMIUM');
          let nextTimer = 0;
          // 게임 진행도에 따라 다음 상인 등장 시간 조절
          if (ranchLevel >= 15 || cows.length >= 13 || hasGoldenCow || facilities.storage.level >= 6) { 
            nextTimer = 60 + Math.floor(Math.random() * 61); // 60-120초
          } else if (ranchLevel >= 5 || cows.length >= 6 || hasMidTierCow || facilities.storage.level >= 3) { 
            nextTimer = 40 + Math.floor(Math.random() * 11); // 40-50초
          } else { 
            nextTimer = 20 + Math.floor(Math.random() * 11); // 20-30초
          }
          return { isMerchantPresent: false, merchantTimer: nextTimer };
        }),
        
        /** 상인의 아이템 매입가를 랜덤하게 갱신합니다. */
        updateMerchantRates: () => set(() => { 
          const randomMult = () => 0.8 + Math.random() * 0.4; // 80% ~ 120%
          return { 
            merchantRates: { 
              milk: Math.floor(10 * randomMult()), 
              yogurt: Math.floor(PRODUCT_CONFIG.YOGURT.basePrice * randomMult()), 
              butter: Math.floor(PRODUCT_CONFIG.BUTTER.basePrice * randomMult()), 
              cheese: Math.floor(PRODUCT_CONFIG.CHEESE.basePrice * randomMult()), 
              cream: Math.floor(PRODUCT_CONFIG.CREAM.basePrice * randomMult()), 
              iceCream: Math.floor(PRODUCT_CONFIG.ICE_CREAM.basePrice * randomMult()), 
              goldenCheese: Math.floor(PRODUCT_CONFIG.GOLDEN_CHEESE.basePrice * randomMult()) 
            } 
          }; 
        }),
      }
    }),
    { name: 'milk-tycoon-game-v5', storage: createJSONStorage(() => localStorage) }
  )
);
