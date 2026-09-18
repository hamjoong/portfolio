import { useEffect, useRef } from 'react';
import { useUserStore } from '../store/useUserStore';

/**
 * @hook useBGM
 * @description 게임 배경음악을 관리하는 커스텀 훅입니다.
 * @param {string} audioPath - 배경음악 파일 경로
 */
export const useBGM = (audioPath: string) => {
  const bgmVolume = useUserStore((state) => state.settings.bgmVolume);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(import.meta.env.BASE_URL + 'audio/bgm.mp3');
      audioRef.current.loop = true;
    }
    
    audioRef.current.volume = bgmVolume / 100;
  }, [audioPath, bgmVolume]);

  useEffect(() => {
    const playBGM = async () => {
      try {
        await audioRef.current?.play();
      } catch (error) {
        console.warn("BGM playback failed, likely due to interaction requirements.");
      }
    };
    
    playBGM();
    
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return audioRef.current;
};
