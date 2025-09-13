import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, Plus, Search, SkipForward, Video, FileText, Palette, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VideoPlayer, VideoPlayerRef } from '@/components/video/VideoPlayer';
import { SubtitleTextEditor } from '@/components/subtitles/SubtitleTextEditor';
import { VideoControlBar } from '@/components/video/VideoControlBar';
import { SubtitleStyleEditor } from '@/components/subtitles/SubtitleStyleEditor';
import { StylePresets } from '@/components/subtitles/StylePresets';
import { AdvancedStyleEditor } from '@/components/subtitles/AdvancedStyleEditor';
import { SubtitleTimeline } from '@/components/video/SubtitleTimeline';
import { useVideoStore, SubtitleData } from '@/store/useVideoStore';
import { useToast } from '@/hooks/use-toast';
import { exportSubtitles } from '@/utils/subtitleExport';
import { useEffect, useRef, useState } from 'react';

export default function VideoEditor() {
  const { 
    currentVideo, 
    subtitles, 
    setSubtitles, 
    updateSubtitle,
    deleteSubtitle,
    addSubtitle,
    resetState
  } = useVideoStore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [editingSubtitle, setEditingSubtitle] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<VideoPlayerRef>(null);
  const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleData | undefined>();
  const [exportFormat, setExportFormat] = useState('MP4');

  // Default subtitle style that matches SubtitleStyle interface
  const [currentSubtitleStyle, setCurrentSubtitleStyle] = useState({
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'bold' as 'normal' | 'bold',
    color: '#ffffff',
    backgroundColor: 'transparent',
    outline: {
      enabled: true,
      color: '#000000',
      width: 2
    },
    shadow: {
      enabled: true,
      color: '#000000',
      offsetX: 1,
      offsetY: 1,
      blur: 2
    },
    position: {
      horizontal: 'center' as 'left' | 'center' | 'right',
      vertical: 'bottom' as 'top' | 'middle' | 'bottom',
      marginX: 20,
      marginY: 60
    }
  });

  const handleStyleChange = (updates: any) => {
    setCurrentSubtitleStyle(prev => ({
      ...prev,
      ...updates,
      outline: updates.outline ? { ...prev.outline, ...updates.outline } : prev.outline,
      shadow: updates.shadow ? { ...prev.shadow, ...updates.shadow } : prev.shadow,
      position: updates.position ? { ...prev.position, ...updates.position } : prev.position
    }));

    // Apply updates in real-time to all subtitles for live preview
    setSubtitles(subtitles.map(s => ({
      ...s,
      styles: {
        fontFamily: (updates.fontFamily ?? s.styles.fontFamily),
        fontSize: (updates.fontSize ?? s.styles.fontSize),
        fontWeight: (updates.fontWeight ?? s.styles.fontWeight),
        color: (updates.color ?? s.styles.color),
        backgroundColor: updates.backgroundEnabled ? (updates.backgroundColor ?? s.styles.backgroundColor) : (updates.backgroundEnabled === false ? 'transparent' : s.styles.backgroundColor),
        outline: {
          width: (updates.outline?.enabled === false) ? 0 : (updates.outline?.width ?? s.styles.outline.width),
          color: (updates.outline?.color ?? s.styles.outline.color)
        },
        shadow: {
          offsetX: (updates.shadow?.enabled === false) ? 0 : (updates.shadow?.offsetX ?? s.styles.shadow.offsetX),
          offsetY: (updates.shadow?.enabled === false) ? 0 : (updates.shadow?.offsetY ?? s.styles.shadow.offsetY),
          blur: (updates.shadow?.enabled === false) ? 0 : (updates.shadow?.blur ?? s.styles.shadow.blur),
          color: (updates.shadow?.color ?? s.styles.shadow.color)
        },
        position: {
          horizontal: (updates.position?.horizontal ?? s.styles.position.horizontal),
          vertical: (updates.position?.vertical === 'middle' ? 'center' : (updates.position?.vertical ?? s.styles.position.vertical)),
          marginX: (updates.position?.marginX ?? s.styles.position.marginX),
          marginY: (updates.position?.marginY ?? s.styles.position.marginY)
        }
      }
    })));
  };

  useEffect(() => {
    if (!currentVideo) {
      return;
    }
  }, [currentVideo]);

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">No video selected</h2>
          <p className="text-muted-foreground">Please upload a video to start editing subtitles.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddSubtitle = (afterId?: string) => {
    const newSubtitle: SubtitleData = {
      id: Date.now().toString(),
      startTime: currentTime,
      endTime: currentTime + 5,
      text: 'New subtitle',
      styles: {
        fontFamily: currentSubtitleStyle.fontFamily,
        fontSize: currentSubtitleStyle.fontSize,
        fontWeight: currentSubtitleStyle.fontWeight,
        color: currentSubtitleStyle.color,
        backgroundColor: currentSubtitleStyle.backgroundColor || 'transparent',
        outline: {
          width: currentSubtitleStyle.outline.enabled ? currentSubtitleStyle.outline.width : 0,
          color: currentSubtitleStyle.outline.color
        },
        shadow: {
          offsetX: currentSubtitleStyle.shadow.enabled ? currentSubtitleStyle.shadow.offsetX : 0,
          offsetY: currentSubtitleStyle.shadow.enabled ? currentSubtitleStyle.shadow.offsetY : 0,
          blur: currentSubtitleStyle.shadow.enabled ? currentSubtitleStyle.shadow.blur : 0,
          color: currentSubtitleStyle.shadow.color
        },
        position: {
          horizontal: currentSubtitleStyle.position.horizontal,
          vertical: currentSubtitleStyle.position.vertical === 'middle' ? 'center' : currentSubtitleStyle.position.vertical,
          marginX: currentSubtitleStyle.position.marginX,
          marginY: currentSubtitleStyle.position.marginY
        }
      }
    };

    if (afterId) {
      const index = subtitles.findIndex(sub => sub.id === afterId);
      const newSubtitles = [...subtitles];
      newSubtitles.splice(index + 1, 0, newSubtitle);
      setSubtitles(newSubtitles);
    } else {
      setSubtitles([...subtitles, newSubtitle]);
    }
    
    setEditingSubtitle(newSubtitle.id);
    setSelectedSubtitle(newSubtitle);
  };

  const handleDeleteSubtitle = (id: string) => {
    deleteSubtitle(id);
    if (editingSubtitle === id) {
      setEditingSubtitle(null);
    }
    if (selectedSubtitle?.id === id) {
      setSelectedSubtitle(undefined);
    }
  };

  const handleUpdateSubtitle = (id: string, field: keyof SubtitleData, value: any) => {
    updateSubtitle(id, { [field]: value });
    if (selectedSubtitle?.id === id) {
      setSelectedSubtitle(prev => prev ? { ...prev, [field]: value } : undefined);
    }
  };

  const handleSeekToStart = (startTime: number) => {
    setCurrentTime(startTime);
  };

  const handleTimeSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleSubtitleSelect = (subtitle: SubtitleData) => {
    setSelectedSubtitle(subtitle);
    setCurrentTime(subtitle.startTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const parseTimeString = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const [mins, secsMs] = parts;
      const [secs, ms = '0'] = secsMs.split('.');
      return parseInt(mins) * 60 + parseInt(secs) + parseInt(ms.padEnd(2, '0')) / 100;
    }
    return 0;
  };

  const handleFindReplace = () => {
    if (!searchTerm) return;
    
    const updatedSubtitles = subtitles.map(subtitle => ({
      ...subtitle,
      text: subtitle.text.replace(new RegExp(searchTerm, 'gi'), replaceWith)
    }));
    
    setSubtitles(updatedSubtitles);
    toast({
      title: "Find & Replace Complete",
      description: `Replaced "${searchTerm}" with "${replaceWith}"`,
    });
  };

  const handleExport = async () => {
    try {
      let blob;
      let fileName;
      
      switch (exportFormat) {
        case 'SRT':
          blob = exportSubtitles(subtitles, 'srt');
          fileName = 'subtitles.srt';
          break;
        case 'VTT':
          blob = exportSubtitles(subtitles, 'vtt');
          fileName = 'subtitles.vtt';
          break;
        default:
          toast({
            title: "Export format not supported",
            description: "MP4 export with embedded subtitles is not yet implemented",
            variant: "destructive",
          });
          return;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: `${exportFormat} exported successfully`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export subtitles",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Atrás
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold">SubTitulador Pro</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Formato:</span>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MP4">MP4</SelectItem>
                  <SelectItem value="SRT">SRT</SelectItem>
                  <SelectItem value="VTT">VTT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExport} size="sm" className="bg-primary hover:bg-primary-hover font-medium">
              <Download className="w-4 h-4 mr-2" />
              Exportar video
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Video Area */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Video Player */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black">
            <div className="w-full max-w-4xl">
              <VideoPlayer
                ref={playerRef}
                videoUrl={currentVideo?.url || ''}
                subtitles={subtitles}
                onTimeUpdate={setCurrentTime}
                onDuration={setDuration}
                onPlayStateChange={setIsPlaying}
                onVolumeStateChange={(v, m) => { setVolume(v); setIsMuted(m); }}
                className="w-full"
              />

              <div className="w-full mt-4">
                <VideoControlBar
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  volume={volume}
                  isMuted={isMuted}
                  onPlayPause={() => {
                    if (playerRef.current) {
                      playerRef.current.isPlaying() ? playerRef.current.pause() : playerRef.current.play();
                    }
                  }}
                  onSeek={(t) => playerRef.current?.seekTo(t)}
                  onVolumeChange={(v) => playerRef.current?.setVolume(v)}
                  onMute={() => playerRef.current?.toggleMute()}
                  onToggleFullscreen={() => playerRef.current?.toggleFullscreen()}
                  isFullscreen={false}
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <SubtitleTimeline
            subtitles={subtitles}
            currentTime={currentTime}
            duration={duration}
            onTimeSeek={handleTimeSeek}
            onSubtitleSelect={handleSubtitleSelect}
            selectedSubtitle={selectedSubtitle}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-96 border-l border-border bg-card/30 backdrop-blur-sm">
          <Tabs defaultValue="subtitles" className="h-full flex flex-col">
            <div className="border-b border-border bg-card/50">
              <TabsList className="grid w-full grid-cols-2 m-4 mb-4 bg-background/50">
                <TabsTrigger value="subtitles" className="data-[state=active]:bg-background gap-2">
                  <FileText className="w-4 h-4" />
                  Subtítulos
                </TabsTrigger>
                <TabsTrigger value="styles" className="data-[state=active]:bg-background gap-2">
                  <Palette className="w-4 h-4" />
                  Estilos
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="subtitles" className="flex-1 p-4 overflow-hidden">
              <div className="h-full flex flex-col space-y-4">
                {/* Search and Add Controls */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar en subtítulos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-8 text-sm"
                      />
                    </div>
                    <Button
                      onClick={() => handleAddSubtitle()}
                      size="sm"
                      className="bg-primary hover:bg-primary-hover shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {searchTerm && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Reemplazar con..."
                        value={replaceWith}
                        onChange={(e) => setReplaceWith(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button onClick={handleFindReplace} size="sm" variant="outline">
                        Reemplazar
                      </Button>
                    </div>
                  )}
                </div>

                {/* Subtitle List */}
                <SubtitleTextEditor
                  subtitles={subtitles}
                  onSubtitleUpdate={updateSubtitle}
                  onSubtitleDelete={handleDeleteSubtitle}
                  onSubtitleAdd={addSubtitle}
                  onSeekTo={handleSeekToStart}
                />
              </div>
            </TabsContent>

            <TabsContent value="styles" className="flex-1 p-4 overflow-hidden">
              <div className="h-full flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Editor de Estilos</h3>
                  <AdvancedStyleEditor 
                    onStyleApply={(style) => {
                      // Convert advanced style to current subtitle style format
                      const convertedStyle = {
                        fontFamily: style.fontName,
                        fontSize: style.fontSize,
                        fontWeight: style.bold ? 'bold' : 'normal' as 'normal' | 'bold',
                        color: style.colorPrimary,
                        backgroundColor: style.spaceBox ? 'rgba(0,0,0,0.8)' : undefined,
                        outline: style.outline > 0 ? {
                          enabled: true,
                          color: style.colorOutline,
                          width: style.outline
                        } : { enabled: false, color: '#000000', width: 1 },
                        shadow: style.shadow > 0 ? {
                          enabled: true,
                          color: style.colorShadow,
                          offsetX: style.shadow,
                          offsetY: style.shadow,
                          blur: style.shadow * 2
                        } : { enabled: false, color: '#000000', offsetX: 0, offsetY: 0, blur: 0 },
                        position: {
                          horizontal: style.alignment % 3 === 1 ? 'left' : style.alignment % 3 === 0 ? 'right' : 'center',
                          vertical: style.alignment <= 3 ? 'bottom' : style.alignment <= 6 ? 'middle' : 'top',
                          marginX: (style.marginLeft + style.marginRight) / 2,
                          marginY: style.marginVertical
                        }
                      };
                      setCurrentSubtitleStyle(convertedStyle as any);
                    }}
                  />
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4">
                  <SubtitleStyleEditor
                    style={currentSubtitleStyle}
                    onStyleChange={handleStyleChange}
                  />
                  
                  <StylePresets
                    onPresetApply={(preset) => setCurrentSubtitleStyle(preset.style as any)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
