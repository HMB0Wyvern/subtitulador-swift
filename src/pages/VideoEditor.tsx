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
      color: 'rgba(0, 0, 0, 0.8)',
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

  const handleTimeUpdate = (currentTime: number) => {
    // Handle time updates for synchronization
    console.log('Current time:', currentTime);
  };

  const handleSubtitleSelect = (subtitle: any) => {
    setCurrentSubtitle(subtitle);
  };

  const handleSeekTo = (time: number) => {
    videoPlayerRef.current?.seekTo(time);
  };

  const handleStyleChange = (updates: Partial<SubtitleStyle>) => {
    setCurrentStyle(prev => ({ ...prev, ...updates }));
    // Apply style to all subtitles in real-time
    subtitles.forEach(subtitle => {
      const styleUpdates: any = {};
      
      // Map SubtitleStyle to SubtitleStyles format
      if (updates.fontFamily) styleUpdates.fontFamily = updates.fontFamily;
      if (updates.fontSize) styleUpdates.fontSize = updates.fontSize;
      if (updates.fontWeight) styleUpdates.fontWeight = updates.fontWeight;
      if (updates.color) styleUpdates.color = updates.color;
      if (updates.backgroundColor) styleUpdates.backgroundColor = updates.backgroundColor;
      
      if (updates.outline) {
        styleUpdates.outline = {
          width: updates.outline.enabled ? updates.outline.width : 0,
          color: updates.outline.color
        };
      }
      
      if (updates.shadow) {
        styleUpdates.shadow = {
          offsetX: updates.shadow.enabled ? updates.shadow.offsetX : 0,
          offsetY: updates.shadow.enabled ? updates.shadow.offsetY : 0,
          blur: updates.shadow.enabled ? updates.shadow.blur : 0,
          color: updates.shadow.color
        };
      }
      
      if (updates.position) {
        styleUpdates.position = {
          horizontal: updates.position.horizontal,
          vertical: updates.position.vertical === 'middle' ? 'center' : updates.position.vertical,
          marginX: updates.position.marginX,
          marginY: updates.position.marginY
        };
      }
      
      updateSubtitle(subtitle.id, {
        styles: {
          ...subtitle.styles,
          ...styleUpdates
        }
      });
    });
  };

  const handlePresetApply = (preset: any) => {
    setCurrentStyle(preset.style);
    // Apply preset to all subtitles
    subtitles.forEach(subtitle => {
      const mappedStyle = {
        fontFamily: preset.style.fontFamily,
        fontSize: preset.style.fontSize,
        fontWeight: preset.style.fontWeight,
        color: preset.style.color,
        backgroundColor: preset.style.backgroundColor,
        outline: {
          width: preset.style.outline.enabled ? preset.style.outline.width : 0,
          color: preset.style.outline.color
        },
        shadow: {
          offsetX: preset.style.shadow.enabled ? preset.style.shadow.offsetX : 0,
          offsetY: preset.style.shadow.enabled ? preset.style.shadow.offsetY : 0,
          blur: preset.style.shadow.enabled ? preset.style.shadow.blur : 0,
          color: preset.style.shadow.color
        },
        position: {
          horizontal: preset.style.position.horizontal,
          vertical: preset.style.position.vertical === 'middle' ? 'center' : preset.style.position.vertical,
          marginX: preset.style.position.marginX,
          marginY: preset.style.position.marginY
        }
      };
      
      updateSubtitle(subtitle.id, { styles: mappedStyle });
    });
  };

  const handleBackToUpload = () => {
    resetState();
    navigate('/');
  };

  const [openPanel, setOpenPanel] = useState<null | 'choose' | 'modify'>(null);
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

  const handleDownload = () => {
    toast({
      title: 'Export coming soon',
      description: 'Export options will be enabled in a later phase.',
    });
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
          <div className="lg:col-span-3">
            <div className="space-y-3">
              <Button
                variant={openPanel === 'choose' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setOpenPanel(p => (p === 'choose' ? null : 'choose'))}
              >
                <Palette className="w-4 h-4 mr-2" /> Elegir estilos
              </Button>
              <Button
                variant={openPanel === 'modify' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setOpenPanel(p => (p === 'modify' ? null : 'modify'))}
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
                                <div className="flex gap-2">
                                  <Button size="sm" variant="secondary" onClick={() => applyCustomStyle(s)}>Aplicar</Button>
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

                {/* Export Options */}
            <Card className="mt-3">
              <CardHeader>
                <CardTitle className="text-lg">Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={useVideoStore.getState().exportPreferences.formats.srt} onChange={(e)=>useVideoStore.getState().setExportPreferences({ formats: { srt: e.target.checked } as any })} />
                    .srt
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={useVideoStore.getState().exportPreferences.formats.ass} onChange={(e)=>useVideoStore.getState().setExportPreferences({ formats: { ass: e.target.checked } as any })} />
                    .ass
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={useVideoStore.getState().exportPreferences.formats.json} onChange={(e)=>useVideoStore.getState().setExportPreferences({ formats: { json: e.target.checked } as any })} />
                    .json
                  </label>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span>Calidad</span>
                  <select
                    className="h-9 rounded-md border border-input bg-background px-2"
                    defaultValue={useVideoStore.getState().exportPreferences.quality}
                    onChange={(e)=>useVideoStore.getState().setExportPreferences({ quality: e.target.value as any })}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    const { currentVideo: cv, exportPreferences } = useVideoStore.getState();
                    try {
                      const base = (cv?.name?.split('.').slice(0, -1).join('.') || 'subtitles');
                      if (exportPreferences.formats.srt) {
                        const srt = subtitlesToSRT(subtitles);
                        triggerDownload(`${base}.srt`, srt, 'text/plain;charset=utf-8');
                      }
                      if (exportPreferences.formats.ass) {
                        const ass = subtitlesToASS(subtitles);
                        triggerDownload(`${base}.ass`, ass, 'text/plain;charset=utf-8');
                      }
                      if (exportPreferences.formats.json) {
                        const json = JSON.stringify(subtitles, null, 2);
                        triggerDownload(`${base}.json`, json, 'application/json;charset=utf-8');
                      }
                      toast({ title: 'Descargas iniciadas', description: 'Subtítulos exportados.' });
                    } catch (e) {
                      toast({ title: 'Error al descargar', description: e instanceof Error ? e.message : 'Fallo exportando archivos' });
                    }
                  }}
                >
                  Descargar ahora
                </Button>
              </CardContent>
            </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
