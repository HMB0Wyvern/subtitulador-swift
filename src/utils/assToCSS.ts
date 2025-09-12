import { SubtitleStyles } from '@/services/api';

// ASS to CSS translation utilities
export interface CSSSubtitleStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  padding?: string;
  borderRadius?: string;
  textShadow: string;
  webkitTextStroke: string;
  position: 'absolute';
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  textAlign: 'left' | 'center' | 'right';
  transform: string;
  zIndex: number;
  whiteSpace: 'pre-line';
  userSelect: 'none';
  pointerEvents: 'none';
  lineHeight: string;
}

export class ASSToCSSConverter {
  // Convert subtitle styles to CSS properties for overlay rendering
  static stylesToCSS(styles: SubtitleStyles, containerWidth: number, containerHeight: number): CSSSubtitleStyle {
    const {
      fontFamily,
      fontSize,
      fontWeight,
      color,
      backgroundColor = 'transparent',
      outline,
      shadow,
      position
    } = styles;

    // Calculate position based on ASS positioning logic
    const horizontalPosition = this.calculateHorizontalPosition(
      position.horizontal,
      position.marginX,
      containerWidth
    );
    
    const verticalPosition = this.calculateVerticalPosition(
      position.vertical,
      position.marginY,
      containerHeight
    );

    // Generate text shadow for outline and shadow effects
    const textShadow = this.generateTextShadow(outline, shadow);

    const extra: any = {};
    const anyStyles = styles as any;
    if (anyStyles.backgroundPadding && this.normalizeColor(backgroundColor) !== 'transparent') {
      const p = anyStyles.backgroundPadding;
      extra.padding = `${p.top || 0}px ${p.right || 0}px ${p.bottom || 0}px ${p.left || 0}px`;
    }
    if (typeof anyStyles.backgroundRadius === 'number' && this.normalizeColor(backgroundColor) !== 'transparent') {
      extra.borderRadius = `${anyStyles.backgroundRadius}px`;
    }

    return {
      fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight,
      color: this.normalizeColor(color),
      backgroundColor: this.normalizeColor(backgroundColor),
      ...extra,
      textShadow,
      webkitTextStroke: `${outline.width}px ${this.normalizeColor(outline.color)}`,
      position: 'absolute',
      ...horizontalPosition,
      ...verticalPosition,
      textAlign: position.horizontal,
      transform: this.getTransform(position.horizontal),
      zIndex: 1000,
      whiteSpace: 'pre-line',
      userSelect: 'none',
      pointerEvents: 'none',
      lineHeight: '1.2'
    };
  }

  // Convert ASS color codes to CSS format
  static normalizeColor(color: string): string {
    // Handle ASS color format (&HBBGGRR& or #RRGGBB)
    if (color.startsWith('&H') && color.endsWith('&')) {
      // ASS format: &HBBGGRR&
      const hex = color.slice(2, -1);
      if (hex.length === 6) {
        // Convert BGR to RGB
        const bb = hex.slice(0, 2);
        const gg = hex.slice(2, 4);
        const rr = hex.slice(4, 6);
        return `#${rr}${gg}${bb}`;
      }
    }
    
    // Already in standard format or CSS color name
    return color;
  }

  // Calculate horizontal positioning
  private static calculateHorizontalPosition(
    horizontal: 'left' | 'center' | 'right',
    marginX: number,
    containerWidth: number
  ): { left?: string; right?: string } {
    switch (horizontal) {
      case 'left':
        return { left: `${marginX}px` };
      case 'right':
        return { right: `${marginX}px` };
      case 'center':
      default:
        return { 
          left: '50%',
          right: 'auto'
        };
    }
  }

  // Calculate vertical positioning
  private static calculateVerticalPosition(
    vertical: 'top' | 'center' | 'bottom',
    marginY: number,
    containerHeight: number
  ): { top?: string; bottom?: string } {
    switch (vertical) {
      case 'top':
        return { top: `${marginY}px` };
      case 'center':
        return { top: '50%' };
      case 'bottom':
      default:
        return { bottom: `${marginY}px` };
    }
  }

  // Generate text shadow CSS for outline and drop shadow
  private static generateTextShadow(
    outline: { width: number; color: string },
    shadow: { offsetX: number; offsetY: number; blur: number; color: string }
  ): string {
    const shadows = [];

    // Add outline shadow (multiple shadows for thickness)
    if (outline.width > 0) {
      const outlineColor = this.normalizeColor(outline.color);
      for (let x = -outline.width; x <= outline.width; x++) {
        for (let y = -outline.width; y <= outline.width; y++) {
          if (x !== 0 || y !== 0) {
            shadows.push(`${x}px ${y}px 0px ${outlineColor}`);
          }
        }
      }
    }

    // Add drop shadow
    if (shadow.offsetX !== 0 || shadow.offsetY !== 0 || shadow.blur > 0) {
      const shadowColor = this.normalizeColor(shadow.color);
      shadows.push(`${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadowColor}`);
    }

    return shadows.join(', ') || 'none';
  }

  // Get CSS transform for text alignment
  private static getTransform(horizontal: 'left' | 'center' | 'right'): string {
    switch (horizontal) {
      case 'center':
        return 'translateX(-50%)';
      case 'right':
        return 'translateX(0%)';
      case 'left':
      default:
        return 'translateX(0%)';
    }
  }
}

// Preset subtitle styles for common use cases
export const SUBTITLE_PRESETS = {
  social_media: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    outline: { width: 3, color: '#000000' },
    shadow: { offsetX: 2, offsetY: 2, blur: 4, color: 'rgba(0, 0, 0, 0.8)' },
    position: { horizontal: 'center' as const, vertical: 'bottom' as const, marginX: 0, marginY: 80 }
  },
  
  professional: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    outline: { width: 1, color: '#333333' },
    shadow: { offsetX: 1, offsetY: 1, blur: 2, color: 'rgba(0, 0, 0, 0.6)' },
    position: { horizontal: 'center' as const, vertical: 'bottom' as const, marginX: 0, marginY: 60 }
  },

  educational: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 20,
    fontWeight: '500',
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    outline: { width: 0, color: 'transparent' },
    shadow: { offsetX: 0, offsetY: 0, blur: 0, color: 'transparent' },
    position: { horizontal: 'center' as const, vertical: 'bottom' as const, marginX: 0, marginY: 40 }
  }
} as const;
