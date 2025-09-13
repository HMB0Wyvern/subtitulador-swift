import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Settings, Palette, Type, AlignCenter } from 'lucide-react';

interface AdvancedStyleData {
  name: string;
  fontName: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeout: boolean;
  colorPrimary: string;
  colorSecondary: string;
  colorOutline: string;
  colorShadow: string;
  marginLeft: number;
  marginRight: number;
  marginVertical: number;
  alignment: number; // 1-9
  outline: number;
  shadow: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  spacing: number;
  encoding: number;
  spaceBox: boolean;
}

interface AdvancedStyleEditorProps {
  onStyleApply: (style: AdvancedStyleData) => void;
}

type SavedStyle = AdvancedStyleData & { id: string };

const fontOptions = [
  'Arial', 'Roboto', 'Inter', 'Helvetica', 'Georgia', 'Times New Roman', 
  'Verdana', 'Tahoma', 'Comic Sans MS', 'Impact', 'Trebuchet MS', 
  'Arial Black', 'Palatino', 'Garamond', 'Bookman', 'Avant Garde'
];

export function AdvancedStyleEditor({ onStyleApply }: AdvancedStyleEditorProps) {
  const [open, setOpen] = useState(false);
  const [styles, setStyles] = useState<SavedStyle[]>(() => {
    const raw = localStorage.getItem('subtitleStyles');
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return [];
  });
  const [activeStyleId, setActiveStyleId] = useState<string | null>(null);
  const [styleData, setStyleData] = useState<AdvancedStyleData>({
    name: 'Default',
    fontName: 'Arial',
    fontSize: 16,
    bold: false,
    italic: false,
    underline: false,
    strikeout: false,
    colorPrimary: '#FFFFFF',
    colorSecondary: '#FF0000',
    colorOutline: '#000000',
    colorShadow: '#000000',
    marginLeft: 10,
    marginRight: 10,
    marginVertical: 10,
    alignment: 2, // Bottom center
    outline: 1.5,
    shadow: 0.0,
    scaleX: 100,
    scaleY: 100,
    rotation: 0,
    spacing: 0.0,
    encoding: 1,
    spaceBox: false
  });

  const updateStyle = (field: keyof AdvancedStyleData, value: any) => {
    setStyleData(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onStyleApply(styleData);
    if (styleData.name.trim()) {
      setStyles(prev => {
        const id = activeStyleId || `style_${Date.now()}`;
        const next: SavedStyle[] = [
          ...prev.filter(s => s.id !== id),
          { id, ...styleData }
        ];
        localStorage.setItem('subtitleStyles', JSON.stringify(next));
        setActiveStyleId(id);
        return next;
      });
    }
    setOpen(false);
  };

  const getAlignmentGrid = () => {
    const positions = [
      { value: 7, label: 'TL' }, { value: 8, label: 'TC' }, { value: 9, label: 'TR' },
      { value: 4, label: 'ML' }, { value: 5, label: 'MC' }, { value: 6, label: 'MR' },
      { value: 1, label: 'BL' }, { value: 2, label: 'BC' }, { value: 3, label: 'BR' }
    ];

    return (
      <div className="grid grid-cols-3 gap-1 w-24">
        {positions.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`w-7 h-7 text-xs border rounded transition-colors ${
              styleData.alignment === value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border hover:bg-accent'
            }`}
            onClick={() => updateStyle('alignment', value)}
          >
            {label}
          </button>
        ))}
      </div>
    );
  };

  const newStyle = () => {
    const id = `style_${Date.now()}`;
    const base: SavedStyle = { id, ...styleData, name: `Style ${styles.length + 1}` };
    setStyles(prev => {
      const next = [...prev, base];
      localStorage.setItem('subtitleStyles', JSON.stringify(next));
      return next;
    });
    setActiveStyleId(id);
    setStyleData(base);
  };

  const duplicateStyle = () => {
    if (!activeStyleId) return;
    const original = styles.find(s => s.id === activeStyleId);
    if (!original) return;
    const id = `style_${Date.now()}`;
    const dup: SavedStyle = { ...original, id, name: `${original.name} Copy` };
    setStyles(prev => {
      const next = [...prev, dup];
      localStorage.setItem('subtitleStyles', JSON.stringify(next));
      return next;
    });
    setActiveStyleId(id);
    const { id: _id, ...rest } = dup;
    setStyleData(rest);
  };

  const deleteStyle = () => {
    if (!activeStyleId) return;
    setStyles(prev => {
      const next = prev.filter(s => s.id !== activeStyleId);
      localStorage.setItem('subtitleStyles', JSON.stringify(next));
      return next;
    });
    const fallback = styles.find(s => s.id !== activeStyleId) || null;
    setActiveStyleId(fallback?.id || null);
    if (fallback) {
      const { id, ...rest } = fallback as SavedStyle;
      setStyleData(rest);
    }
  };

  const selectStyle = (id: string) => {
    setActiveStyleId(id);
    const found = styles.find(s => s.id === id);
    if (found) {
      const { id: _id, ...rest } = found;
      setStyleData(rest);
    }
  };

  const renameStyle = (id: string, name: string) => {
    setStyles(prev => {
      const next = prev.map(s => (s.id === id ? { ...s, name } : s));
      localStorage.setItem('subtitleStyles', JSON.stringify(next));
      return next;
    });
    if (activeStyleId === id) setStyleData(prev => ({ ...prev, name }));
  };

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) => (
    <div className="flex items-center gap-2">
      <Label className="text-xs min-w-[60px]">{label}:</Label>
      <div className="flex items-center gap-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-6 border border-border rounded cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs h-6 w-20"
          placeholder="#FFFFFF"
        />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="w-4 h-4" />
          Editor Avanzado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Editor de Estilos Aegisub
          </DialogTitle>
        </DialogHeader>

        {/* Gestión de estilos */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Nombre de estilo:</Label>
            <Input value={styleData.name} onChange={(e) => updateStyle('name', e.target.value)} className="h-8 w-48" />
            <Select value={activeStyleId || ''} onValueChange={selectStyle}>
              <SelectTrigger className="h-8 w-44">
                <SelectValue placeholder="Seleccionar estilo" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {styles.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={newStyle}>Nuevo</Button>
            <Button size="sm" variant="outline" onClick={duplicateStyle}>Duplicar</Button>
            <Button size="sm" variant="destructive" onClick={deleteStyle}>Eliminar</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vista Previa */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <AlignCenter className="w-4 h-4" />
              Vista Previa
            </h3>
            <div 
              className="bg-black rounded-md p-4 min-h-[120px] flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(45deg, #2a2a2a 25%, transparent 25%), 
                                 linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), 
                                 linear-gradient(45deg, transparent 75%, #2a2a2a 75%), 
                                 linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}
            >
              <div
                style={{
                  fontFamily: styleData.fontName,
                  fontSize: `${Math.max(12, styleData.fontSize * 0.7)}px`,
                  fontWeight: styleData.bold ? 'bold' : 'normal',
                  fontStyle: styleData.italic ? 'italic' : 'normal',
                  textDecoration: `${styleData.underline ? 'underline' : ''} ${styleData.strikeout ? 'line-through' : ''}`,
                  color: styleData.colorPrimary,
                  textShadow: styleData.shadow > 0 
                    ? `${styleData.shadow}px ${styleData.shadow}px ${styleData.shadow * 2}px ${styleData.colorShadow}`
                    : 'none',
                  WebkitTextStroke: styleData.outline > 0 
                    ? `${styleData.outline}px ${styleData.colorOutline}`
                    : 'none',
                  transform: `scale(${styleData.scaleX / 100}, ${styleData.scaleY / 100}) rotate(${styleData.rotation}deg)`,
                  letterSpacing: `${styleData.spacing}px`,
                  backgroundColor: styleData.spaceBox ? 'rgba(0,0,0,0.8)' : 'transparent',
                  padding: styleData.spaceBox ? '4px 8px' : 0,
                  borderRadius: styleData.spaceBox ? '4px' : 0,
                }}
              >
                Sample Text Preview
              </div>
            </div>
          </div>

          {/* Configuración de Fuente */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Type className="w-4 h-4" />
              Fuente
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Nombre del Estilo</Label>
                <Input
                  value={styleData.name}
                  onChange={(e) => updateStyle('name', e.target.value)}
                  className="h-8"
                />
              </div>

              <div>
                <Label className="text-sm">Fuente</Label>
                <Select value={styleData.fontName} onValueChange={(value) => updateStyle('fontName', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-40">
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Tamaño</Label>
                <Input
                  type="number"
                  value={styleData.fontSize}
                  onChange={(e) => updateStyle('fontSize', parseInt(e.target.value) || 16)}
                  className="h-8"
                  min="8"
                  max="200"
                />
              </div>

              <div>
                <Label className="text-sm">Codificación</Label>
                <Select value={String(styleData.encoding)} onValueChange={(v) => updateStyle('encoding', parseInt(v) || 1)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 - ANSI</SelectItem>
                    <SelectItem value="1">1 - Predeterminado</SelectItem>
                    <SelectItem value="2">2 - Chino</SelectItem>
                    <SelectItem value="3">3 - Japonés</SelectItem>
                    <SelectItem value="4">4 - Coreano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Modificadores</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={styleData.bold}
                      onCheckedChange={(checked) => updateStyle('bold', checked)}
                    />
                    <Label className="text-xs">Negrita</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={styleData.italic}
                      onCheckedChange={(checked) => updateStyle('italic', checked)}
                    />
                    <Label className="text-xs">Cursiva</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={styleData.underline}
                      onCheckedChange={(checked) => updateStyle('underline', checked)}
                    />
                    <Label className="text-xs">Subrayado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={styleData.strikeout}
                      onCheckedChange={(checked) => updateStyle('strikeout', checked)}
                    />
                    <Label className="text-xs">Tachado</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colores y Efectos */}
          <div className="space-y-4">
            <h3 className="font-medium">Colores</h3>
            
            <div className="space-y-3">
              <ColorPicker
                label="Primario"
                value={styleData.colorPrimary}
                onChange={(color) => updateStyle('colorPrimary', color)}
              />
              <ColorPicker
                label="Secundario"
                value={styleData.colorSecondary}
                onChange={(color) => updateStyle('colorSecondary', color)}
              />
              <ColorPicker
                label="Contorno"
                value={styleData.colorOutline}
                onChange={(color) => updateStyle('colorOutline', color)}
              />
              <ColorPicker
                label="Sombra"
                value={styleData.colorShadow}
                onChange={(color) => updateStyle('colorShadow', color)}
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Efectos</h4>
              
              <div>
                <Label className="text-xs">Contorno: {styleData.outline}</Label>
                <Slider
                  value={[styleData.outline]}
                  onValueChange={([value]) => updateStyle('outline', value)}
                  max={10}
                  min={0}
                  step={0.1}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Sombra: {styleData.shadow}</Label>
                <Slider
                  value={[styleData.shadow]}
                  onValueChange={([value]) => updateStyle('shadow', value)}
                  max={10}
                  min={0}
                  step={0.1}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Alineación</h4>
              {getAlignmentGrid()}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Márgenes</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Izq.</Label>
                  <Input
                    type="number"
                    value={styleData.marginLeft}
                    onChange={(e) => updateStyle('marginLeft', parseInt(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Der.</Label>
                  <Input
                    type="number"
                    value={styleData.marginRight}
                    onChange={(e) => updateStyle('marginRight', parseInt(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Vert.</Label>
                  <Input
                    type="number"
                    value={styleData.marginVertical}
                    onChange={(e) => updateStyle('marginVertical', parseInt(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Transformaciones</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Escala X%</Label>
                  <Input
                    type="number"
                    value={styleData.scaleX}
                    onChange={(e) => updateStyle('scaleX', parseInt(e.target.value) || 100)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Escala Y%</Label>
                  <Input
                    type="number"
                    value={styleData.scaleY}
                    onChange={(e) => updateStyle('scaleY', parseInt(e.target.value) || 100)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Rotación</Label>
                  <Input
                    type="number"
                    value={styleData.rotation}
                    onChange={(e) => updateStyle('rotation', parseInt(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Espaciado</Label>
                  <Input
                    type="number"
                    value={styleData.spacing}
                    onChange={(e) => updateStyle('spacing', parseFloat(e.target.value) || 0)}
                    className="h-7 text-xs"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={styleData.spaceBox}
                onCheckedChange={(checked) => updateStyle('spaceBox', checked)}
              />
              <Label className="text-sm">Caja de fondo</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleApply}>
            Aplicar Estilo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
