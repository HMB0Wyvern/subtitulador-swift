import React, { useState } from 'react';
import { SubtitleData } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Search } from 'lucide-react';

interface SubtitleTextEditorProps {
  subtitles: SubtitleData[];
  onSubtitleUpdate: (id: string, updates: Partial<SubtitleData>) => void;
  onSubtitleDelete: (id: string) => void;
  onSubtitleAdd: (afterId?: string) => void;
  onSeekTo: (time: number) => void;
}

export function SubtitleTextEditor({
  subtitles,
  onSubtitleUpdate,
  onSubtitleDelete,
  onSubtitleAdd,
  onSeekTo,
}: SubtitleTextEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [findReplaceMode, setFindReplaceMode] = useState(false);
  const [replaceText, setReplaceText] = useState('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeChange = (id: string, field: 'startTime' | 'endTime', value: string) => {
    const numValue = parseFloat(value) || 0;
    onSubtitleUpdate(id, { [field]: numValue });
  };

  const handleTextChange = (id: string, text: string) => {
    onSubtitleUpdate(id, { text });
  };

  const handleFindReplace = () => {
    if (!searchTerm.trim() || !replaceText.trim()) return;
    
    subtitles.forEach(subtitle => {
      if (subtitle.text.includes(searchTerm)) {
        const newText = subtitle.text.replace(new RegExp(searchTerm, 'g'), replaceText);
        onSubtitleUpdate(subtitle.id, { text: newText });
      }
    });
  };

  const filteredSubtitles = subtitles.filter(subtitle =>
    searchTerm ? subtitle.text.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Subtitle Editor
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSubtitleAdd()}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </CardTitle>
        
        {/* Search and Replace */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subtitles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFindReplaceMode(!findReplaceMode)}
            >
              Replace
            </Button>
          </div>
          
          {findReplaceMode && (
            <div className="flex gap-2">
              <Input
                placeholder="Replace with..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
              />
              <Button
                size="sm"
                onClick={handleFindReplace}
                disabled={!searchTerm.trim() || !replaceText.trim()}
              >
                Replace All
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="text-sm text-muted-foreground px-6 pb-2">
          {filteredSubtitles.length} subtitles
        </div>
        
        <ScrollArea className="h-96 px-6">
          <div className="space-y-3 pb-4">
            {filteredSubtitles.map((subtitle, index) => (
              <div
                key={subtitle.id}
                className="p-4 rounded-lg border bg-card transition-colors hover:bg-accent/5"
              >
                <div className="space-y-3">
                  {/* Time Controls */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Start (s)</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={subtitle.startTime}
                        onChange={(e) => handleTimeChange(subtitle.id, 'startTime', e.target.value)}
                        className="text-sm h-8"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTime(subtitle.startTime)}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">End (s)</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={subtitle.endTime}
                        onChange={(e) => handleTimeChange(subtitle.id, 'endTime', e.target.value)}
                        className="text-sm h-8"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTime(subtitle.endTime)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Text Editor */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Text</label>
                    <Textarea
                      value={subtitle.text}
                      onChange={(e) => handleTextChange(subtitle.id, e.target.value)}
                      className="text-sm min-h-[60px] resize-none"
                      placeholder="Enter subtitle text..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSeekTo(subtitle.startTime)}
                      className="text-xs"
                    >
                      Seek to Start
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSubtitleAdd(subtitle.id)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSubtitleDelete(subtitle.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredSubtitles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No subtitles available yet</p>
                <p className="text-xs mt-1">Processing may still be in progress</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}