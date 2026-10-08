import { useEffect, useRef } from 'react';
import { useUserStore } from '../store/useUserStore';

/**
 * @hook useBGM
 * @description 게임 배경음악을 관리하는 커스텀 훅입니다.
 * 브라우저가 자동재생을 막으면 첫 사용자 입력(클릭·터치·키 입력) 때 다시 재생을 시도합니다.
 * @param {string} audioPath - 배경음악 파일 경로 (예: '/audio/bgm.mp3', BASE_URL 기준)
 */
export const useBGM = (audioPath: string) => {
  const bgmVolume = useUserStore((state) => state.settings.bgmVolume);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 경로가 바뀌면 오디오를 새로 만들고, 언마운트·경로 변경 시 정리한다.
  useEffect(() => {
    const audio = new Audio(import.meta.env.BASE_URL + audioPath.replace(/^\//, ''));
    audio.loop = true;
    audio.volume = useUserStore.getState().settings.bgmVolume / 100;
    audioRef.current = audio;

    const events = ['pointerdown', 'keydown'] as const;
    const removeRetry = () => events.forEach((e) => window.removeEventListener(e, retry));
    // 자동재생이 막힌 경우에만 호출되며, 재생에 성공하면 리스너를 걷는다.
    function retry() {
      audio.play().then(removeRetry).catch(() => { /* 다음 입력 때 다시 시도 */ });
    }

    audio.play().catch(() => {
      events.forEach((e) => window.addEventListener(e, retry));
    });

    return () => {
      removeRetry();
      audio.pause();
      audioRef.current = null;
    };
  }, [audioPath]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = bgmVolume / 100;
  }, [bgmVolume]);
};
