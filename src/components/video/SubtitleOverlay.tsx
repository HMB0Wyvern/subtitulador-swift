import React, { useMemo, useRef, useEffect, useState } from 'react';
import { SubtitleData } from '@/services/api';
import { ASSToCSSConverter } from '@/utils/assToCSS';

export interface SubtitleOverlayProps {
  subtitles: SubtitleData[];
  currentTime: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function SubtitleOverlay({ subtitles, currentTime, containerRef }: SubtitleOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setContainerDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  // Find currently active subtitles
  const activeSubtitles = useMemo(() => {
    return subtitles.filter(
      subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
    );
  }, [subtitles, currentTime]);

  // Render each active subtitle with its styles
  const renderSubtitle = (subtitle: SubtitleData) => {
    const cssStyles = ASSToCSSConverter.stylesToCSS(
      subtitle.styles,
      containerDimensions.width,
      containerDimensions.height
    );

    return (
      <div
        key={subtitle.id}
        className="absolute whitespace-pre-line select-none pointer-events-none"
        style={cssStyles}
      >
        {subtitle.text}
      </div>
    );
  };

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ 
        width: containerDimensions.width,
        height: containerDimensions.height 
      }}
    >
      {activeSubtitles.map(renderSubtitle)}
    </div>
  );
}