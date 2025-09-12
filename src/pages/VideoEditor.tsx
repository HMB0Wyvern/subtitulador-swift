import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoPlayer, VideoPlayerRef } from '@/components/video/VideoPlayer';
import { VideoControlBar } from '@/components/video/VideoControlBar';
import { SubtitleTextEditor } from '@/components/subtitles/SubtitleTextEditor';
import { SubtitleStyleEditor, SubtitleStyle } from '@/components/subtitles/SubtitleStyleEditor';
import { StylePresets } from '@/components/subtitles/StylePresets';
import { useVideoStore } from '@/store/useVideoStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Settings, Palette, Pencil } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { subtitlesToSRT, subtitlesToASS, triggerDownload } from '@/utils/subtitleExport';

export default function VideoEditor() {
  const navigate = useNavigate();
  const {
    currentVideo,
    subtitles,
    setCurrentSubtitle,
    updateSubtitle,
    deleteSubtitle,
    addSubtitle,
    resetState
  } = useVideoStore();

  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  type CustomStyle = { id: string; name: string; style: SubtitleStyle };

  const [currentStyle, setCurrentStyle] = useState<SubtitleStyle>({
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    colorOpacity: 100,
    backgroundColor: '#000000',
    backgroundEnabled: false,
    backgroundOpacity: 80,
    backgroundPadding: { top: 4, right: 8, bottom: 4, left: 8 },
    backgroundRadius: 4,
    outline: {
      enabled: true,
      color: '#000000',
      width: 2,
      opacity: 100
    },
    shadow: {
      enabled: true,
      color: '#000000',
      opacity: 80,
      offsetX: 1,
      offsetY: 1,
      blur: 2
    },
    position: {
      horizontal: 'center',
      vertical: 'bottom',
      marginX: 20,
      marginY: 60
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [playerWidth, setPlayerWidth] = useState<number>(0);

  const computePlayerWidth = useCallback((w: number, h: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxW = vw * 0.7;
    const maxH = vh * 0.7;
    const ratio = w / h;
    const widthBasedOnHeight = maxH * ratio;
    const width = Math.min(maxW, widthBasedOnHeight);
    setPlayerWidth(width);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (naturalSize) computePlayerWidth(naturalSize.w, naturalSize.h);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [naturalSize, computePlayerWidth]);

  const onTimeUpdate = (t: number) => setCurrentTime(t);
  const onPlayStateChange = (p: boolean) => setIsPlaying(p);
  const onVolumeStateChange = (v: number, m: boolean) => { setVolume(v); setIsMuted(m); };
  const onDuration = (d: number) => setDuration(d);
  const onNaturalSize = (w: number, h: number) => { setNaturalSize({ w, h }); computePlayerWidth(w, h); };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleSubtitleSelect = (subtitle: any) => {
    setCurrentSubtitle(subtitle);
  };

  const handleSeekTo = (time: number) => {
    videoPlayerRef.current?.seekTo(time);
  };

  const hexToRgba = (hex: string, opacity: number) => {
    const c = hex.replace('#','');
    const r = parseInt(c.length === 3 ? c[0]+c[0] : c.slice(0,2), 16);
    const g = parseInt(c.length === 3 ? c[1]+c[1] : c.slice(2,4), 16);
    const b = parseInt(c.length === 3 ? c[2]+c[2] : c.slice(4,6), 16);
    const a = Math.max(0, Math.min(100, opacity)) / 100;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  const applyStyleToAll = (style: SubtitleStyle) => {
    subtitles.forEach((subtitle) => {
      const mapped: any = {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        color: hexToRgba(style.color, style.colorOpacity ?? 100),
        backgroundColor: style.backgroundEnabled ? hexToRgba(style.backgroundColor || '#000000', style.backgroundOpacity ?? 100) : 'transparent',
        outline: {
          width: style.outline.enabled ? style.outline.width : 0,
          color: hexToRgba(style.outline.color, style.outline.opacity ?? 100)
        },
        shadow: {
          offsetX: style.shadow.enabled ? style.shadow.offsetX : 0,
          offsetY: style.shadow.enabled ? style.shadow.offsetY : 0,
          blur: style.shadow.enabled ? style.shadow.blur : 0,
          color: hexToRgba(style.shadow.color, style.shadow.opacity ?? 100)
        },
        position: {
          horizontal: style.position.horizontal,
          vertical: style.position.vertical === 'middle' ? 'center' : style.position.vertical,
          marginX: style.position.marginX,
          marginY: style.position.marginY
        },
        backgroundPadding: style.backgroundPadding,
        backgroundRadius: style.backgroundRadius,
      };

      updateSubtitle(subtitle.id, { styles: { ...subtitle.styles, ...mapped } as any });
    });
  };

  const handleStyleChange = (updates: Partial<SubtitleStyle>) => {
    setCurrentStyle((prev) => {
      const next: SubtitleStyle = {
        ...prev,
        ...updates,
        outline: { ...prev.outline, ...(updates.outline || {}) },
        shadow: { ...prev.shadow, ...(updates.shadow || {}) },
        position: { ...prev.position, ...(updates.position || {}) },
        backgroundPadding: updates.backgroundPadding || prev.backgroundPadding,
      } as SubtitleStyle;
      applyStyleToAll(next);
      return next;
    });
  };

  const handlePresetApply = (preset: any) => {
    setCurrentStyle(preset.style);
    applyStyleToAll(preset.style);
  };

  const handleBackToUpload = () => {
    resetState();
    navigate('/');
  };

  const [openPanel, setOpenPanel] = useState<null | 'choose' | 'modify'>(null);
  const [editingStyleId, setEditingStyleId] = useState<string | null>(null);
  const [originalEditingStyle, setOriginalEditingStyle] = useState<SubtitleStyle | null>(null);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [pendingPanel, setPendingPanel] = useState<null | 'choose' | 'modify'>(null);

  const isDirty = useMemo(() => {
    if (!editingStyleId || !originalEditingStyle) return false;
    try { return JSON.stringify(originalEditingStyle) !== JSON.stringify(currentStyle); } catch { return false; }
  }, [editingStyleId, originalEditingStyle, currentStyle]);

  const guardedSetOpenPanel = (next: null | 'choose' | 'modify') => {
    if (openPanel === 'modify' && isDirty && next !== 'modify') {
      setPendingPanel(next);
      setConfirmLeaveOpen(true);
      return;
    }
    setOpenPanel(next);
  };
  const [customStyles, setCustomStyles] = useState<CustomStyle[]>(() => {
    try {
      const raw = localStorage.getItem('customStyles');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const saveCustomStyle = () => {
    const name = prompt('Nombre para el estilo');
    if (!name) return;
    const entry: CustomStyle = { id: `${Date.now()}`, name, style: currentStyle };
    const next = [entry, ...customStyles].slice(0, 50);
    setCustomStyles(next);
    localStorage.setItem('customStyles', JSON.stringify(next));
    toast({ title: 'Estilo guardado', description: `"${name}" añadido a tus estilos.` });
  };

  const applyCustomStyle = (entry: CustomStyle) => {
    setCurrentStyle(entry.style);
    handlePresetApply({ style: entry.style });
  };

  const removeCustomStyle = (id: string) => {
    const next = customStyles.filter(s => s.id !== id);
    setCustomStyles(next);
    localStorage.setItem('customStyles', JSON.stringify(next));
  };

  const styleToAssOpts = (s: SubtitleStyle) => {
    const rgba = (hex: string, opacity: number) => hexToRgba(hex, opacity);
    const hv = s.position.horizontal;
    const vv = s.position.vertical === 'middle' ? 'center' : s.position.vertical;
    const alignMap: Record<string, number> = {
      'bottom_left': 1, 'bottom_center': 2, 'bottom_right': 3,
      'center_left': 4, 'center_center': 5, 'center_right': 6,
      'top_left': 7, 'top_center': 8, 'top_right': 9,
    } as const;
    const key = `${vv}_${hv}`;
    const alignment = (alignMap as any)[key] || 2;
    return {
      fontName: s.fontFamily,
      fontSize: s.fontSize,
      primaryColor: rgba(s.color, s.colorOpacity ?? 100),
      outlineColor: rgba(s.outline.color, s.outline.opacity ?? 100),
      outlineWidth: s.outline.enabled ? s.outline.width : 0,
      shadowColor: rgba(s.shadow.color, s.shadow.opacity ?? 100),
      shadowBlur: s.shadow.enabled ? s.shadow.blur : 0,
      alignment: alignment as 1|2|3|4|5|6|7|8|9,
      marginL: s.position.marginX,
      marginR: s.position.marginX,
      marginV: s.position.marginY,
    };
  };

  const doExport = (quality: 'low'|'medium'|'high') => {
    const { currentVideo: cv } = useVideoStore.getState();
    const base = (cv?.name?.split('.').slice(0, -1).join('.') || 'subtitles');
    try {
      if (quality === 'high' || quality === 'medium' || quality === 'low') {
        const srt = subtitlesToSRT(subtitles);
        triggerDownload(`${base}.srt`, srt, 'text/plain;charset=utf-8');
      }
      if (quality === 'high' || quality === 'medium') {
        const ass = subtitlesToASS(subtitles, styleToAssOpts(currentStyle));
        triggerDownload(`${base}.ass`, ass, 'text/plain;charset=utf-8');
      }
      if (quality === 'high') {
        const json = JSON.stringify(subtitles, null, 2);
        triggerDownload(`${base}.json`, json, 'application/json;charset=utf-8');
      }
      toast({ title: 'Descargas iniciadas', description: 'Exportación de subtítulos según la calidad seleccionada.' });
    } catch (e) {
      toast({ title: 'Error al exportar', description: e instanceof Error ? e.message : 'Fallo exportando archivos' });
    }
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
          
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Selecciona calidad y formato de exportación</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Exportar Subtítulos</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => doExport('high')}>Alta (SRT + ASS + JSON)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doExport('medium')}>Media (SRT + ASS)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doExport('low')}>Baja (SRT)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TooltipProvider>
        </div>
      </header>

      {/* Main Editor Layout */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Subtitle Text Editor Panel */}
          <div className="lg:col-span-3 space-y-4">
            <SubtitleTextEditor
              subtitles={subtitles}
              onSubtitleUpdate={updateSubtitle}
              onSubtitleDelete={deleteSubtitle}
              onSubtitleAdd={addSubtitle}
              onSeekTo={handleSeekTo}
            />
          </div>

          {/* Video Player - Center */}
          <div className="lg:col-span-6">
            <div className="w-full flex justify-center">
              <div style={{ width: playerWidth ? `${playerWidth}px` : '70vw' }}>
                <VideoPlayer
                  ref={videoPlayerRef}
                  videoUrl={currentVideo.url || ''}
                  subtitles={subtitles}
                  onTimeUpdate={onTimeUpdate}
                  onPlayStateChange={onPlayStateChange}
                  onVolumeStateChange={onVolumeStateChange}
                  onDuration={onDuration}
                  onNaturalSize={onNaturalSize}
                  onSubtitleSelect={handleSubtitleSelect}
                  className="w-full"
                />
              </div>
            </div>
            <div className="mt-3">
              <VideoControlBar
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                isMuted={isMuted}
                isFullscreen={isFullscreen}
                onPlayPause={() => (isPlaying ? videoPlayerRef.current?.pause() : videoPlayerRef.current?.play())}
                onSeek={(t) => videoPlayerRef.current?.seekTo(t)}
                onVolumeChange={(v) => videoPlayerRef.current?.setVolume(v)}
                onMute={() => videoPlayerRef.current?.toggleMute()}
                onToggleFullscreen={() => videoPlayerRef.current?.toggleFullscreen()}
              />
            </div>
          </div>

          {/* Style Controls Panel */}
          <div className="lg:col-span-3">
            <div className="space-y-3">
              <Button
                variant={openPanel === 'choose' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => guardedSetOpenPanel(openPanel === 'choose' ? null : 'choose')}
              >
                <Palette className="w-4 h-4 mr-2" /> Elegir estilos
              </Button>
              <Button
                variant={openPanel === 'modify' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => guardedSetOpenPanel(openPanel === 'modify' ? null : 'modify')}
              >
                <Pencil className="w-4 h-4 mr-2" /> Modificar estilo
              </Button>
            </div>

            {/* Sliding panel area */}
            <div className="relative mt-3 h-[1px]">
              <div
                className={`absolute right-0 top-0 z-10 w-full translate-x-0 transition-transform duration-300 ${openPanel ? 'translate-x-0' : 'translate-x-full'} `}
              >
                {openPanel === 'choose' && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Tus estilos</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button size="sm" variant="outline" onClick={saveCustomStyle} className="w-full">
                          Guardar estilo actual
                        </Button>
                        {customStyles.length === 0 ? (
                          <div className="text-xs text-muted-foreground">No tienes estilos guardados.</div>
                        ) : (
                          <div className="space-y-2">
                            {customStyles.map(s => (
                              <div key={s.id} className="flex items-center justify-between rounded-md border p-2">
                                <div className="text-sm font-medium truncate pr-2">{s.name}</div>
                                <div className="flex gap-2 items-center">
                                  {editingStyleId === s.id && isDirty && (
                                    <span className="text-xs text-amber-600">Cambios sin guardar</span>
                                  )}
                                  <Button size="sm" variant="secondary" onClick={() => applyCustomStyle(s)}>Aplicar</Button>
                                  <Button size="sm" variant="outline" onClick={() => { setEditingStyleId(s.id); setOriginalEditingStyle(s.style); setCurrentStyle(s.style); setOpenPanel('modify'); }}>Editar</Button>
                                  <Button size="sm" variant="ghost" onClick={() => removeCustomStyle(s.id)}>Eliminar</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <StylePresets onPresetApply={handlePresetApply} />
                  </div>
                )}

                {openPanel === 'modify' && (
                  <SubtitleStyleEditor
                    style={currentStyle}
                    onStyleChange={handleStyleChange}
                    onPresetApply={handlePresetApply}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={confirmLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tienes cambios sin guardar</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas guardar los cambios del estilo antes de salir?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setConfirmLeaveOpen(false); setPendingPanel(null); }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (editingStyleId) {
                const idx = customStyles.findIndex((s) => s.id === editingStyleId);
                if (idx !== -1) {
                  const next = [...customStyles];
                  next[idx] = { ...next[idx], style: currentStyle };
                  setCustomStyles(next);
                  localStorage.setItem('customStyles', JSON.stringify(next));
                  setOriginalEditingStyle(currentStyle);
                  toast({ title: 'Estilo guardado', description: 'Los cambios han sido guardados.' });
                }
              }
              setConfirmLeaveOpen(false);
              setOpenPanel(pendingPanel);
              setPendingPanel(null);
            }}>Guardar</AlertDialogAction>
            <AlertDialogAction onClick={() => {
              if (originalEditingStyle) {
                setCurrentStyle(originalEditingStyle);
                applyStyleToAll(originalEditingStyle);
              }
              setConfirmLeaveOpen(false);
              setOpenPanel(pendingPanel);
              setPendingPanel(null);
            }}>Descartar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
