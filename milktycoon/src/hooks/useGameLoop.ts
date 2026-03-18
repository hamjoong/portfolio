import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useUIStore } from '../store/useUIStore';
import { NEWS_POOL } from '../types/game';

const PRICE_UPDATE_INTERVAL = 30; // 30초마다 시세 변동
const SEASON_UPDATE_INTERVAL = 120; // 120초마다 계절 변동

/**
 * @hook useGameLoop
 * @description 게임의 메인 루프를 관리하는 커스텀 훅입니다.
 * 1초마다 실행되며, 게임의 시간 경과에 따른 상태 업데이트를 처리합니다.
 * (젖소 상태, 상인 타이머, 시세 변동, 계절 변동 등)
 */
export const useGameLoop = () => {
  const actions = useGameStore((state) => state.actions);
  const currentScreen = useUIStore((state) => state.currentScreen);
  const tickCounter = useRef(0);

  useEffect(() => {
    /**
     * @effect
     * @description 1초 간격으로 게임 상태를 업데이트하는 메인 게임 루프입니다.
     */
    const interval = setInterval(() => {
      tickCounter.current += 1;

      // 목장 화면에 있을 때만 실행되는 로직
      if (currentScreen === 'RANCH') {
        // 젖소의 상태를 업데이트합니다 (예: 배고픔, 우유 생산량 등).
        if (actions?.tickCows) actions.tickCows();

        // 일정 시간마다 계절을 변경합니다.
        if (tickCounter.current % SEASON_UPDATE_INTERVAL === 0) {
          if (actions?.nextSeason) actions.nextSeason();
        }
      }

      // 일정 시간마다 시장 가격을 변동시킵니다.
      if (tickCounter.current > 0 && tickCounter.current % PRICE_UPDATE_INTERVAL === 0) {
        const randomNews = NEWS_POOL[Math.floor(Math.random() * NEWS_POOL.length)];
        if (actions?.setMarketPrice) {
          actions.setMarketPrice(10, randomNews.multiplier, randomNews.message);
        }
      }
    }, 1000);

    // 컴포넌트가 언마운트될 때 인터벌을 정리합니다.
    return () => clearInterval(interval);
  }, [actions, currentScreen]);
};
