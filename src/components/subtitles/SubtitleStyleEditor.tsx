import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  backgroundColor?: string;
  outline: {
    enabled: boolean;
    color: string;
    width: number;
  };
  shadow: {
    enabled: boolean;
    color: string;
    offsetX: number;
    offsetY: number;
    blur: number;
  };
  position: {
    horizontal: 'left' | 'center' | 'right';
    vertical: 'top' | 'middle' | 'bottom';
    marginX: number;
    marginY: number;
  };
}

interface SubtitleStyleEditorProps {
  style: SubtitleStyle;
  onStyleChange: (updates: Partial<SubtitleStyle>) => void;
  onPresetApply: (preset: string) => void;
}

export function SubtitleStyleEditor({ style, onStyleChange, onPresetApply }: SubtitleStyleEditorProps) {
  const fontFamilies = [
    'Inter',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Trebuchet MS',
    'Comic Sans MS',
    'Impact'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Style Editor</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Font Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Font</h4>
          
          <div>
            <Label className="text-xs">Font Family</Label>
            <Select
              value={style.fontFamily}
              onValueChange={(value) => onStyleChange({ fontFamily: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map(font => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs">Font Size: {style.fontSize}px</Label>
            <Slider
              value={[style.fontSize]}
              onValueChange={([value]) => onStyleChange({ fontSize: value })}
              min={8}
              max={96}
              step={0.1}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label className="text-xs">Font Weight</Label>
            <Select
              value={style.fontWeight}
              onValueChange={(value: 'normal' | 'bold') => onStyleChange({ fontWeight: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Colors */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Colors</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Text Color</Label>
              <Input
                type="color"
                value={style.color}
                onChange={(e) => onStyleChange({ color: e.target.value })}
                className="h-10"
              />
            </div>
            
            <div>
              <Label className="text-xs">Background Color</Label>
              <Input
                type="color"
                value={style.backgroundColor || '#000000'}
                onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
                className="h-10"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Outline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Outline</h4>
            <Button
              size="sm"
              variant={style.outline.enabled ? "default" : "outline"}
              onClick={() => onStyleChange({ 
                outline: { ...style.outline, enabled: !style.outline.enabled } 
              })}
            >
              {style.outline.enabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          {style.outline.enabled && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Outline Color</Label>
                <Input
                  type="color"
                  value={style.outline.color}
                  onChange={(e) => onStyleChange({ 
                    outline: { ...style.outline, color: e.target.value } 
                  })}
                  className="h-10"
                />
              </div>
              
              <div>
                <Label className="text-xs">Width: {style.outline.width}px</Label>
                <Slider
                  value={[style.outline.width]}
                  onValueChange={([value]) => onStyleChange({
                    outline: { ...style.outline, width: value }
                  })}
                  min={0}
                  max={10}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Shadow */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Shadow</h4>
            <Button
              size="sm"
              variant={style.shadow.enabled ? "default" : "outline"}
              onClick={() => onStyleChange({ 
                shadow: { ...style.shadow, enabled: !style.shadow.enabled } 
              })}
            >
              {style.shadow.enabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          {style.shadow.enabled && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Shadow Color</Label>
                <Input
                  type="color"
                  value={style.shadow.color}
                  onChange={(e) => onStyleChange({ 
                    shadow: { ...style.shadow, color: e.target.value } 
                  })}
                  className="h-10"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Offset X: {style.shadow.offsetX}px</Label>
                  <Slider
                    value={[style.shadow.offsetX]}
                    onValueChange={([value]) => onStyleChange({
                      shadow: { ...style.shadow, offsetX: value }
                    })}
                    min={-50}
                    max={50}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Offset Y: {style.shadow.offsetY}px</Label>
                  <Slider
                    value={[style.shadow.offsetY]}
                    onValueChange={([value]) => onStyleChange({
                      shadow: { ...style.shadow, offsetY: value }
                    })}
                    min={-50}
                    max={50}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-xs">Blur: {style.shadow.blur}px</Label>
                <Slider
                  value={[style.shadow.blur]}
                  onValueChange={([value]) => onStyleChange({
                    shadow: { ...style.shadow, blur: value }
                  })}
                  min={0}
                  max={50}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Position */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Position</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Horizontal</Label>
              <Select
                value={style.position.horizontal}
                onValueChange={(value: 'left' | 'center' | 'right') => onStyleChange({ 
                  position: { ...style.position, horizontal: value } 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs">Vertical</Label>
              <Select
                value={style.position.vertical}
                onValueChange={(value: 'top' | 'middle' | 'bottom') => onStyleChange({ 
                  position: { ...style.position, vertical: value } 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="middle">Middle</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Margin X: {style.position.marginX}px</Label>
              <Slider
                value={[style.position.marginX]}
                onValueChange={([value]) => onStyleChange({
                  position: { ...style.position, marginX: value }
                })}
                min={0}
                max={200}
                step={0.5}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="text-xs">Margin Y: {style.position.marginY}px</Label>
              <Slider
                value={[style.position.marginY]}
                onValueChange={([value]) => onStyleChange({
                  position: { ...style.position, marginY: value }
                })}
                min={0}
                max={200}
                step={0.5}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
