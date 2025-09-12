import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SubtitleData } from '@/services/api';
import { SubtitleOverlay } from './SubtitleOverlay';
import { Card } from '@/components/ui/card';

export interface VideoPlayerProps {
  videoUrl: string;
  subtitles: SubtitleData[];
  onTimeUpdate?: (currentTime: number) => void;
  onSubtitleSelect?: (subtitle: SubtitleData | null) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onVolumeStateChange?: (volume: number, muted: boolean) => void;
  onDuration?: (duration: number) => void;
  onNaturalSize?: (width: number, height: number) => void;
  className?: string;
}

export interface VideoPlayerRef {
  getCurrentTime: () => number;
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
  isPlaying: () => boolean;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
}

export const VideoPlayer = React.forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({
    videoUrl,
    subtitles,
    onTimeUpdate,
    onSubtitleSelect,
    onPlayStateChange,
    onVolumeStateChange,
    onDuration,
    onNaturalSize,
    className
  }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleData | null>(null);

    // Expose player methods via ref
    React.useImperativeHandle(ref, () => ({
      getCurrentTime: () => currentTime,
      seekTo: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
      play: () => {
        videoRef.current?.play();
      },
      pause: () => {
        videoRef.current?.pause();
      },
      isPlaying: () => isPlaying,
      setVolume: (v: number) => {
        if (videoRef.current) videoRef.current.volume = Math.min(1, Math.max(0, v));
      },
      setMuted: (m: boolean) => {
        if (videoRef.current) videoRef.current.muted = m;
      },
      toggleMute: () => {
        if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
      },
      toggleFullscreen: () => {
        if (!document.fullscreenElement && containerRef.current) {
          containerRef.current.requestFullscreen();
        } else if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }
    }));

    // Find active subtitle based on current time
    const findActiveSubtitle = useCallback((time: number): SubtitleData | null => {
      return subtitles.find(
        (sub) => time >= sub.startTime && time <= sub.endTime
      ) || null;
    }, [subtitles]);

    // Handle video time updates
    const handleTimeUpdate = useCallback(() => {
      if (videoRef.current) {
        const time = videoRef.current.currentTime;
        setCurrentTime(time);
        onTimeUpdate?.(time);

        // Update active subtitle
        const activeSubtitle = findActiveSubtitle(time);
        if (activeSubtitle !== currentSubtitle) {
          setCurrentSubtitle(activeSubtitle);
          onSubtitleSelect?.(activeSubtitle);
        }
      }
    }, [onTimeUpdate, findActiveSubtitle, currentSubtitle, onSubtitleSelect]);

    // Video event handlers
    const handlePlay = () => {
      setIsPlaying(true);
      onPlayStateChange?.(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };
    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        const d = videoRef.current.duration;
        setDuration(d);
        onDuration?.(d);
      }
    };

    const handleVolumeChange = () => {
      if (videoRef.current) {
        const v = videoRef.current.volume;
        const m = videoRef.current.muted;
        setVolume(v);
        setIsMuted(m);
        onVolumeStateChange?.(v, m);
      }
    };

    const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

    // Playback controls
    const togglePlayPause = useCallback(() => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
      }
    }, [isPlaying]);

    const handleSeek = useCallback((time: number) => {
      if (videoRef.current) {
        const dur = duration || videoRef.current.duration || Number.MAX_SAFE_INTEGER;
        videoRef.current.currentTime = clamp(time, 0, dur);
      }
    }, [duration]);

    const handleVolumeSet = useCallback((newVolume: number) => {
      if (videoRef.current) {
        const v = clamp(newVolume, 0, 1);
        videoRef.current.volume = v;
        setVolume(v);
      }
    }, []);

    const toggleMute = useCallback(() => {
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    }, [isMuted]);

    const toggleFullscreen = useCallback(() => {
      if (!document.fullscreenElement && containerRef.current) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return; // Don't handle shortcuts when typing
        }

        switch (e.code) {
          case 'Space':
            e.preventDefault();
            togglePlayPause();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            handleSeek(currentTime - 3);
            break;
          case 'ArrowRight':
            e.preventDefault();
            handleSeek(currentTime + 3);
            break;
          case 'KeyJ':
            e.preventDefault();
            handleSeek(currentTime - 3);
            break;
          case 'KeyL':
            e.preventDefault();
            handleSeek(currentTime + 3);
            break;
          case 'ArrowUp':
            e.preventDefault();
            handleVolumeSet(volume + 0.05);
            break;
          case 'ArrowDown':
            e.preventDefault();
            handleVolumeSet(volume - 0.05);
            break;
          case 'KeyK':
            e.preventDefault();
            togglePlayPause();
            break;
          case 'KeyM':
            e.preventDefault();
            toggleMute();
            break;
          case 'KeyF':
            e.preventDefault();
            toggleFullscreen();
            break;
        }
      };

      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }, [togglePlayPause, currentTime, duration, handleSeek, toggleMute, toggleFullscreen]);

    // Fullscreen change listener
    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

    const updateNaturalSize = useCallback(() => {
      if (videoRef.current) {
        const w = videoRef.current.videoWidth;
        const h = videoRef.current.videoHeight;
        if (w && h) {
          setNaturalSize({ width: w, height: h });
          onNaturalSize?.(w, h);
        }
      }
    }, [onNaturalSize]);

    useEffect(() => {
      updateNaturalSize();
    }, [updateNaturalSize]);

    const handleLoadedMetadataWrapped = () => {
      handleLoadedMetadata();
      updateNaturalSize();
    };

    const aspectStyle = naturalSize
      ? { aspectRatio: `${naturalSize.width} / ${naturalSize.height}` }
      : { aspectRatio: '16 / 9' };

    return (
      <Card className={`relative overflow-hidden ${className}`}>
        <div ref={containerRef} className="relative w-full" style={{ ...aspectStyle }}>
          {/* Video Element */}
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-fill"
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onLoadedMetadata={handleLoadedMetadataWrapped}
            onVolumeChange={handleVolumeChange}
            controls={false}
            playsInline
            preload="metadata"
          />

          {/* Subtitle Overlay */}
          <SubtitleOverlay
            subtitles={subtitles}
            currentTime={currentTime}
            containerRef={containerRef}
          />
        </div>
      </Card>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
