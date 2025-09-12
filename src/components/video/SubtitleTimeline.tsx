import React, { useRef, useEffect, useState } from 'react';
import { SubtitleData } from '@/store/useVideoStore';

interface SubtitleTimelineProps {
  subtitles: SubtitleData[];
  currentTime: number;
  duration: number;
  onTimeSeek: (time: number) => void;
  onSubtitleSelect: (subtitle: SubtitleData) => void;
  selectedSubtitle?: SubtitleData;
}

export function SubtitleTimeline({ 
  subtitles, 
  currentTime, 
  duration, 
  onTimeSeek, 
  onSubtitleSelect,
  selectedSubtitle 
}: SubtitleTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (event: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    onTimeSeek(Math.max(0, Math.min(duration, newTime)));
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    handleTimelineClick(event);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging) return;
    handleTimelineClick(event);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const generateTimeMarkers = () => {
    if (!duration) return [];
    
    const markers = [];
    const step = duration < 60 ? 10 : duration < 300 ? 30 : 60; // 10s, 30s, or 1min intervals
    
    for (let i = 0; i <= duration; i += step) {
      const percentage = (i / duration) * 100;
      markers.push(
        <div 
          key={i}
          className="absolute flex flex-col items-center"
          style={{ left: `${percentage}%` }}
        >
          <div className="w-px h-3 bg-muted-foreground/50" />
          <span className="text-xs text-muted-foreground mt-1 select-none">
            {formatTime(i)}
          </span>
        </div>
      );
    }
    
    return markers;
  };

  return (
    <div className="bg-card border-t border-border p-4 space-y-4">
      <div className="text-sm font-medium text-foreground mb-2">Timeline</div>
      
      {/* Timeline Container */}
      <div className="relative h-16 bg-background rounded border border-border overflow-hidden">
        {/* Time Markers */}
        <div className="absolute inset-0">
          {generateTimeMarkers()}
        </div>

        {/* Subtitle Blocks */}
        <div className="absolute inset-0 top-6 bottom-6">
          {subtitles.map((subtitle) => {
            const startPercentage = (subtitle.startTime / duration) * 100;
            const widthPercentage = ((subtitle.endTime - subtitle.startTime) / duration) * 100;
            const isSelected = selectedSubtitle?.id === subtitle.id;
            
            return (
              <div
                key={subtitle.id}
                className={`absolute h-full rounded cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-primary border-2 border-primary-hover' 
                    : 'bg-accent hover:bg-accent/80 border border-border'
                }`}
                style={{
                  left: `${startPercentage}%`,
                  width: `${widthPercentage}%`,
                }}
                onClick={() => onSubtitleSelect(subtitle)}
                title={`${formatTime(subtitle.startTime)} - ${formatTime(subtitle.endTime)}: ${subtitle.text}`}
              >
                <div className="p-1 text-xs text-foreground truncate font-medium">
                  {subtitle.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Time Indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10 pointer-events-none"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-destructive rounded-full" />
        </div>

        {/* Interactive Overlay */}
        <div
          ref={timelineRef}
          className="absolute inset-0 cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}