import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubtitleStyle } from './SubtitleStyleEditor';

interface StylePreset {
  id: string;
  name: string;
  description: string;
  category: 'social' | 'education' | 'professional' | 'creative';
  style: SubtitleStyle;
}

const presets: StylePreset[] = [
  {
    id: 'social-modern',
    name: 'Social Media Modern',
    description: 'Bold, clean style for social platforms',
    category: 'social',
    style: {
      fontFamily: 'Inter',
      fontSize: 32,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: '#000000',
      outline: {
        enabled: true,
        color: '#000000',
        width: 2
      },
      shadow: {
        enabled: false,
        color: '#000000',
        offsetX: 2,
        offsetY: 2,
        blur: 4
      },
      position: {
        horizontal: 'center',
        vertical: 'bottom',
        marginX: 20,
        marginY: 40
      }
    }
  },
  {
    id: 'education-clean',
    name: 'Educational Clean',
    description: 'Professional and readable for tutorials',
    category: 'education',
    style: {
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: 'normal',
      color: '#ffffff',
      outline: {
        enabled: true,
        color: '#1a1a1a',
        width: 1
      },
      shadow: {
        enabled: true,
        color: '#000000',
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
    }
  },
  {
    id: 'professional-elegant',
    name: 'Professional Elegant',
    description: 'Sophisticated style for business content',
    category: 'professional',
    style: {
      fontFamily: 'Georgia',
      fontSize: 22,
      fontWeight: 'normal',
      color: '#f8f9fa',
      outline: {
        enabled: false,
        color: '#000000',
        width: 1
      },
      shadow: {
        enabled: true,
        color: '#000000',
        offsetX: 0,
        offsetY: 2,
        blur: 8
      },
      position: {
        horizontal: 'center',
        vertical: 'bottom',
        marginX: 40,
        marginY: 80
      }
    }
  },
  {
    id: 'creative-fun',
    name: 'Creative Fun',
    description: 'Playful style with vibrant colors',
    category: 'creative',
    style: {
      fontFamily: 'Comic Sans MS',
      fontSize: 28,
      fontWeight: 'bold',
      color: '#ff6b6b',
      backgroundColor: '#ffffff',
      outline: {
        enabled: true,
        color: '#4ecdc4',
        width: 3
      },
      shadow: {
        enabled: true,
        color: '#45b7d1',
        offsetX: 3,
        offsetY: 3,
        blur: 6
      },
      position: {
        horizontal: 'center',
        vertical: 'middle',
        marginX: 20,
        marginY: 20
      }
    }
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Simple and unobtrusive',
    category: 'professional',
    style: {
      fontFamily: 'Helvetica',
      fontSize: 20,
      fontWeight: 'normal',
      color: '#ffffff',
      outline: {
        enabled: false,
        color: '#000000',
        width: 1
      },
      shadow: {
        enabled: false,
        color: '#000000',
        offsetX: 0,
        offsetY: 0,
        blur: 0
      },
      position: {
        horizontal: 'center',
        vertical: 'bottom',
        marginX: 20,
        marginY: 30
      }
    }
  }
];

interface StylePresetsProps {
  onPresetApply: (preset: StylePreset) => void;
}

export function StylePresets({ onPresetApply }: StylePresetsProps) {
  const getCategoryColor = (category: StylePreset['category']) => {
    switch (category) {
      case 'social': return 'bg-blue-100 text-blue-800';
      case 'education': return 'bg-green-100 text-green-800';
      case 'professional': return 'bg-purple-100 text-purple-800';
      case 'creative': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Style Presets</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-sm">{preset.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {preset.description}
                </p>
              </div>
              <Badge className={getCategoryColor(preset.category)} variant="secondary">
                {preset.category}
              </Badge>
            </div>
            
            {/* Preview */}
            <div className="my-3 p-3 bg-black rounded-md relative overflow-hidden min-h-[60px] flex items-center justify-center">
              <div
                style={{
                  fontFamily: preset.style.fontFamily,
                  fontSize: `${Math.max(12, preset.style.fontSize * 0.5)}px`,
                  fontWeight: preset.style.fontWeight,
                  color: preset.style.color,
                  backgroundColor: preset.style.backgroundColor,
                  textShadow: preset.style.shadow.enabled 
                    ? `${preset.style.shadow.offsetX}px ${preset.style.shadow.offsetY}px ${preset.style.shadow.blur}px ${preset.style.shadow.color}`
                    : 'none',
                  WebkitTextStroke: preset.style.outline.enabled 
                    ? `${preset.style.outline.width}px ${preset.style.outline.color}`
                    : 'none',
                  padding: preset.style.backgroundColor ? '4px 8px' : 0,
                  borderRadius: preset.style.backgroundColor ? '4px' : 0,
                }}
              >
                Sample subtitle text
              </div>
            </div>
            
            <Button
              size="sm"
              onClick={() => onPresetApply(preset)}
              className="w-full"
            >
              Apply Style
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}