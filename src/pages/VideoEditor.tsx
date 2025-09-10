import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoPlayer, VideoPlayerRef } from '@/components/video/VideoPlayer';
import { useVideoStore } from '@/store/useVideoStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Settings } from 'lucide-react';

export default function VideoEditor() {
  const navigate = useNavigate();
  const {
    currentVideo,
    subtitles,
    setCurrentSubtitle,
    resetState
  } = useVideoStore();

  const videoPlayerRef = useRef<VideoPlayerRef>(null);

  const handleTimeUpdate = (currentTime: number) => {
    // Handle time updates for synchronization
    console.log('Current time:', currentTime);
  };

  const handleSubtitleSelect = (subtitle: any) => {
    setCurrentSubtitle(subtitle);
  };

  const handleBackToUpload = () => {
    resetState();
    navigate('/');
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download video with subtitles');
  };

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-muted-foreground mb-4">No video loaded</p>
            <Button onClick={handleBackToUpload}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToUpload}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Video Editor</h1>
              <p className="text-sm text-muted-foreground">{currentVideo.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Style Settings
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download Video
            </Button>
          </div>
        </div>
      </header>

      {/* Main Editor Layout */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Subtitle Text Editor Panel */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subtitle Editor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {subtitles.length} subtitles loaded
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {subtitles.map((subtitle, index) => (
                    <div
                      key={subtitle.id}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => {
                        videoPlayerRef.current?.seekTo(subtitle.startTime);
                      }}
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        {Math.floor(subtitle.startTime)}s - {Math.floor(subtitle.endTime)}s
                      </div>
                      <div className="text-sm">{subtitle.text}</div>
                    </div>
                  ))}
                </div>

                {subtitles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No subtitles available yet</p>
                    <p className="text-xs mt-1">Processing may still be in progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Video Player - Center */}
          <div className="lg:col-span-6">
            <VideoPlayer
              ref={videoPlayerRef}
              videoUrl={currentVideo.url || ''}
              subtitles={subtitles}
              onTimeUpdate={handleTimeUpdate}
              onSubtitleSelect={handleSubtitleSelect}
              className="w-full"
            />
            
            {/* Timeline/Progress Info */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  Video: {currentVideo.name} ({Math.round(currentVideo.size / 1024 / 1024 * 100) / 100} MB)
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Style Controls Panel */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Style Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Style editing controls will be implemented in Phase 3
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Font Size</label>
                    <div className="mt-1 text-xs text-muted-foreground">Coming soon</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Font Color</label>
                    <div className="mt-1 text-xs text-muted-foreground">Coming soon</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Position</label>
                    <div className="mt-1 text-xs text-muted-foreground">Coming soon</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Style Presets</label>
                    <div className="mt-1 text-xs text-muted-foreground">Coming soon</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" disabled>
                  Export as MP4 with subtitles
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  Download subtitle file (.srt)
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  Download advanced subtitles (.ass)
                </Button>
                <div className="text-xs text-muted-foreground mt-2">
                  Export features will be available in Phase 4
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}