import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack,
  SkipForward
} from 'lucide-react';

export interface VideoControlBarProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen?: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMute: () => void;
  onToggleFullscreen?: () => void;
}

export function VideoControlBar({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMute,
  onToggleFullscreen,
}: VideoControlBarProps) {
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = (isMuted ? 0 : volume) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full border rounded-md bg-card">
      {/* Progress */}
      <div className="px-3 pt-3">
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground min-w-10 text-right">{formatTime(currentTime)}</div>
          <div className="flex-1">
            <Slider
              value={[progressPercentage]}
              max={100}
              step={0.1}
              onValueChange={(v) => onSeek(((v[0] || 0) / 100) * duration)}
            />
          </div>
          <div className="text-xs text-muted-foreground min-w-10">{formatTime(duration)}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onSeek(Math.max(0, currentTime - 3))}>
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onPlayPause}>
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onSeek(Math.min(duration, currentTime + 3))}>
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onMute}>
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <div className="w-24">
            <Slider
              value={[volumePercentage]}
              max={100}
              step={1}
              onValueChange={(v) => onVolumeChange((v[0] || 0) / 100)}
            />
          </div>
          {onToggleFullscreen && (
            <Button variant="ghost" size="sm" onClick={onToggleFullscreen}>
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
