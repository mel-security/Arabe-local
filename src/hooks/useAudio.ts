import { useState, useEffect, useCallback, useRef } from "react";
import { audioService, speakArabic } from "@/services/audio";

interface UseAudioReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: (src: string) => Promise<void>;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  speakArabic: (text: string) => void;
}

export function useAudio(autoSrc?: string): UseAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsubPlay = audioService.onPlay(() => setIsPlaying(true));
    const unsubPause = audioService.onPause(() => setIsPlaying(false));
    const unsubEnd = audioService.onEnd(() => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      unsubPlay();
      unsubPause();
      unsubEnd();
    };
  }, []);

  // Mise à jour du currentTime pendant la lecture
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(audioService.currentTime);
        setDuration(audioService.duration);
      }, 200);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  const play = useCallback(async (src: string) => {
    await audioService.play(src);
  }, []);

  const pause = useCallback(() => audioService.pause(), []);
  const toggle = useCallback(() => audioService.toggle(), []);
  const stop = useCallback(() => audioService.stop(), []);
  const seek = useCallback((time: number) => audioService.seek(time), []);
  const setVolume = useCallback((v: number) => audioService.setVolume(v), []);

  return {
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    toggle,
    stop,
    seek,
    setVolume,
    speakArabic,
  };
}
