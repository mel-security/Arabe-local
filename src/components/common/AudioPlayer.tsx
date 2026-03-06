import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { clsx } from "clsx";
import { audioService, speakArabic } from "@/services/audio";

interface AudioPlayerProps {
  src?: string | null;
  arabicText?: string; // Fallback TTS si pas d'audio
  label?: string;
  compact?: boolean;
  autoPlay?: boolean;
  onEnd?: () => void;
  className?: string;
}

export default function AudioPlayer({
  src,
  arabicText,
  label,
  compact = false,
  autoPlay = false,
  onEnd,
  className,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unPlay  = audioService.onPlay(() => setIsPlaying(true));
    const unPause = audioService.onPause(() => setIsPlaying(false));
    const unEnd   = audioService.onEnd(() => {
      setIsPlaying(false);
      setProgress(0);
      onEnd?.();
    });

    return () => { unPlay(); unPause(); unEnd(); };
  }, [onEnd]);

  // Mise à jour de la progression
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const d = audioService.duration;
        const t = audioService.currentTime;
        setDuration(d);
        setProgress(d > 0 ? (t / d) * 100 : 0);
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (autoPlay && src) {
      audioService.play(src);
    }
  }, [autoPlay, src]);

  const handlePlay = async () => {
    if (src) {
      await audioService.play(src);
    } else if (arabicText) {
      // Fallback : TTS
      speakArabic(arabicText);
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  const handlePause = () => {
    audioService.pause();
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioService.setVolume(newMuted ? 0 : 0.8);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      audioService.seek(ratio * duration);
    }
  };

  if (!src && !arabicText) return null;

  if (compact) {
    return (
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        className={clsx(
          "btn-icon bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-primary-950 dark:text-primary-300",
          className
        )}
        title={isPlaying ? "Pause" : "Écouter"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 translate-x-0.5" />
        )}
      </button>
    );
  }

  return (
    <div className={clsx("audio-player", className)}>
      {/* Bouton Play/Pause */}
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        className="btn-icon bg-primary-500 hover:bg-primary-600 text-white flex-shrink-0"
        aria-label={isPlaying ? "Pause" : "Lecture"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 translate-x-0.5" />
        )}
      </button>

      {/* Zone centrale */}
      <div className="flex-1 min-w-0">
        {label && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">{label}</p>
        )}

        {/* Barre de progression */}
        <div
          className="progress-bar cursor-pointer"
          onClick={handleProgressClick}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Durée */}
        {duration > 0 && (
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(audioService.currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        )}
      </div>

      {/* Bouton muet */}
      <button
        onClick={toggleMute}
        className="btn-icon text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex-shrink-0"
        aria-label={isMuted ? "Activer le son" : "Couper le son"}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ============================================================
// Bouton audio simple (icône seule)
// ============================================================

interface PlayButtonProps {
  src?: string | null;
  arabicText?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function PlayButton({ src, arabicText, size = "md", className, label }: PlayButtonProps) {
  const [playing, setPlaying] = useState(false);

  const sizeClass = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }[size];

  const iconSize = { sm: 14, md: 16, lg: 20 }[size];

  const handleClick = async () => {
    if (src) {
      if (playing) {
        audioService.pause();
      } else {
        await audioService.play(src);
      }
    } else if (arabicText) {
      speakArabic(arabicText);
      setPlaying(true);
      setTimeout(() => setPlaying(false), 1500);
    }
  };

  useEffect(() => {
    const unPlay  = audioService.onPlay(() => setPlaying(true));
    const unPause = audioService.onPause(() => setPlaying(false));
    const unEnd   = audioService.onEnd(() => setPlaying(false));
    return () => { unPlay(); unPause(); unEnd(); };
  }, []);

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "btn-icon rounded-full",
        playing
          ? "bg-primary-500 text-white"
          : "bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-primary-950 dark:text-primary-300",
        sizeClass,
        className
      )}
      title={label ?? (playing ? "Pause" : "Écouter")}
      aria-label={label ?? (playing ? "Pause" : "Écouter")}
    >
      {playing ? (
        <Pause style={{ width: iconSize, height: iconSize }} />
      ) : (
        <Play style={{ width: iconSize, height: iconSize }} className="translate-x-0.5" />
      )}
    </button>
  );
}
