import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SubtitleData } from '@/services/api';
import { SubtitleOverlay } from './SubtitleOverlay';
import { VideoControls } from './VideoControls';
import { Card } from '@/components/ui/card';
import { Slider as imported } from '@/components/ui/slider';

export interface VideoPlayerProps {
  videoUrl: string;
  subtitles: SubtitleData[];
  onTimeUpdate?: (currentTime: number) => void;
  onSubtitleSelect?: (subtitle: SubtitleData | null) => void;
  className?: string;
}

export interface VideoPlayerRef {
  getCurrentTime: () => number;
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
  isPlaying: () => boolean;
}

export const VideoPlayer = React.forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ videoUrl, subtitles, onTimeUpdate, onSubtitleSelect, className }, ref) => {
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
      isPlaying: () => isPlaying
    }));

    // Find active subtitle based on current time
    const findActiveSubtitle = useCallback((time: number): SubtitleData | null => {
      return subtitles.find(
        sub => time >= sub.startTime && time <= sub.endTime
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
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
      }
    };

    const handleVolumeChange = () => {
      if (videoRef.current) {
        setVolume(videoRef.current.volume);
        setIsMuted(videoRef.current.muted);
      }
    };

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
        videoRef.current.currentTime = time;
      }
    }, []);

    const handleVolumeSet = useCallback((newVolume: number) => {
      if (videoRef.current) {
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
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
            handleSeek(Math.max(0, currentTime - 10));
            break;
          case 'ArrowRight':
            e.preventDefault();
            handleSeek(Math.min(duration, currentTime + 10));
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
        if (w && h) setNaturalSize({ width: w, height: h });
      }
    }, []);

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
      <Card className={`relative bg-black overflow-hidden ${className}`}>
        <div ref={containerRef} className="relative w-full bg-black group" style={aspectStyle}>
          {/* Video Element */}
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
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

          {/* Video Controls */}
          <VideoControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            isFullscreen={isFullscreen}
            onPlayPause={togglePlayPause}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeSet}
            onMute={toggleMute}
            onFullscreen={toggleFullscreen}
            showProgress={false}
          />

          {/* Click to play/pause overlay - only in center area to avoid blocking controls */}
          <div
            className="absolute inset-x-0 top-0 bottom-16 cursor-pointer"
            onClick={togglePlayPause}
          />
        </div>
        {/* Timeline outside video */}
        <div className="p-3">
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground min-w-10 text-right">{Math.floor(currentTime/60)}:{Math.floor(currentTime%60).toString().padStart(2,'0')}</div>
            <div className="flex-1">
              <imported.Slider
                value={[duration>0 ? (currentTime/duration)*100 : 0]}
                max={100}
                step={0.1}
                onValueChange={(v)=>handleSeek(((v[0]||0)/100)*duration)}
              />
            </div>
            <div className="text-xs text-muted-foreground min-w-10">{Math.floor(duration/60)}:{Math.floor(duration%60).toString().padStart(2,'0')}</div>
          </div>
        </div>
      </Card>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
